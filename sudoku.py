import logging
import Controller.LoadSudoku.load_sudoku as loadsudoku
import Model.input_transform as transformsudoku

import bottle
from bottle import route
from bottle import static_file
from bottle import request

import json

import Model.cookies as cookies

COOKIE = 'oreo'
SECRET = 'zmajisokul'

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
    # define global varables
    # TODO these 2 will probably not be global variables anymore
    global sudokuGUI
    global sudokuSolution
    # check for cookie in get. If cookie is present, then load sudoku from internal variable
    # otherwise load new sudoku
    cookie = bottle.request.get_cookie(COOKIE, secret=SECRET)
    if cookie == None:
        # create new coookie
        cookie = cookies.get_random_cookie()
        # set new cookie
        bottle.response.set_cookie(COOKIE, cookie, path='/', secret=SECRET)
        # load random sudoku
        # sudoku_tuple is list [0..1] that contains quiz and solution
        sudoku_tuple = loadsudoku.load_sudoku(loadsudoku.FILE_PUZZLE_NAME)
        logging.info("Sudoku quiz and solution loaded.")

        # transform sudoku to GUI format of quiz
        sudokuGUI = transformsudoku.transform_sudoku_for_GUI(sudoku_tuple[0])
        sudokuSolution = transformsudoku.transform_sudoku_for_GUI(sudoku_tuple[1])

        # TODO save cookie, quiz and solution to sudoku field in all_sudokus
    else:
        # TODO take cookie and search all_sudokus for match and load quiz and solution
        pass
    return json.dumps({"sudoku" : sudokuGUI})

@bottle.post('/numentry')
def num_entry():
    postdata = request.body.read().decode("utf-8")
    jsondata = json.loads(postdata)
    cellId = jsondata["cellId"]
    num = jsondata["number"]
    # let´s update sudokuGUI with entered value
    sudokuGUI[cellId] = num

 # endpoint to verify the solution, does current state matches the solution
@bottle.get('/checksolution') 
def check_solution():
    checked_list = []
    finished = False
    if sudokuGUI == sudokuSolution:
        finished = True
    else:
        for i in range(0,loadsudoku.SUDOKU_ELEMENTS):
            if sudokuGUI[i] == sudokuSolution[i]:
                checked_list.append(1)
            else:
                checked_list.append(0)
    return json.dumps({"finished" : finished, "list" : checked_list})





if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    # TODO - define log name to be in the current module directory
    logging.basicConfig(file='sudoku.log')
    logging.info("Sudoku main started")

    # start bottle
    logging.info("Starting bottle. Why not flask?")   
    bottle.run(reloader=True, debug=True) 



