import random
import string
import logging
import globalvars

# this method is based on pynative https://pynative.com/python-generate-random-string/
def get_random_cookie():
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(10))
    # print("Random string of length", 10, "is:", result_str)
    return result_str

# creates new empty dictionary entry with given cookie if cookie does not exist
# if cookie exists, return False, otherwise retrun True
def create_cookie_in_dictionary(cookie):
    temp = globalvars.dictionary.get(cookie)
    if temp == None:
        globalvars.dictionary[cookie] = ["", ""]
        return True
    else:
        logging.error("Cookie already exists in dictionary.")
        return False

# updates dictionary quiz or solution entry with given cookie if cookie exists
# if cookie exists, returns True, otherwise retruns False
# inputs:
# - cookie is user supplied cookie
# - quiz_solution, representing quiz or solution
# - qs, parameter to define if we need quiz (qs=0) or solution (qs=1)
# outputs:
# - bool
def update_quiz_or_solution_in_dictionary(cookie, quiz_solution, qs):
    temp = globalvars.dictionary.get(cookie)
    if temp != None:
        globalvars.dictionary[cookie][qs] = quiz_solution
        return True
    else:
        logging.error("Quiz or solution for given cookie not found.")
        return False

# reads quiz or solution for dictionary
# inputs:
# - cookie is user supplied cookie
# - qs, parameter to define if we need quiz (qs=0) or solution (qs=1)
# outputs:
# - string, respresentig quiz or solution, or empty list if no cookie entry exists
def read_quiz_or_solution_from_dictionary(cookie, qs):
    temp = globalvars.dictionary.get(cookie)
    if temp != None:
        return temp[qs]
    else:
        logging.error("Quiz or solution for given cookie not found.")
        return []