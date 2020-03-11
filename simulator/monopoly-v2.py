import random
from random import choices

population = [0,3,4,5,6,7,8,9,10,11]
weights = [6.0/36, 2.0/36, 2.0/36, 4.0/36, 4.0/36, 6.0/36, 4.0/36, 4.0/36, 2.0/36, 2.0/36]

def double_dice_roll(n):
    return choices(population, weights, k=n)
    
def dice(n):
    return [random.randint(1, 6) + random.randint(1, 6) for _ in range(n)]
    
def monop(finish_order=6,games_order=3):
    
    finish = 10**finish_order
    games = 10**games_order
    
    import random
    from random import shuffle
    
    squares = []
    
    while len(squares) < 40:
        squares.append(0)
    
    # roll values are values from a six by six grid for all dice rolls
    for games_finished in range(games):
        
        master_chest = [0,40,40,40,40,10,40,40,40,40,40,40,40,40,40,40]
        chest = [i for i in master_chest]
        shuffle(chest)
        
        master_chance = [0,24,11,'U','R',40,40,'B',10,40,40,5,39,40,40,40]
        chance = [i for i in master_chance]
        shuffle(chance)
        
        doubles = 0
        position = 0

        for diceroll in double_dice_roll(finish):
            
            if diceroll == 0:
                doubles += 1
            else:
                doubles = 0
                
            if doubles >= 3:
                position = 10
            else:
                position = (position + diceroll)%40
                
                if position in [7,22,33]:  # Chance
                    chance_card = chance.pop(0)
                    if len(chance) == 0:
                        chance = [i for i in master_chance]
                        shuffle(chance)
                    if chance_card != 40:
                        
                        if isinstance(chance_card,int):
                            position = chance_card
                        elif chance_card == 'U':
                            while position not in [12,28]:
                                position = (position + 1)%40
                        elif chance_card == 'R':
                            while position not in [5,15,25,35]:
                                position = (position + 1)%40
                        elif chance_card == 'B':
                            position = position - 3
                            
                elif position in [2,17]:  # Community Chest
                    chest_card = chest.pop(0)
                    if len(chest) == 0:
                        chest = [i for i in master_chest]
                        shuffle(chest)
                    if chest_card != 40:
                        position = chest_card
                        
                if position == 30: # Go to jail
                    position = 10
                    
                    
            squares.insert(position,(squares.pop(position)+1))

    return squares


m_count = monop(6,3)
s = float(sum(m_count))
p = list(map(lambda c: c/s*100, m_count))

print(p)

'''
import random
from collections import defaultdict
N = 10000000
#rolls = dice(N)
rolls = double_dice_roll(N)

hist_rolls = defaultdict(int)

for r in rolls:
    hist_rolls[r] += 1
    
s = float(sum(hist_rolls.values()))
for k in hist_rolls.keys():
    hist_rolls[k] = hist_rolls[k]/s*100

print(hist_rolls)

from collections import Counter
possibilities = []
for x in range(1,7):
    for y in range(1,7):
        if x==y:
            possibilities.append(0)
        else:
            possibilities.append(x+y)
        
print(Counter(possibilities))
'''
