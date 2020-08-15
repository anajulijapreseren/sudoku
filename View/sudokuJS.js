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
					var candidates = cellVal === null ? boardNumbers.slice() : nullCandidateList.slice();
					board[j] = {
						val: cellVal,
						candidates: candidates
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
			// var candidates = boardCell.candidates || [];
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

				//shouldn't always add hightlight-val class
				$("#input-"+cellIndex)
					.val(newVal)
					.addClass("highlight-val");
		
			$("#input-"+cellIndex+"-candidates")
				
		};

		/* removeCandidatesFromCell
		-----------------------------------------------------------------*/
		var removeCandidatesFromCell = function(cell, candidates){
			updateUIBoardCell(cell, {mode: "only-candidates"});
		};

		/* resetCandidates
		-----------------------------------------------------------------*/
		var resetCandidates = function(updateUI){
			var resetCandidatesList = boardNumbers.slice(0);
			for(var i=0; i <boardSize*boardSize;i++){
				if(board[i].val === null){
					board[i].candidates = resetCandidatesList.slice(); //otherwise same list (not reference!) on every cell
				} else if(updateUI !== false) {
						$("#input-"+i+"-candidates").html("");
				}
			}
		};

		 /* numbersTaken
		 * --------------
		 *  returns used numbers in a house
		 * -----------------------------------------------------------------*/
		 var numbersTaken = function(house){
			var numbers = [];
			for(var i=0; i < house.length; i++){
				var n = board[house[i]].val;
				if(n !== null)
					numbers.push(n);
			}
			//return remaining numbers
			return numbers;
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
					var candidatesToRemove = numbersTaken(house);

					// for each cell..
					for (var k=0; k < boardSize; k++){
						var cell = house[k];
						var candidates = board[cell].candidates;
						removeCandidatesFromCell(cell, candidatesToRemove);
					}
				}
			}
			return false;
		}

		/* keyboardNumberInput - update our board model
		 * -----------------------------------------------------------------*/
		var keyboardNumberInput = function(input, id){
			var val = parseInt(input.val());

			if (val > 0) { //invalidates Nan
				$.post("/numentry", JSON.stringify({ "cellId": id, "number": val }))
				//check that this doesn't make board incorrect
			
				//remove candidates.
				//update board
				board[id].val = val;

			} else {
				// boardError = false; //reset, in case they fixed board - otherwise, we'll find the error again
				val = null;
				//add back candidates to UI cell

				//needs to happen before we resetCandidates below
				board[id].val = val;

				//update candidates (if we could reverse remove candidates from this cell and outwards, we wouldn't have to redo all board)
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
					alert("Oh my god, this is so wrong!")
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

		return {
			checkAll : checkAll,
			clearChecks: clearChecks,
		};
	};


})(window, jQuery);
