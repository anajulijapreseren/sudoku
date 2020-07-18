# randomly loads sudoku quiz and solution to local variables quiz, solution
import numpy as np
import random

NUM_PUZZELS = 1000000 # number of sudoku puzzles in file puzzle name
FILE_PUZZLE_NAME = "sudoku.csv"

def load_sudoku(sudoku_file_name):
    # determine random sudoku quiz number to load
    random.seed(a=None, version=2)
    quiz_number = random.randint(1,NUM_PUZZELS)
    # load that sudoku quiz and solution from sudoku file
    quiz = np.zeros((1,81), np.int32)
    solution = np.zeros((1,81), np.int32)
    for i, line in enumerate(open(FILE_PUZZLE_NAME, 'r').read().splitlines()[1:]):
        if i==quiz_number:
            quiz_temp, solution_temp = line.split(",")
            for j, q_s in enumerate(zip(quiz_temp, solution_temp)):
                q, s = q_s
                quiz[1, j] = q
                solution[1, j] = s
            break
    quiz = quiz.reshape((-1, 9, 9))
    solution = solution.reshape((-1, 9, 9))