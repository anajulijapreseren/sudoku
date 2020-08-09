# randomly loads sudoku quiz and solution to local variables quiz, solution
import random

SUDOKU_ELEMENTS = 81
SUDOKU_ELEM_IN_ROW = 9
NUM_PUZZELS = 1000000 # number of sudoku puzzles in file puzzle name
FILE_PUZZLE_NAME = "sudoku.csv"

# loads sudoku quiz and solution
# input:
# - sudoku file name with N predefined sudokus
# output:
# - quiz, array 9x9 of ciphers
# - solution, array 9x9 of ciphers
def load_sudoku(sudoku_file_name):
    # determine random sudoku quiz number to load
    random.seed(a=None, version=2)
    quiz_number = random.randint(1,NUM_PUZZELS)
    # load that sudoku quiz and solution from sudoku file
    quiz = [0] * SUDOKU_ELEMENTS
    solution = [0] * SUDOKU_ELEMENTS
    for i, line in enumerate(open(FILE_PUZZLE_NAME, 'r').read().splitlines()[1:]):
        if i==quiz_number:
            quiz_temp, solution_temp = line.split(",")
            for j, q_s in enumerate(zip(quiz_temp, solution_temp)):
                q, s = q_s
                quiz[j] = int(q)
                solution[j] = int(s)
            break
    return quiz, solution

