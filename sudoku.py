import logging
import Controller.LoadSudoku.load_sudoku as loadsudoku
import Model.input_transform as transformsudoku

import bottle
from bottle import route
from bottle import static_file
from bottle import request

import json

import Model.cookies as cookies

import Model.globalvars as globalvars

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

@bottle.get('/getmysudoku')
def getmy_sudoku():
    # define local varables
    # sudokuGUI
    # sudokuSolution
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

        #save cookie, quiz and solution to sudoku field in all_sudokus
        if cookies.create_cookie_in_dictionary(cookie):
            cookies.update_quiz_or_solution_in_dictionary(cookie, sudokuGUI, 0)
            cookies.update_quiz_or_solution_in_dictionary(cookie, sudokuSolution, 1)
        else:
            logging.error("This cookie exists in dictionary. Something very wrong!")
            sudokuGUI = []
    else:
        # get sudoku quiz for this user
        sudokuGUI = cookies.read_quiz_or_solution_from_dictionary(cookie, 0)
        if sudokuGUI == []:
            logging.Error("Quiz not found for given user!")
            # TODO how can I report to GUI there is an error and create user pop-up there
    return json.dumps({"sudoku" : sudokuGUI}) 

@bottle.post('/numentry')
def num_entry():
    cookie = bottle.request.get_cookie(COOKIE, secret=SECRET)
    if cookie != None:
        sudokuGUI = cookies.read_quiz_or_solution_from_dictionary(cookie,0)
        if sudokuGUI != []:
            postdata = request.body.read().decode("utf-8")
            jsondata = json.loads(postdata)
            cellId = jsondata["cellId"]
            num = jsondata["number"]
            # let´s update sudokuGUI with entered value
            sudokuGUI[cellId] = num
            cookies.update_quiz_or_solution_in_dictionary(cookie, sudokuGUI, 0)
        else:
            logging.error("Sudoku quiz not found for given cookie!")
            # TODO - figure out the way to respond with error to POST to let the browser know it created a mess
    else:
        logging.error("Cookie is missing!")
        # TODO respond with error to POST to let the browser know it created a mess


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

    # initialize global variables
    globalvars.init()
    logging.info("Global vars loaded")

    # start bottle 
    bottle.run(reloader=True, debug=True)
    logging.info("Starting bottle. Why not flask?")  





