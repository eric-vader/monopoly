import monopoly
import json

def generate_locations(countries = ['uk', 'usa', 'singapore']):
    for c in countries:
        s = monopoly.Monopoly(c)
        with open(f'locations-{c}.json', 'w') as f:
            f.write(json.dumps(s, cls=monopoly.MonopolyEncoder, indent=2))

def generate_probabilities(n_rounds, n_turns, random_seed=1):
    m = monopoly.Simulation(n_rounds, n_turns, random_seed)
    m.run()
    
    sr = monopoly.SimulationResult(n_rounds=m.n_rounds,
        n_turns_hist = {m.n_turns: m.n_rounds},
        random_seed = random_seed)

    for i in range(40):
        sr.add_metric(i, 'n_landings', m.total_count_landings[i])
        sr.add_metric(i, 'p_landings', m.p_landings[i])

    with open(f'probabilities-{random_seed}.json', 'w') as f:
        f.write(json.dumps(sr, cls=monopoly.MonopolyEncoder, indent=2))

