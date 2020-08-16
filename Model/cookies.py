import random
import string

# this method is based on pynative https://pynative.com/python-generate-random-string/
def get_random_cookie():
    letters = string.ascii_lowercase
    result_str = ''.join(random.choice(letters) for i in range(10))
    # print("Random string of length", 10, "is:", result_str)
    return result_str
