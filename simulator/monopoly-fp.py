#!/usr/bin/env python3
##
## Example program to compute probablity of occupying spaces on standard 
## Monopoly board.  Based on project description by Andrew Pinzler
##  http://www.pinzler.com/monopoly.html
##
## Python code by Clay Breshears (Intel)  30 MAR 2016
##
import sys

def matvec(T, B):
	C = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
	for i in range(0,41):
		for j in range(0,41):
			C[j] += B[i] * T[i][j]
	return C

def diff(A, B):
	for i in range(0,41):
		if abs(A[i] - B[i]) > sys.float_info.epsilon:
			return False
	return True

properties = ["Go", "Mediterranean Avenue", "Community Chest", "Baltic Avenue", "Income Tax", "Reading Railroad", "Oriental Avenue", "Chance", "Vermont Avenue", "Connecticut Avenue", "Just Visiting", "St. Charles Place", "Electric Company", "States Avenue", "Virginia Avenue", "Pennsylvania Railroad", "St. James Place", "Community Chest", "Tennessee Avenue", "New York Avenue", "Free Parking", "Kentucky Avenue", "Chance", "Indiana Avenue", "Illinois Avenue", "B&O Railroad", "Atlantic Avenue", "Ventnor Avenue", "Water Works", "Marvin Gardens", "Go To Jail", "Pacific Avenue", "North Carolina Avenue", "Community Chest", "Pennsylvania Avenue", "Short Line", "Chance", "Park Place", "Luxury Tax", "Boardwalk", "In Jail"]
print(len(properties))

transition = []
for i in range(0, 41):
	transition.append([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0])

## Initial dice rolls around board

for i in range(0, 41):
	transition[i][(i+2)%41]  = 1.0 / 36.0
	transition[i][(i+3)%41]  = 1.0 / 18.0
	transition[i][(i+4)%41]  = 1.0 / 12.0
	transition[i][(i+5)%41]  = 1.0 /  9.0
	transition[i][(i+6)%41]  = 5.0 / 36.0
	transition[i][(i+7)%41]  = 1.0 /  6.0
	transition[i][(i+8)%41]  = 5.0 / 36.0
	transition[i][(i+9)%41]  = 1.0 /  9.0
	transition[i][(i+10)%41] = 1.0 / 12.0
	transition[i][(i+11)%41] = 1.0 / 18.0
	transition[i][(i+12)%41] = 1.0 / 36.0

## Dice rolls from JAIL same as "Just Visiting"
for j in range(0, 41):
	transition[40][j] = transition[10][j] 

## Remove "Phantom" JAIL state on dice rolls
transition[28][0] = transition[28][40]
transition[28][40] = 0.0
for p in range(29, 40):
	t = p-28
	for i in range(t,0,-1):
		transition[p][i] = transition[p][i-1]
	transition[p][0] = transition[p][40]
	transition[p][40] = 0.0

## Community Chest [2,17,33] Cards - Move to GO [0], Go to Jail [40]

for i in range(0, 41):
	X = transition[i][2]	## probability to land on Community Chest [2]
	transition[i][0] += X / 16.0
	transition[i][40] += X / 16.0
	transition[i][2] *= 14.0 / 16.0

	X = transition[i][17]	## probability to land on Community Chest [17]
	transition[i][0] += X / 16.0
	transition[i][40] += X / 16.0
	transition[i][17] *= 14.0 / 16.0

	X = transition[i][33]	## probability to land on Community Chest [33]
	transition[i][0] += X / 16.0
	transition[i][40] += X / 16.0
	transition[i][33] *= 14.0 / 16.0

## Chance [7,22,36] Cards - Move to GO [0], Go to Jail [40], 
##                St. Charles Place [11], Nearest Utility [12, 28], 
##                Illinois Ave. [24], Boardwalk [39], Reading Railroad [5], 
##                Go back 3 spaces [4,19,33], (2X) Nearest Railroad [15,25,5]

for i in range(0, 41):
	X = transition[i][7]	## probability to land on Chance [7]
	transition[i][0]  += X / 16.0	# Go
	transition[i][40] += X / 16.0	# Jail
	transition[i][11] += X / 16.0	# St. Charles
	transition[i][12] += X / 16.0	# Utility - Electric
	transition[i][24] += X / 16.0	# Illinois
	transition[i][39] += X / 16.0	# Boardwalk
	transition[i][5]  += X / 16.0	# Reading RR
	transition[i][4]  += X / 16.0	# Back 3
	transition[i][15] += (2.0 * X) / 16.0	# Nearest RR - Penn

	transition[i][7] *= 6.0 / 16.0


	X = transition[i][22]	## probability to land on Chance [22]
	transition[i][0]  += X / 16.0	# Go
	transition[i][40] += X / 16.0	# Jail
	transition[i][11] += X / 16.0	# St. Charles
	transition[i][28] += X / 16.0	# Utility - Water
	transition[i][24] += X / 16.0	# Illinois
	transition[i][39] += X / 16.0	# Boardwalk
	transition[i][5]  += X / 16.0	# Reading RR
	transition[i][19] += X / 16.0	# Back 3
	transition[i][25] += (2.0 * X) / 16.0	# Nearest RR - B&O

	transition[i][22] *= 6.0 / 16.0


	X = transition[i][36]	## probability to land on Chance [36]
	transition[i][0]  += X / 16.0	# Go
	transition[i][40] += X / 16.0	# Jail
	transition[i][11] += X / 16.0	# St. Charles
	transition[i][12] += X / 16.0	# Utility - Electric
	transition[i][24] += X / 16.0	# Illinois
	transition[i][39] += X / 16.0	# Boardwalk
	transition[i][5]  += X / 16.0	# Reading RR
	transition[i][33] += X / 16.0	# Back 3
	transition[i][5]  += (2.0 * X) / 16.0	# Nearest RR - Reading

	transition[i][36] *= 6.0 / 16.0

## GO TO JAIL [30]

for i in range(0, 41):
	transition[i][40] += transition[i][30]
	transition[i][30] = 0.0


start = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

A1 = matvec(transition, start) ## First roll
A2 = matvec(transition, A1) ## Second roll

## Triple Doubles - Go to Jail [40]
## Apply after third roll

for i in range(0, 41):
	for j in range(0,41):
		transition[i][j] *= 215.0 / 216.0
	transition[i][40] += 1.0 / 216.0

A3 = matvec(transition, A2)  ## Third Roll
rolls = 3

done = False
while not done:
	A3 = matvec(transition, A2) 
	done = diff(A3, A2)
	A2 = A3
	rolls += 1

print("Final vector (", rolls, "):")
print(A3)
print()

for i in range(11):
	print(int(A3[i]*100000)/1000.00, properties[i])
print(int(A3[40]*100000)/1000.00, properties[40])
for i in range(11,40):
	print(int(A3[i]*100000)/1000.00, properties[i])