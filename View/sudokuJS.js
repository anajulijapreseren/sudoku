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
		 * constants
		 *-----------*/

		var SOLVE_MODE_STEP = "step";

		/*
		 * variables
		 *-----------*/
		opts = opts || {};
		var solveMode = SOLVE_MODE_STEP,
				difficulty = "unknown",
				candidatesShowing = false,
				editingCandidates = false,
				boardFinished = false,
				boardError = false,
				onlyUpdatedCandidates = false,
				gradingMode = false, //solving without updating UI
				generatingMode = false, //silence board unsolvable errors
				invalidCandidates = [], //used by the generateBoard function


		/*board variable gets enhanced into list of objects on init:
			,{
				val: null
				,candidates: [
					]
			}
		*/
			board = [],
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
			$boardInputs, //created
			$boardInputCandidates; //created


		 /*
		 * methods
		 *-----------*/
		 //shortcut for logging..
		function log(msg){
			if(window.console && console.log)
			 console.log(msg);
		}


		//array contains function
		var contains = function(a, obj) {
			for (var i = 0; i < a.length; i++) {
				if (a[i] === obj) {
					return true;
				}
			}
			return false;
		};

		var uniqueArray = function(a) {
			var temp = {};
			for (var i = 0; i < a.length; i++)
				temp[a[i]] = true;
			var r = [];
			for (var k in temp)
				r.push(k);
			return r;
		};

		/* isBoardFinished
		 * -----------------------------------------------------------------*/
		// var isBoardFinished = function(){
		// 	for (var i=0; i < boardSize*boardSize; i++){
		// 		if(board[i].val === null)
		// 			return false;
		// 	}
		// 	return true;
		// };


		/* generateHouseIndexList
		 * -----------------------------------------------------------------*/
		var generateHouseIndexList = function(){
        // reset houses
        houses = [
				//hor. rows
				[],
				//vert. rows
				[],
				//boxes
				[]
			]
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
							//0, 0,0, 27, 27,27, 54, 54, 54 for a standard sudoku
							var a = Math.floor(i/boxSideSize) * boardSize * boxSideSize;
							//[0-2] for a standard sudoku
							var b = (i%boxSideSize) * boxSideSize;
							var boxStartIndex = a +b; //0 3 6 27 30 33 54 57 60

								//every boxSideSize box, skip boardSize num rows to next box (on new horizontal row)
								//Math.floor(i/boxSideSize)*boardSize*2
								//skip across horizontally to next box
								//+ i*boxSideSize;


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
			var alreadyEnhanced = (board[0] !== null && typeof board[0] === "object");
			var nullCandidateList = [];
      		boardNumbers = [];
			boardSize = (!board.length && opts.boardSize) || Math.sqrt(board.length) || 9;
			$board.attr("data-board-size", boardSize);
			if(boardSize % 1 !== 0 || Math.sqrt(boardSize) % 1 !== 0) {
				log("invalid boardSize: "+boardSize);
				if(typeof opts.boardErrorFn === "function")
					opts.boardErrorFn({msg: "invalid board size"});
				return;
			}
			for (var i=0; i < boardSize; i++){
				boardNumbers.push(i+1);
				nullCandidateList.push(null);
			}
			generateHouseIndexList();

			if(!alreadyEnhanced){
				//enhance board to handle candidates, and possibly other params
				for(var j=0; j < boardSize*boardSize ; j++){
					var cellVal = (typeof board[j] === "undefined") ? null : board[j];
					var candidates = cellVal === null ? boardNumbers.slice() : nullCandidateList.slice();
					board[j] = {
						val: cellVal,
						candidates: candidates
						//title: "" possibl add in 'A1. B1...etc
					};
				}
			}
		};


		/* renderBoard
		 * --------------
		 *  dynamically renders the board on the screen (into the DOM), based on board variable
		 * -----------------------------------------------------------------*/
		var renderBoard = function(){
			//log("renderBoard");
			//log(board);
			var htmlString = "";
			for(var i=0; i < boardSize*boardSize; i++){
				htmlString += renderBoardCell(board[i], i);

				if((i+1) % boardSize === 0) {
					htmlString += "<br>";
				}
			}
			//log(htmlString);
			$board.append(htmlString);

			//save important board elements
			$boardInputs = $board.find("input");
			$boardInputCandidates = $board.find(".candidates");
		};

		/* renderBoardCell
		 * -----------------------------------------------------------------*/
		var renderBoardCell = function(boardCell, id){
			var val = (boardCell.val === null) ? "" : boardCell.val;
			var candidates = boardCell.candidates || [];
			var candidatesString = buildCandidatesString(candidates);
			var maxlength = (boardSize < 10) ? " maxlength='1'" : "";
			return "<div class='sudoku-board-cell'>" +
						//want to use type=number, but then have to prevent chrome scrolling and up down key behaviors..
						"<input type='text' pattern='\\d*' novalidate id='input-"+id+"' value='"+val+"'"+maxlength+">" +
						"<div id='input-"+id+"-candidates' class='candidates'>" + candidatesString + "</div>" +
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


		/* buildCandidatesString
		 * -----------------------------------------------------------------*/
		var buildCandidatesString = function(candidatesList){
			var s="";
			for(var i=1; i<boardSize+1; i++){
				if(contains(candidatesList,i))
					s+= "<div>"+i+"</div> ";
				else
					s+= "<div>&nbsp;</div> ";
			}
			return s;
		};

		/* updateUIBoard -
		 * --------------
		 *  updates the board with our latest values
		 * -----------------------------------------------------------------*/
		 var updateUIBoard = function(paintNew){
			//log("re painting every input on board..");
			$boardInputs
				.removeClass("highlight-val")
				.each(function(i,v){
					var $input = $(this);
					var newVal = board[i].val;
					//if(newVal && parseInt($input.val()) !== newVal) {
						$input.val(newVal);
						if(paintNew)
							$input.addClass("highlight-val");
					//}
					var $candidates = $input.siblings(".candidates");
					$candidates.html(buildCandidatesString(board[i].candidates));

				});
		};


		/* updateUIBoardCell -
		 * --------------
		 *  updates ONE cell on the board with our latest values
		 * -----------------------------------------------------------------*/
		 var updateUIBoardCell = function(cellIndex, opts){
			opts = opts || {};
			//log("updateUIBoardCell: "+cellIndex);
			//if(!(opts.mode && opts.mode === "only-candidates")){
				var newVal = board[cellIndex].val;

				//$boardInputs.removeClass("highlight-val");

				//shouldn't always add hightlight-val class
				$("#input-"+cellIndex)
					.val(newVal)
					.addClass("highlight-val");
			//}
			$("#input-"+cellIndex+"-candidates")
				.html(buildCandidatesString(board[cellIndex].candidates));
		};


		/* removeCandidatesFromCell
		-----------------------------------------------------------------*/
		var removeCandidatesFromCell = function(cell, candidates){
			var boardCell = board[cell];
			var c = boardCell.candidates;
			var cellUpdated = false;
			for(var i=0; i < candidates.length; i++){
				//-1 because candidate '1' is at index 0 etc.
				if(c[candidates[i]-1] !== null) {
					c[candidates[i]-1] = null; //writes to board variable
					cellUpdated = true;
				}
			}
			if(cellUpdated && solveMode === SOLVE_MODE_STEP)
				updateUIBoardCell(cell, {mode: "only-candidates"});
		};


		/* removeCandidatesFromCells
		 * ---returns list of cells where any candidats where removed
		-----------------------------------------------------------------*/
		var removeCandidatesFromCells = function(cells, candidates){
			//log("removeCandidatesFromCells");
			var cellsUpdated = [];
			for (var i=0; i < cells.length; i++){
				var c = board[cells[i]].candidates;

				for(var j=0; j < candidates.length; j++){
					var candidate = candidates[j];
					//-1 because candidate '1' is at index 0 etc.
					if(c[candidate-1] !== null) {
						c[candidate-1] = null; //NOTE: also deletes them from board variable
						cellsUpdated.push(cells[i]); //will push same cell multiple times

						// if(solveMode===SOLVE_MODE_STEP){
						// 	//highlight candidate as to be removed on board
						// 	uIBoardHighlightRemoveCandidate(cells[i],candidate);
						// }
					}
				}
			}
			return cellsUpdated;
		};

		var resetBoardVariables = function() {
			boardFinished = false;
			boardError = false;
			onlyUpdatedCandidates = false;
			usedStrategies = [];
			gradingMode = false;
		};


		/* clearBoard
		-----------------------------------------------------------------*/
		var clearBoard = function(){
			resetBoardVariables();

			//reset board variable
			var cands = boardNumbers.slice(0);
			for(var i=0; i <boardSize*boardSize;i++){
				board[i] = {
					val: null,
					candidates: cands.slice()
				};
			}

			//reset UI
			$boardInputs
				.removeClass("highlight-val")
				.val("");

			updateUIBoard(false);
		};

		var getNullCandidatesList = function() {
			var l = [];
			for (var i=0; i < boardSize; i++){
				l.push(null);
			}
			return l;
		};


		/* resetCandidates
		-----------------------------------------------------------------*/
		var resetCandidates = function(updateUI){
			var resetCandidatesList = boardNumbers.slice(0);
			for(var i=0; i <boardSize*boardSize;i++){
				if(board[i].val === null){
					board[i].candidates = resetCandidatesList.slice(); //otherwise same list (not reference!) on every cell
					if(updateUI !== false)
						$("#input-"+i+"-candidates").html(buildCandidatesString(resetCandidatesList));
				} else if(updateUI !== false) {
						$("#input-"+i+"-candidates").html("");
				}
			}
		};

		/* setBoardCell - does not update UI
		-----------------------------------------------------------------*/
		var setBoardCell = function(cellIndex, val){
			var boardCell = board[cellIndex];
			//update val
			boardCell.val = val;
			if(val !== null)
				boardCell.candidates = getNullCandidatesList();
		};

		/* indexInHouse
		 * --------------
		 *  returns index (0-9) for digit in house, false if not in house
		 *  NOTE: careful evaluating returned index is IN row, as 0==false.
		 * -----------------------------------------------------------------*/
		 var indexInHouse = function(digit,house){
			for(var i=0; i < boardSize; i++){
				if(board[house[i]].val===digit)
					return i;
			}
			//not in house
			return false;
		};



		 /* housesWithCell
		 * --------------
		 *  returns houses that a cell belongs to
		 * -----------------------------------------------------------------*/
		 var housesWithCell = function(cellIndex){
			var boxSideSize = Math.sqrt(boardSize);
			var houses = [];
			//horisontal row
			var hrow = Math.floor(cellIndex/boardSize);
			houses.push(hrow);
			//vertical row
			var vrow = Math.floor(cellIndex%boardSize);
			houses.push(vrow);
			//box
			var box = (Math.floor(hrow/boxSideSize)*boxSideSize) + Math.floor(vrow/boxSideSize);
			houses.push(box);

			return houses;
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
					//log(candidatesToRemove);

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


		/* visualElimination
		 * --------------
		 * Looks for houses where a digit only appears in one slot
		 * -meaning we know the digit goes in that slot.
		 * -- returns effectedCells - the updated cell(s), or false
		 * -----------------------------------------------------------------*/
		function visualElimination(){
			//log("visualElimination");
			//for each type of house..(hor row / vert row / box)
			var hlength = houses.length;
			for(var i=0; i < hlength; i++){

				//for each such house
				for(var j=0; j < boardSize; j++){
					var house = houses[i][j];
					var digits = numbersLeft(house);

					//for each digit left for that house
					for (var k=0; k < digits.length; k++){
						var digit = digits[k];
						var possibleCells = [];

						//for each cell in house
						for(var l=0; l < boardSize; l++){
							var cell = house[l];
							var boardCell = board[cell];
							//if the digit only appears as a candidate in one slot, that's where it has to go
							if (contains(boardCell.candidates, digit)){
								possibleCells.push(cell);
								if(possibleCells.length > 1)
									break; //no we can't tell anything in this case
							}
						}

						if(possibleCells.length === 1){
							var cellIndex = possibleCells[0];

							//log("only slot where "+digit+" appears in house. ");


							setBoardCell(cellIndex, digit); //does not update UI

							// if(solveMode===SOLVE_MODE_STEP)
							// 	uIBoardHighlightCandidate(cellIndex, digit);

							onlyUpdatedCandidates = false;
							return [cellIndex]; //one step at the time
						}
					}

				}
			}
			return false;
		}


		/* singleCandidate
		 * --------------
		 * Looks for cells with only one candidate
		 * -- returns effectedCells - the updated cell(s), or false
		 * -----------------------------------------------------------------*/
		function singleCandidate(){
			//before we start with candidate strategies, we need to update candidates from last round:
			visualEliminationOfCandidates(); //TODO: a bit hackyy, should probably not be here

			//for each cell

			for(var i=0; i < board.length; i++){
				var cell = board[i];
				var candidates = cell.candidates;

				//for each candidate for that cell
				var possibleCandidates = [];
				for (var j=0; j < candidates.length; j++){
					if (candidates[j] !== null)
						possibleCandidates.push(candidates[j]);
					if(possibleCandidates.length >1)
						break; //can't find answer here
				}
				if(possibleCandidates.length === 1){
					var digit = possibleCandidates[0];

					//log("only one candidate in cell: "+digit+" in house. ");


					setBoardCell(i, digit); //does not update UI
					// if(solveMode===SOLVE_MODE_STEP)
					// 	uIBoardHighlightCandidate(i, digit);

					onlyUpdatedCandidates = false;
					return [i]; //one step at the time
				}
			}
			return false;
		}


		/* keyboardMoveBoardFocus - puts focus on adjacent board cell
		 * -----------------------------------------------------------------*/
		var keyboardMoveBoardFocus = function(currentId, keyCode){
			var newId = currentId;
			//right
			if(keyCode ===39)
				newId++;
			//left
			else if(keyCode === 37)
				newId--;
			//down
			else if(keyCode ===40)
				newId = newId + boardSize;
			//up
			else if(keyCode ===38)
				newId = newId - boardSize;

			//out of bounds
			if(newId < 0 || newId > (boardSize*boardSize))
				return;

			//focus input
			$("#input-"+newId).focus();
		};


		/* toggleCandidateOnCell - used for editingCandidates mode
		 * -----------------------------------------------------------------*/
		var toggleCandidateOnCell = function(candidate, cell){
			var boardCell = board[cell];
			if(boardCell.val){
				return;  // don't modify candidates when a cell already has a number
			}
			var c = boardCell.candidates;
			c[candidate-1] = c[candidate-1] === null ? candidate : null;
			if(solveMode === SOLVE_MODE_STEP)
				updateUIBoardCell(cell, {mode: "only-candidates"});
		};

		/* keyboardNumberInput - update our board model
		 * -----------------------------------------------------------------*/
		var keyboardNumberInput = function(input, id){
			var val = parseInt(input.val());
			if(editingCandidates){
				toggleCandidateOnCell(val, id);
				// reset value on board
				input.val(board[id].val);
				return;
			}

			//log(id+": "+val +" entered.");

			var candidates = getNullCandidatesList(); //[null,null....null];

			if (val > 0) { //invalidates Nan
				log("Zmajski input: "+val);
				log("celica:"+id);
				$.post("/numentry", JSON.stringify({ "cellId": id, "number": val }))
				//check that this doesn't make board incorrect
				var temp = housesWithCell(id);
				//for each type of house
				for(var i=0; i < houses.length; i++){

					if(indexInHouse(val, houses[i][temp[i]])){
						//digit already in house - board incorrect with user input
						// log("board incorrect!");
						var alreadyExistingCellInHouseWithDigit = houses[i][temp[i]][indexInHouse(val, houses[i][temp[i]])];

						//this happens in candidate mode, if we highlight on ui board before entering value, and user then enters before us.
						if(alreadyExistingCellInHouseWithDigit === id)
							continue;

						$("#input-" + alreadyExistingCellInHouseWithDigit + ", #input-"+id)
							.addClass("board-cell--error");
						//make as incorrect in UI

						//input was incorrect, so don't update our board model
						return;
					}
				}

				//remove candidates..
				input.siblings(".candidates").html(buildCandidatesString(candidates));
				//update board
				board[id].candidates = candidates;
				board[id].val = val;

			} else {
				boardError = false; //reset, in case they fixed board - otherwise, we'll find the error again
				val = null;
				//add back candidates to UI cell
				candidates = boardNumbers.slice();
				input.siblings(".candidates").html(buildCandidatesString(candidates));

				//needs to happen before we resetCandidates below
				board[id].val = val;

				//update candidates (if we could reverse remove candidates from this cell and outwards, we wouldn't have to redo all board)
				resetCandidates();
				visualEliminationOfCandidates();
			}
			//log(board[1].candidates);

			//HACK: remove all errors as soon as they fix one - the other cells just get emptied on board (in UI; already were null in model)
			if($("#input-"+id).hasClass("board-cell--error"))
				$boardInputs.removeClass("board-cell--error");

			if(typeof opts.boardUpdatedFn === "function")
				opts.boardUpdatedFn({cause: "user input", cellsUpdated: [id]});

			onlyUpdatedCandidates = false;
		};


		 var setBoardCellWithRandomCandidate = function(cellIndex, forceUIUpdate){
			// CHECK still valid
			visualEliminationOfCandidates();
			// DRAW RANDOM CANDIDATE
			// don't draw already invalidated candidates for cell
			var invalids = invalidCandidates && invalidCandidates[cellIndex];
			// TODO: don't use JS filter - not supported enough(?)
			var candidates = board[cellIndex].candidates.filter(function(candidate){
				if(!candidate || (invalids && contains(invalids, candidate)))
					return false;
				return candidate;
			});
			// if cell has 0 candidates - fail to set cell.
			if(candidates.length === 0) {
				return false;
			}
			var randIndex = Math.round ( Math.random() * (candidates.length - 1));
			var randomCandidate = candidates[randIndex];
			// UPDATE BOARD
			setBoardCell(cellIndex, randomCandidate);
			return true;
		};

		// var generateBoardAnswerRecursively = function(cellIndex){
		// 	if((cellIndex+1) > (boardSize*boardSize)){
		// 		//done
		// 		invalidCandidates = [];
		// 		return true;
		// 	}
		// 	if(setBoardCellWithRandomCandidate(cellIndex)){
		// 		generateBoardAnswerRecursively(cellIndex + 1);
		// 	} else {
		// 		if(cellIndex <= 0)
		// 			return false;
		// 		var lastIndex = cellIndex - 1;
		// 		invalidCandidates[lastIndex] = invalidCandidates[lastIndex] || [];
		// 		invalidCandidates[lastIndex].push(board[lastIndex].val);
		// 		// set val back to null
		// 		setBoardCell(lastIndex, null);
		// 		// reset candidates, only in model.
		// 		resetCandidates(false);
		// 		// reset invalid candidates for cellIndex
		// 		invalidCandidates[cellIndex] = [];
		// 		// then try again
		// 		generateBoardAnswerRecursively(lastIndex);
		// 		return false;
		// 	}
		// };

	// 	var digCells = function(){
	// 		var cells = [];
	// 		var given = boardSize*boardSize;
	// 		var minGiven = 17;
	// 		if(difficulty === DIFFICULTY_EASY){
	// 			minGiven = 40;
	// 		} else if(difficulty === DIFFICULTY_MEDIUM){
	// 			minGiven = 30;
	// 		}
    //   if (boardSize < 9) {
    //     minGiven = 4
    //   }
	// 		for (var i=0; i < boardSize*boardSize; i++){
	// 			cells.push(i);
	// 		}

	// 		while(cells.length > 0 && given > minGiven){
	// 			var randIndex = Math.round ( Math.random() * (cells.length - 1));
	// 			var cellIndex = cells.splice(randIndex,1);
	// 			var val = board[cellIndex].val;

	// 			// remove value from this cell
	// 			setBoardCell(cellIndex, null);
	// 			// reset candidates, only in model.
	// 			resetCandidates(false);

	// 			var data = analyzeBoard();
	// 			if (data.finished !== false && easyEnough(data)) {
	// 				given--;
	// 			} else {
	// 				// reset - don't dig this cell
	// 				setBoardCell(cellIndex, val);
	// 			}

	// 		}
	// 	};

    // generates board puzzle, i.e. the answers for this round
    // requires that a board for boardSize has already been initiated
		// var generateBoard = function(diff, callback){
		// 	if($boardInputs)
		// 		clearBoard();
		// 	if (contains(DIFFICULTIES, diff)) {
		// 		difficulty = diff
		// 	} else if (boardSize >= 9) {
		// 		difficulty = DIFFICULTY_MEDIUM
		// 	} else {
		// 		difficulty = DIFFICULTY_EASY
		// 	}
		// 	generatingMode = true;

		// 	// the board generated will possibly not be hard enough
		// 	// (if you asked for "hard", you most likely get "medium")
		// 	generateBoardAnswerRecursively(0);

		// 	// attempt one - save the answer, and try digging multiple times.
		// 	var boardAnswer = board.slice();

		// 	var boardTooEasy = true;

		// 	while(boardTooEasy){
		// 		digCells();
		// 		var data = analyzeBoard();
		// 		if(hardEnough(data))
		// 			boardTooEasy = false;
		// 		else
		// 			board = boardAnswer;
		// 	}
		// 	solveMode = SOLVE_MODE_STEP;
		// 	if($boardInputs)
		// 		updateUIBoard();

		// 	visualEliminationOfCandidates();

		// 	if(typeof callback === 'function'){
		// 		callback();
		// 	}
		// };


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


		$boardInputs.on("keyup", function(e){
			var $this = $(this);
			var id = parseInt($this.attr("id").replace("input-",""));
			//allow keyboard movements
			if(e.keyCode >=37 && e.keyCode <= 40){// || e.keyCode ===48){
				keyboardMoveBoardFocus(id, e.keyCode);
			}
		});
		//listen on change because val is incorrect all the time on keyup, because have to filter out all other keys.
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
					log("Yay!")
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

		var getBoard = function(){
			return board;
		};

		var setBoard = function(newBoard){
      clearBoard(); // if any pre-existing
			board = newBoard;
			initBoard();
			visualEliminationOfCandidates();
			updateUIBoard(false);
		};

		var setEditingCandidates = function(newVal){
			editingCandidates = newVal;
		};

		return {
			checkAll : checkAll,
			clearChecks: clearChecks,
			clearBoard : clearBoard,
			getBoard : getBoard,
			setBoard : setBoard,
			setEditingCandidates: setEditingCandidates,
			//generateBoard : generateBoard
		};
	};


})(window, jQuery);
