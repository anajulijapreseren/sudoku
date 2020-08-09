def transform_sudoku_for_GUI(sudoku_in):
    sudoku = []
    for num in sudoku_in:
        if num != 0:
            sudoku.append(num)
        else:
            sudoku.append('')
    if sudoku[len(sudoku)-1] == '':
        sudoku[len(sudoku)-1]="undefined"
    return sudoku