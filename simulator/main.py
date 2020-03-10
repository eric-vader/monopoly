import monopoly
import json

def generate_locations(countries = ['uk', 'usa', 'singapore']):
    for c in countries:
        s = monopoly.Monopoly(c)
        with open(f'locations-{c}.json', 'w') as f:
            f.write(json.dumps(s, cls=monopoly.MonopolyEncoder, indent=2))

def generate_probabilities():
    m_board = monopoly.Simulation(10**3, 10**6, random_seed=1)
    m_board.run()

generate_probabilities()