// based on:
// sudokuJS v0.4.4
// https://github.com/pocketjoso/sudokuJS
// Author: Jonas Ohlsson
// License: MIT

(function (window, $, undefined) {
	'use strict';

	/**
	* Define a jQuery plugin
	*/
    $.fn.sudokuJS = function(opts) {

		/*
		 * variables
		 *-----------*/
		opts = opts || {};

		var	board = [],
			boardSize,
			boardNumbers, // array of 1-9 by default, generated in initBoard

		//indexes of cells in each house - generated on the fly based on boardSize
			houses = [
				//hor. rows
				[],
				//vert. rows
				[],
				//boxes
				[]
			];

		/*
		 * selectors
		 *-----------*/
		 var $board = $(this),
			$boardInputs; //created

		 /*
		 * methods
		 *-----------*/
		 //shortcut for logging..
		function log(msg){
			if(window.console && console.log)
			 console.log(msg);
		}

		/* generateHouseIndexList
		 * -----------------------------------------------------------------*/
		var generateHouseIndexList = function(){
    
			var boxSideSize = Math.sqrt(boardSize);

			for(var i=0; i < boardSize; i++){
				var hrow = []; //horisontal row
				var vrow = []; //vertical row
				var box = [];
				for(var j=0; j < boardSize; j++){
					hrow.push(boardSize*i + j);
					vrow.push(boardSize*j + i);

					if(j < boxSideSize){
						for(var k=0; k < boxSideSize; k++){
							var a = Math.floor(i/boxSideSize) * boardSize * boxSideSize;
							var b = (i%boxSideSize) * boxSideSize;
							var boxStartIndex = a +b; 

							box.push(boxStartIndex + boardSize*j + k);
						}
					}
				}
				houses[0].push(hrow);
				houses[1].push(vrow);
				houses[2].push(box);
			}
		};


		/* initBoard
		 * --------------
		 *  inits board, variables.
		 * -----------------------------------------------------------------*/
		var initBoard = function(opts){
			var nullCandidateList = [];
      		boardNumbers = [];
			boardSize = (!board.length && opts.boardSize) || Math.sqrt(board.length) || 9;
			$board.attr("data-board-size", boardSize);
	
			generateHouseIndexList();

				for(var j=0; j < boardSize*boardSize ; j++){
					var cellVal = (typeof board[j] === "undefined") ? null : board[j];
					board[j] = {
						val: cellVal,
					};
				}
		};

		/* renderBoard
		 * --------------
		 *  dynamically renders the board on the screen (into the DOM), based on board variable
		 * -----------------------------------------------------------------*/
		var renderBoard = function(){
			var htmlString = "";
			for(var i=0; i < boardSize*boardSize; i++){
				htmlString += renderBoardCell(board[i], i);

				if((i+1) % boardSize === 0) {
					htmlString += "<br>";
				}
			}
			
			$board.append(htmlString);

			//save important board elements
			$boardInputs = $board.find("input");
		};

		/* renderBoardCell
		 * -----------------------------------------------------------------*/
		var renderBoardCell = function(boardCell, id){
			var val = (boardCell.val === null) ? "" : boardCell.val;
			var maxlength = (boardSize < 10) ? " maxlength='1'" : "";
			return "<div class='sudoku-board-cell'>" +
						//want to use type=number, but then have to prevent chrome scrolling and up down key behaviors..
						"<input type='text' pattern='\\d*' novalidate id='input-"+id+"' value='"+val+"'"+maxlength+">" +
					"</div>";
		};

		/* markBoardCellError
		* check the value in Board Cell and if it is not correct, mark it as error
		* -----------------------------------------------------------------*/
		var markBoardCellError = function(boardCell, id){
			var val = (boardCell.val === null) ? "" : boardCell.val;
			
			$("#input-"+id)
			.addClass("board-cell--error");
			
		};


		/* updateUIBoardCell -
		 * --------------
		 *  updates ONE cell on the board with our latest values
		 * -----------------------------------------------------------------*/
		 var updateUIBoardCell = function(cellIndex, opts){
			opts = opts || {};
				var newVal = board[cellIndex].val;

				$("#input-"+cellIndex)
					.val(newVal)
		
			$("#input-"+cellIndex+"-candidates")
				
		};

		/* resetCandidates
		-----------------------------------------------------------------*/
		var resetCandidates = function(updateUI){
			var resetCandidatesList = boardNumbers.slice(0);
			for(var i=0; i <boardSize*boardSize;i++){
				if(board[i].val === null){
					board[i].candidates = resetCandidatesList.slice(); 
				} else if(updateUI !== false) {
						$("#input-"+i+"-candidates").html("");
				}
			}
		};

		/* visualEliminationOfCandidates
		 * --------------
		 * ALWAYS returns false
		 * -- special compared to other strats: doesn't step - updates whole board,
		 in one go. Since it also only updates candidates, we can skip straight to next strat, since we know that neither this one nor the one(s) before (that only look at actual numbers on board), will find anything new.
		 * -----------------------------------------------------------------*/
		function visualEliminationOfCandidates(){
			//for each type of house..(hor row / vert row / box)
			var hlength = houses.length;
			for(var i=0; i < hlength; i++){

				//for each such house
				for(var j=0; j < boardSize; j++){
					var house = houses[i][j];
					var candidatesToRemove = []//numbersTaken(house);

					// for each cell..
					for (var k=0; k < boardSize; k++){
						var cell = house[k];
						var candidates = board[cell].candidates;
						updateUIBoardCell(cell, {mode: "only-candidates"});
					}
				}
			}
			return false;
		}

		/* keyboardNumberInput - update our board model
		 * -----------------------------------------------------------------*/
		var keyboardNumberInput = function(input, id){
			var str= input.val(); //when we use delete function we have to change state of our quiz-we use it for checkall
			//for this we use lenght of str because length of backspace is zero
			var val = parseInt(input.val());
			var n = str.length;

			if (val > 0) { //invalidates Nan
				$.post("/numentry", JSON.stringify({ "cellId": id, "number": val }))

				//update board
				board[id].val = val;
			
			} else if (n == 0) {
				$.post("/numentry", JSON.stringify({ "cellId": id, "number": "" }))

			} else {
				val = null;
				//add back candidates to UI cell

				//needs to happen before we resetCandidates below
				board[id].val = val;

				//update candidates 
				resetCandidates();
				visualEliminationOfCandidates();
			}
		};

		/*
		 * init/API/events
		 *-----------*/
		if(!opts.board) {
			initBoard(opts);
			generateBoard(opts);
			renderBoard();
		} else {
			board = opts.board;
			initBoard();
			renderBoard();
			visualEliminationOfCandidates();
		}

		// 	for(var i=0; i < board.length; i++){
		// 		var cell = board[i];
		// 		var candidates = cell.candidates;

		$boardInputs.on("change", function(){
			var $this = $(this);
			var id = parseInt($this.attr("id").replace("input-",""));
			keyboardNumberInput($this, id);
		});



		/**
		* PUBLIC methods
		* ----------------- */
		var checkAll = function(){
			$.get("/checksolution", function(data){
				var json = JSON.parse(data);
				if (json["finished"] == true){
					// show user that he has done his job
					alert("Congrats!")
				} else {
					// fill the sudoku grid with colours to indicate which cells are wrong
					for (var i = 0; i < 81; i++) {
						if (json["list"][i] == 0) {
							markBoardCellError(board, i);
						}
					}
				}
			});
		};

		var clearChecks = function(board){
			for (var id = 0; id < 81; id++) {
				if($("#input-"+id).hasClass("board-cell--error"))
					$boardInputs.removeClass("board-cell--error");
			}
		}

		var newSudoku = function(){
			$.get("/newsudoku", function(data){
				var json = JSON.parse(data);
				board = json["sudoku"];
				
				// reset current sudoku grid first
				$("#sudoku").html("");
				
				var mySudokuJS = $("#sudoku").sudokuJS({
				board: board
				});

 				// $(".js-check-btn").on("click", mySudokuJS.checkAll);
				$(".js-clear-btn").on("click", mySudokuJS.clearChecks);
				// $(".js-new-btn").on("click", mySudokuJS.newSudoku);
			});
		};

		return {
			checkAll : checkAll,
			clearChecks: clearChecks,
			newSudoku : newSudoku
		};
	};


})(window, jQuery);
