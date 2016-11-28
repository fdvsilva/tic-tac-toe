function foundMatchP(indexesArray, board) {
    for (var i in indexesArray) {
	var found = true;
	for (j = 0; j < indexesArray[i].length - 1; j++) {
	    /* If current position has not been filled yet; or
	       the current posititon is diferent than the next one then
	       return false */
	    if (debug) {
		//console.log (indexesArray[i][j], indexesArray[i][j+ 1]);
		//console.log (board[indexesArray[i][j]], board[indexesArray[i][j+ 1]]);
	    };
	    if (board[indexesArray[i][j]] === "?" ||  board[indexesArray[i][j]] !== board[indexesArray[i][j + 1]]) {
		found = false;
		break;
	    }	    
	}
	if (found) return true;
    }
    return false;
}


function utility(board, isOpponent) {
    /*
      Checks if there is an horizontal match, i.e.,
      if at least a row holds 3 equal symbols
      Ex: [ . . . ]
          [ 0 0 0 ]
          [ . . . ]
    */
    debug = false;
    var horizontalIndexes = [[0,1,2], [3,4,5], [6,7,8]];
    if (foundMatchP(horizontalIndexes, board)) {
	if (!isOpponent) return 1;
	else return -1;
    }
    debug = false;
    
    /*
      Checks if there is an vertical match, i.e.,
      if at least a column holds 3 equal symbol.
      Ex: [ . 0 . ]
          [ . 0 . ]
          [ . 0 . ]
    */
    var verticalIndexes = [[0,3,6], [1,4,7], [2,5,8]];
    if (foundMatchP(verticalIndexes, board)) {
	if (!isOpponent) return 1;
	else return -1;
    }
    
    /*
      Checks if there is a diagonal match, i.e.,
      if at least a diagonal holds 3 equal symbol.
      Ex: [ 0 . . ]
          [ . 0 . ]
          [ . . 0 ]
    */
    var diagonalIndexes = [[0,4,8], [2,4,6]];
    if (foundMatchP(diagonalIndexes, board)) {
	if (!isOpponent) return 1;
	else return -1;
    }

    /* Checks if there is no more moves available */
    if (board.join("").replace(/\?/g,"").length === 9) return 0;

    /* Else, return false, i.e., we are not dealing with a terminal state */
    return false;
    
}


function minimax(board, isOpponent) {
    
    var utilityValue = utility(board, isOpponent);
    /* If utility or objecive funtion returns a non null value then 
       it found a terminal state where:
       -1: Opponent won;
        1: Player won;
        0: Draw.  
    */

    
    if (utilityValue) return {"utility": utilityValue, "board": []};

    switch (isOpponent) {
	
    case false:
	var bestMove = {"utility":-100, "board": []};
	for (var i in board) {
	    if( board[i] === "?") {
		board[i] = "X";
		var nextMove = minimax(board,!isOpponent);
		//console.log(nextMove.utility)
		//console.log(nextMove.board);
		//console.log("utility", utilityValue);
		if (nextMove.utility > bestMove.utility) {
		    bestMove.utility = nextMove.utility;
		    bestMove.board = board.slice();
		}
		board[i] = "?";
	    }
	}
	break;
    case true:
	var bestMove = {"utility": 100, "board": []};
	for (var i in board) {
	    if (board[i] === "?") {
		board[i] = "O";
		var nextMove = minimax(board,!isOpponent);
		if (nextMove.utility < bestMove.utility) {
		    bestMove.utility = nextMove.utility;
		    bestMove.board = board.slice();
		}
		board[i] = "?";
	    }
	}
	break;
    }

    return bestMove;
}
