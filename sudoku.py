import logging
import Controller.LoadSudoku.load_sudoku as loadsudoku

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    # TODO - define log name to be in the current module directory
    logging.basicConfig(file='sudoku.log')
    logging.info("Sudoku main started")

    # load random sudoku
    sudoku_tuple = loadsudoku.load_sudoku(loadsudoku.FILE_PUZZLE_NAME)
    logging.info("Sudoku quiz and solution loaded.")

    # show sudoku quiz and handle user inputs

