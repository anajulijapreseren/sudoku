import logging
import Controller.LoadSudoku.load_sudoku as loadsudoku
import Model.input_transform as transformsudoku

import bottle
from bottle import route
from bottle import static_file

#host css files which are invoked implicitly by html files.
@route('/View/<cssFile>')
def serve_css_files(cssFile):
    filePath = 'View'
    return static_file(cssFile, filePath)

#host js files which are invoked implicitly by html files.
@route('/View/<jsFile>')
def serve_js_files(jsFile):
    filePath = 'View'
    return static_file(jsFile, filePath)

# POST and GET section

@bottle.get('/')
def index(): 
    return bottle.template('View/sudoku.html')

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    # TODO - define log name to be in the current module directory
    logging.basicConfig(file='sudoku.log')
    logging.info("Sudoku main started")

    # load random sudoku
    # sudoku_tuple is list [0..1] that contains quiz and solution
    sudoku_tuple = loadsudoku.load_sudoku(loadsudoku.FILE_PUZZLE_NAME)
    logging.info("Sudoku quiz and solution loaded.")

    # transform sudoku to GUI format of quiz
    # old stuff sudokuGUI = transformsudoku.transform_sudoku_for_GUI(sudoku_tuple[0])
    sudokuGUI = sudoku_tuple[0]
    if sudokuGUI[len(sudokuGUI)-1]=='0':
        sudokuGUI[len(sudokuGUI)-1]="undefined"

    # start bottle
    logging.info("Starting bottle. Why not flask?")   
    bottle.run(reloader=True, debug=True) 



