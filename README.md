# Sudoku
SUDOKU lets the user solve sudoku game using web browser.
The game uses predefined sudokus and their solutions, stored in local file sudoku.csv
This is a multiuser game, where each user is identified via cookie.
User may interupt the game anytime and the game status is stored for playing later.
User may check his current solution using corresponding check button.
User may load another sudoku game using corresponding check button.

User access the game at localhost:8080

## How to run program
- Have Python 3.x version installed
- Run sudoku.py
- Using web browser go to localhost:8080

## Inputing and deleting Sudoku numbers
User inputs numbers in sudoku grid by clicking on selected cell and then pressing key. Program only allows number between 1 and 9, other inputs are deleted. User deletes numbers when he presses backspace. Numbers are saved in sudoku grid when user clicks on another cell or presses enter.

## Buttons
1. New sudoku 
If user clicks "New sudoku" button, he will get new sudoku

2. Check
Empty or wrong cells are marked with different colour

3. Clear check
Makes coloured cells white again
Note: User has to use this function before clicking on Check button again.

## Cookies
New user gets new cookie that exipires in a year from when it was assigned.
If the user already has a cookie, he keeps the same cookie and gets his sudoku in the same state he left it.
When user refreshes browser window, or closes and reopens browser window, he will get current status of sudoku quiz (Under conditon that user did not remove cookies). If user wants a new sudoku, he needs to click "new sudoku" button

## Program structure
- sudoku.py is serving as main module receiving GET and POST requests from browser and then invoking Model methods for handling sudoku solution and user cookies
- MODEL contains modules for executing sudoku logic
- VIEW contains HTML/CSS/JS code for handling the game GUI in browser

## Sources
1. Sudoku quiz and solution csv file has been downloaded from [Kaggle](https://www.kaggle.com/bryanpark/sudoku/data)
2. HTML/CSS/JS has been forked from [Github](https://github.com/pocketjoso/sudokuJS)


