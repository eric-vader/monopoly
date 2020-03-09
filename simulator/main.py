import csv
import os
import importlib
import monopoly

monopoly_module = importlib.import_module('monopoly')

m_locations = []
with open(os.path.join("data", "singapore.csv")) as csv_file:
    d_reader = csv.DictReader(csv_file)
    for row in d_reader:
        # Clean out all empty values with their keys
        row = { k:row[k] for k in row if row[k] }
        try:
            class_ = getattr(monopoly_module, row['Type'])
            del row['Type']
            m_locations.append(class_(**row))
        except AttributeError as e:
            del row['Type']
            m_locations.append(monopoly.Location(**row))

m_board = monopoly.MonopolyBoard(10**4, 10**7)
m_board.run()