//------------------------------------------------------------------------------
// BEGIN OF MINIMAX ALGORITHM (FEATURING ALPHA-BETA PRUNING)
//-----------------------------------------------------------------------------


function foundMatchP(indexesArray, board) {
    for (var i in indexesArray) {
	var found = true;
	for (j = 0; j < indexesArray[i].length - 1; j++) {
	    /* If current position has not been filled yet; or
	       the current posititon is diferent than the next one then
	       return false */
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


/*
 In case the algorithm finds two or more solutions with the same value then 
 choose he one that is found at a shalow layer in the state tree
*/
function isShallowSolutionForNonOpponent (utility1, depth1, utility2, depth2) {
    return ((utility1 === utility2) && ((utility1 - depth1) > (utility2 - depth2)));
}

function isShallowSolutionForOpponent (utility1, depth1, utility2, depth2) {
    return ((utility1 === utility2) && ((utility1 + depth1) < (utility2 + depth2)));
}

function minimax(board, isOpponent, depth, alpha, beta) {
    
    var utilityValue = utility(board, !isOpponent);
    /* If utility or objecive funtion returns a non null value then 
       it found a terminal state where:
       -1: Opponent won;
        1: Player won;
        0: Draw.  
    */
    if (utilityValue !== false) {
	
	return {"utility": utilityValue, "index": -1, "board": board, "depth": depth};
    }

    switch (isOpponent) {
	
    case false:
	var bestMove = {"utility": -Infinity, "index": -2, "board": board, "depth": depth};
	for (var i in board) {
	    alpha = Math.max(alpha, bestMove.utility);
	    if (alpha >= beta) return bestMove;
	    if( board[i] === "?") {
		board[i] = "X";
		var nextMove = minimax(board,!isOpponent, depth + 1, alpha, beta);
		if ((nextMove.utility  >  bestMove.utility) ||
		    isShallowSolutionForNonOpponent(nextMove.utility,nextMove.depth,bestMove.utility,bestMove.depth)) {
			bestMove.utility = nextMove.utility;
			bestMove.index = parseInt(i);
			bestMove.board = board.slice();
			bestMove.depth = nextMove.depth;
		}
		board[i] = "?";
	    }
	}
	break;
    case true:
	var bestMove = {"utility": Infinity, "index": -1, "board": board, "depth": depth};
	for (var i in board) {
	    beta = Math.min(beta, bestMove.utility);
	    if (alpha >= beta) return bestMove;
	    if (board[i] === "?") {
		board[i] = "O";
		var nextMove = minimax(board,!isOpponent, depth + 1, alpha, beta);
		if ((nextMove.utility  < bestMove.utility) ||
		    isShallowSolutionForOpponent(nextMove.utility,nextMove.depth,bestMove.utility,bestMove.depth)) {	    
			bestMove.utility = nextMove.utility;
			bestMove.index = parseInt(i);
			bestMove.board = board.slice();
			bestMove.depth = nextMove.depth;
		}
		board[i] = "?";
	    }
	}
	break;
    }

    return bestMove;
}



//------------------------------------------------------------------------------
// BEGIN OF GRAPHICAL USER INTERFACE CODE
//-----------------------------------------------------------------------------

var playerSymbol;
var firstPlayerSymbol;

function addSharedCSSProp(DOMElement) {

    $(DOMElement).css("text-align","center");
    $(DOMElement).css("font-size", "5.5em");
    $(DOMElement).css("background", "white");
    $(DOMElement).css("transition", "transform 3s");
}

function updateBoard(board, symbol, index, depth, utility) {
    /* Add computer or player move to the board */
    boardTile = "#board > div:nth-child(" + parseInt(index + 1) + ")";
    switch (symbol) {
    case "O":	
	$(boardTile).css("color", "green");
	$(boardTile).addClass("fa fa-circle-o");
	break;
    case "X":
	$(boardTile).css("color", "red");
	$(boardTile).addClass("fa fa-close");
	break;
    };
    addSharedCSSProp(boardTile);
    board[index] = symbol;
    $("#board").data("board", board);

    /* If the game has finished restart it otherwise just continues playing */
    switch (depth) {
    case 0:
	$("header").text("> draw! <");
	$("#board > div").css("transform", "rotateX(180deg)");
	setTimeout(resetBoard, 3000);
	break;
    case 1:
	/* This case addresses the scenario where the computer
	   was the first one to play and its last move resulted
	   in a draw */
	if (utility === 0) $("header").text("> draw! <");
	/* This case addresses the scenario where the player
	   was the first one to play and its last move resulted
	   in a draw */
	else $("header").text("> you lost! <");
	$("#board > div").css("transform", "rotateX(180deg)");
	setTimeout(resetBoard, 3000);
	break;
    default:
	$("header").text("> you <");
	$("#board > div").click(handlerForTiles);
    }
    
    
}

function playComputer(board) {
    getComputerSymbol() === "X" ? isOpponent = false : isOpponent = true;
    return minimax(board, isOpponent, 0, -Infinity, Infinity);
    
}


function getPlayerSymbol() {
    return playerSymbol;
}


function getFirstPlayerSymbol() {
    return firstPlayerSymbol;
}


function getFirstPlayerName () {
    if (getFirstPlayerSymbol() === getPlayerSymbol()) return "> you <";
    return "> computer <"
}

function getComputerSymbol() {
    if (getPlayerSymbol() === "X") return "O";
    return "X";
}


function anyEmptyTile(board) {
    return board.find(function(elem) { return elem==="?" } );
}

function handlerForTiles() {    
    var index = $("#board > div").index(this);
    var board = $("#board").data("board");
    
    if (board[index] === "?") {	
	updateBoard($("#board").data("board"), getPlayerSymbol(), index);
	$("#board > div").off("click");
	board = $("#board").data("board");
	if (anyEmptyTile(board)) $("header").text("> computer <");
	computerMoveInfo = playComputer(board);
	setTimeout(function() {updateBoard(board, getComputerSymbol(), computerMoveInfo.index, computerMoveInfo.depth, computerMoveInfo.utility)}, 1000);
    }
}


function resetBoard() {
    $("header").text(getFirstPlayerName);
    $("#board > div").css("transition", "");
    $("#board > div").css("transform", "rotateX(0deg)");
    $("#board > div").removeClass();
    $("#board > div").css("background", "");  
    $("#board").data("board",["?","?","?","?","?","?","?","?","?"]);
    /* Add handler for each tile from the board */
    $("#board > div").click(handlerForTiles);
    /* If the first player is the computer then perform the first move
       in advance */
    if (getFirstPlayerName().search("computer") !== -1) {
	$("#board > div").off("click");
	setTimeout(performsFirstBoardMoveByComputer,500);
    }
}



function setPlayersSymbols(index) {
    if (index) playerSymbol = "X";
    else playerSymbol = "O";
}

function setFirstPlayerSymbol(index) {
    if (index) firstPlayerSymbol = getComputerSymbol();
    else firstPlayerSymbol = getPlayerSymbol();
}


function restartGame() {
    $("header").text("> Choose your weapon <");
    $("#board > div").remove();
    $("<div></div>").appendTo("#board")
	.addClass("fa fa-circle-o")
	.css({"color": "green", "font-size": "5.5em", "text-align": "center", "background": "white"});
    $("<div></div>").appendTo("#board")
	.addClass("fa fa-close")
	.css({"color": "red", "font-size": "5.5em", "text-align": "center", "background": "white"});
    $("#board > div").click(function () {
	setPlayersSymbols($("#board > div").index(this));
	chooseFirstPlayer(); 
    });
}


function performsFirstBoardMoveByComputer() {  
    var board = $("#board").data("board");
    computerMoveInfo = playComputer(board);
    updateBoard(board, getComputerSymbol(), computerMoveInfo.index, computerMoveInfo.depth, computerMoveInfo.utility);
    /* Add handler for each tile from the board */
    $("#board > div").click(handlerForTiles);
}


function chooseFirstPlayer() {
    var playerColor = getPlayerSymbol() === "X" ? "red" : "green";
     var computerColor = getComputerSymbol() === "X" ? "red" : "green";
    $("header").text("> Who goes first? <");
    $("#board > div").remove();
    $("<div></div>").appendTo("#board")
	.addClass("material-icons")
	.text("person")
	.css({"color": playerColor, "font-size": "5.5em", "text-align": "center", "background": "white"});
    $("<div></div>").appendTo("#board")
	.addClass("material-icons")
	.text("computer")
	.css({"color": computerColor, "font-size": "5.5em", "text-align": "center", "background": "white"});
    $("#board > div").click(function () {
	setFirstPlayerSymbol($("#board > div").index(this));
	$("#board > div").remove();
	for (i= 0; i < 9; i++) $("<div></div>").appendTo("#board");
	/* Reset the board for a new game */
	resetBoard();
    });

}


$(document).ready(function() {

    /* (Re)Start the game */
    restartGame();

    /* Add hander for restarting game */
    $("footer > i").click(restartGame);

});

