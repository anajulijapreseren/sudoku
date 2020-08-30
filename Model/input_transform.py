def transform_sudoku_for_GUI(sudoku_in):
    sudoku = []
    for num in sudoku_in:
        if num != 0:
            sudoku.append(num)
        else:
            sudoku.append('')
    return sudoku