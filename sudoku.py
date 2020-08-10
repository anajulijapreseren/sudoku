import logging
import Controller.LoadSudoku.load_sudoku as loadsudoku
import Model.input_transform as transformsudoku

import bottle
from bottle import route
from bottle import static_file
from bottle import request

import json

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

@bottle.get('/newsudoku')
def new_sudoku():
    # load random sudoku
    # sudoku_tuple is list [0..1] that contains quiz and solution
    sudoku_tuple = loadsudoku.load_sudoku(loadsudoku.FILE_PUZZLE_NAME)
    logging.info("Sudoku quiz and solution loaded.")

    # transform sudoku to GUI format of quiz
    sudokuGUI = transformsudoku.transform_sudoku_for_GUI(sudoku_tuple[0])
    
    return json.dumps({"sudoku" : sudokuGUI})

@bottle.post('/numentry')
def num_entry():
    postdata = request.body.read().decode("utf-8")
    jsondata = json.loads(postdata)
    cellId = jsondata["cellId"]
    num = jsondata["number"]


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    # TODO - define log name to be in the current module directory
    logging.basicConfig(file='sudoku.log')
    logging.info("Sudoku main started")

    # start bottle
    logging.info("Starting bottle. Why not flask?")   
    bottle.run(reloader=True, debug=True) 



