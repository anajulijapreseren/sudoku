import logging
import json

dictionary = {}

DICTIONARY_FILE_NAME = "sudoku_dictionary.json"

# TODO we are saving dictionary to file which does not handle multiple requests
# we shall probably use some lite SQL like SQLite

def load_dictionary():
    file_load = open(DICTIONARY_FILE_NAME, "r")
    output = file_load.read()
    file_load.close()
    return output
    
def store_dictionary(dictionary):
    file_write = open(DICTIONARY_FILE_NAME, "w")
    json.dump(dictionary, file_write)
    file_write.close()
    logging.info("Dictionary stored to disk!")