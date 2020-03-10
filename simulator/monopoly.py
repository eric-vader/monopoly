from multiprocessing.pool import Pool
import multiprocessing
import random
from random import choices
import operator

import json
class MonopolyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Location): 
            return obj.__dict__
        elif isinstance(obj, Monopoly): 
            return obj.__dict__
        elif isinstance(obj, SimulationResult): 
            return obj.__dict__
        return json.JSONEncoder.default(self, obj)

CHANCE_LOCATIONS = set([7,22,33])
CHEST_LOCATIONS = set([2,17])
UTILITY_LOCATIONS = set([12,28])
RAIL_LOCATIONS = set([5,15,25,35])

'''
def go_to_nearest(LOCATION, position):
    vals = list(map(operator.abs, [ l-position for l in LOCATION ]))
    closest_i = min(range(len(vals)), key=vals.__getitem__)
    return LOCATION[closest_i]
'''

def go_to_nearest(LOCATION, position):
    while position not in LOCATION:
        position = (position + 1)%40
    return position


N_MONOPOLY_LOCATIONS = 40
CHEST = [0,40,40,40,40,10,40,40,40,40,40,40,40,40,40,40]

# Advance token to nearest Utility. If unowned, you may buy it from the Bank. If owned, throw dice and pay owner a total 10 times the amount thrown. (Mr. Monopoly trudges along with a huge battleship token on his back)
CHANCE_U = -1
# Advance token to the nearest Railroad and pay owner twice the rental to which he/she {he} is otherwise entitled.
CHANCE_R = -2
# Go Back Three {3} Spaces. (Mr. Monopoly is hauled back by a cane hooked around his neck) {Presumably an allusion to amateur nights at theaters}
CHANCE_B = -3
# The rest encodes the exact places that 
CHANCE = [0,24,11,CHANCE_U,CHANCE_R,40,40,CHANCE_B,10,40,40,5,39,40,40,40]

class Location(object):
    def __init__(self, ID, Name, Type):
        self.ID = int(ID)
        self.Name = Name
        self.Type = Type

class Property(Location):
    def __init__(self, Price, Mortgage, **kwargs):
        super(Property, self).__init__(**kwargs)
        self.Price = int(Price)
        self.Mortage = int(Mortgage)

class Street(Property):
    def __init__(self, Color, House_Price, Rent, Rent_1, Rent_2, Rent_3, Rent_4, Rent_5, **kwargs):
        super(Street, self).__init__(**kwargs)
        self.Color = Color
        self.House_Price = int(House_Price)
        self.Rent = list(map(int, [ Rent, Rent_1, Rent_2, Rent_3, Rent_4, Rent_5 ]))

class Railroad(Property):
    def __init__(self, Rent_1, Rent_2, Rent_3, Rent_4, **kwargs):
        super(Railroad, self).__init__(**kwargs)
        self.Rent = list(map(int, [ Rent_1, Rent_2, Rent_3, Rent_4 ]))
        
class Utility(Property):
    def __init__(self, Rent_1, Rent_2, **kwargs):
        super(Utility, self).__init__(**kwargs)
        self.Multiplier = list(map(int, [Rent_1[1:], Rent_2[1:]]))

# Fast Dice roll
population = [0,3,4,5,6,7,8,9,10,11]
weights = [6.0/36, 2.0/36, 2.0/36, 4.0/36, 4.0/36, 6.0/36, 4.0/36, 4.0/36, 2.0/36, 2.0/36]

def roll_dice(n):
    return choices(population, weights, k=n)

'''
from itertools import accumulate
cum_weights = list(accumulate(weights))
import bisect
def roll_dice(n):
    return [ population[bisect.bisect_left(cum_weights, random.random())] for i in range(n) ]
'''

'''
def roll_dice_1(self, n):
    r = [(random.randint(1, 6), random.randint(1, 6)) for _ in range(n)]
    return [ 0 if x==y else x+y for x,y in r ]
'''
import csv
import os
import importlib
import json
class Monopoly(object):
    def __init__(self, country):
        monopoly_module = importlib.import_module('monopoly')
        self.country = country
        self.locations = list()
        with open(os.path.join("data", "{}.csv".format(country))) as csv_file:
            d_reader = csv.DictReader(csv_file)
            for row in d_reader:
                # Clean out all empty values with their keys
                row = { k:row[k] for k in row if row[k] }
                try:
                    class_ = getattr(monopoly_module, row['Type'])
                    m_obj = class_(**row)
                except AttributeError as e:
                    m_obj = Location(**row)
                self.locations.append(m_obj)

class SimulationResult(object):
    def __init__(self, n_rounds, n_turns_hist, random_seed):
        self.n_rounds = n_rounds
        self.n_turns_hist = n_turns_hist
        self.random_seed = random_seed
        self.locations = [ {"ID": i} for i in range(40) ]
    def add_metric(self, ID, metric_name, metric):
        self.locations[ID][metric_name] = metric

class Simulation(object):
    def __init__(self, n_rounds, n_turns, random_seed=None, n_procs=multiprocessing.cpu_count()):
        self.n_rounds = n_rounds
        self.n_turns = n_turns
        self.n_procs = n_procs
        self.random_seed = random_seed
        random.seed(random_seed)
    def collect_count_landings(self, count_landings):
        self.total_count_landings = list(map(operator.add, self.total_count_landings, count_landings))
        #self.total_count_landings = [ a+b for a,b in zip(self.total_count_landings, count_landings) ]
    def run(self):
        self.total_count_landings = [ 0 ] * N_MONOPOLY_LOCATIONS
        pool = Pool(self.n_procs)

        q, r = divmod(self.n_rounds, self.n_procs)
        n_subrounds = [ q ] * self.n_procs
        n_subrounds[0] += r

        semas = [ pool.apply_async(self.run_round, (n_subround,), callback=self.collect_count_landings) for n_subround in n_subrounds ]

        # Adding on demand to be faster, we know that this is atomic so not a problem
        for s in semas:
            s.wait()
        
        #self.total_count_landings = list(map(sum, zip(*pool.map(self.run_round, n_subrounds))))
        #self.total_count_landings = [ sum(c) for c in zip(*pool.map(self.run_round, n_subrounds)) ]

        assert(sum(self.total_count_landings) == (self.n_rounds * self.n_turns))
        self.p_landings = [ l / (self.n_rounds * self.n_turns) * 100 for l in self.total_count_landings ]
    def run_round(self, n_subround=1):
        count_landings = [ 0 ] * N_MONOPOLY_LOCATIONS
            
        chest = CHEST.copy()
        chance = CHANCE.copy()

        for r in range(n_subround):
            
            doubles = 0
            position = 0

            chest_i = 0
            chance_i = 0

            random.shuffle(chest)
            random.shuffle(chance)
            
            for dice_roll_result in roll_dice(self.n_turns):

                if dice_roll_result == 0:
                    doubles += 1
                else:
                    doubles = 0
                    
                if doubles >= 3:
                    position = 10
                else:
                    position = (position + dice_roll_result)%40
                    
                    if position in CHANCE_LOCATIONS:  # Chance
                        chance_card = chance[chance_i]
                        chance_i += 1
                        if chance_i >= len(chance):
                            random.shuffle(chance)
                            chance_i = 0
                        if chance_card != 40:
                            if chance_card == CHANCE_U:
                                position = go_to_nearest(UTILITY_LOCATIONS, position)
                            elif chance_card == CHANCE_R:
                                position = go_to_nearest(RAIL_LOCATIONS, position)
                            elif chance_card == CHANCE_B:
                                position -= - 3
                            else:
                                position = chance_card    

                    elif position in CHEST_LOCATIONS:  # Community Chest
                        chest_card = chest[chest_i]
                        if chest_i >= len(chest):
                            random.shuffle(chest)
                            chest_i = 0
                        if chest_card != 40:
                            position = chest_card
                            
                    if position == 30: # Go to jail
                        position = 10

                count_landings[position] += 1
        
        return count_landings
    