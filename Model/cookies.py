import random
import string

# this method is based on pynative https://pynative.com/python-generate-random-string/
def get_random_cookie():
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(10))
    # print("Random string of length", 10, "is:", result_str)
    return result_str

def create_cookie_in_dictionary(cookie):

def update_quiz_in_dictionary(cookie, quiz):

def update_solution_to_dictionary(cookie, solution)

def read_quiz_from_dictionary(cookie):

def read_solution_from_dictionary(cookie):