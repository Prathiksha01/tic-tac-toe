$("#re").click(function(){
	document.location.href = "";
});

$("document").ready(function(){

    $(".lev").click(function(){
   // Game starts here
  
    var arg = $(this).text();

    $(".start").click(function(){

	var player = new AI(arg);
	var gam = new Game(player);
	player.plays(gam);
	//Ask if the player wants to play X or O
	var symbol = prompt("X or O");
	gam.currentState.computerTurn = symbol === "X" ? "O" : "X";
    gam.start();
  

    //The X-part
    $(".cell").each(function(){
	$(this).click(function(){
		var data = $(this).attr("value");
		gam.currentState.board[parseInt(data)] = symbol;
		ui.insertAt(parseInt(data), symbol);
		gam.currentState.advanceTurn();
		gam.advanceTo(gam.currentState);
		//gam.currentState.board[data]
	});
});


      });
 
    });
});


//A state class to keep track of the board configurations throughout the game
//parameter-old-takes the state of the old class - uses a copy constructor to create a new state from the old state

var State = function(){
//Fixing an error due to arguments 
var old;
if(arguments.length === 0)
 old = undefined;
else
 old = arguments[0];

//a public variable to store the turn of the next player
this.turn = "";

//a public variable to store the number of moves made by the O player
this.oMovesCount = 0;

//a public varable to check if the game is still running
this.result = "still running";
//board configuration
this.board = [];


//To keep track of the computer's game symbol
this.computerTurn = "";

//copy constructor to copy the previous state
if (old !== undefined)
{  
	var len = old.board.length;
	this.board = new Array(len);
	for (var i = 0 ; i < len; i++)
		this.board[i] = old.board[i];

    this.computerTurn = old.computerTurn;
	this.oMovesCount = old.oMovesCount;
	this.result = old.result;
	this.turn = old.turn;
}


//A function to check who's turn it is at this state
this.advanceTurn = function(){
this.turn = (this.turn === "X") ? "O" : "X" ;
};

//Function to keep track of empty cells
this.emptyCells = function(){
var index = [];
for (var i = 0 ; i < 9; i++)
{
	if(this.board[i] === "E")
		index.push(i);
}
return index;
};

//A function to check if the game has ended at this state

this.isTerminal = function(){
var b = this.board;
//check rows
for(var i = 0 ; i <= 6; i = i + 3)
{
	if (b[i] !== "E"  &&  b[i] === b[i + 1] && b[i] === b[i + 2])
	{
		this.result = b[i] + "-won" ;
		return true;
	}
}
//check columns
for(var i = 0 ; i <= 2; i++)
{
	if (b[i] !== "E" && b[i] === b[i + 3]  && b[i] === b[i + 6])
	{
		this.result = b[i] + "-won";
		return true;
	}
}

//check diagonals

for(var i = 0, j = 4; i <= 2; i = i + 2, j = j - 2)
{
	if(b[i] !== "E"  && b[i] === b[i + j] && b[i] === b[i + (2 * j)])
	{
		this.result = b[i] + "-won";
		return true;
	}
}

var availableCells = this.emptyCells();
if(availableCells.length === 0)     //Bug fixed.  
{
	this.result = "Draw";
	return true;
}
else
return false;
};
//End of class state
};


//The AI Player Class (to create instances of an AI player. Here-one player)
//Parameter- level- To play three different levels of the game (As chosen by the player)

var AI = function(level){

 var levelOfIntelligence = level;

//Game played by the player
 this.game = {};

//Minimax function- A private static function to calculate the score of all possible moves by the AI Player
function minimax(state)
{
	if(state.isTerminal())
	{
		return Game.score(state); //base case
	}
	else
	{
		var stateScore ;

		if(state.turn === "X")
			stateScore = -1000;
		else
			stateScore = 1000;
        var availablePositions = state.emptyCells();

        var availableNextStates = availablePositions.map(function(pos){
        	var action = new AIAction(pos);
        	var nextState = action.applyTo(state);
        	return nextState;
        });


        availableNextStates.forEach(function(nextState){
        	var nextScore = minimax(nextState);

        	if(state.turn === "X")
        	{
              if (nextScore > stateScore)
              	stateScore = nextScore;
        	}
        	else
        	{
        		if (nextScore < stateScore)
        			stateScore = nextScore;
        	}

        });
        return stateScore;
	}

}
//End of minimax function

//Functions to make the AI Player take moves
function takeABlindMove(turn)
{
  var available = game.currentState.emptyCells();
  var randomCell = available[Math.floor(Math.random() * available.length)];
  
  //Print on the screen
  ui.insertAt(randomCell, game.currentState.computerTurn);

  var action = new AIAction(randomCell);
  var next = action.applyTo(game.currentState);
  game.advanceTo(next);

}


function takeANoviceMove(turn)
{
    var available = game.currentState.emptyCells();

    var availableActions = available.map(function(pos){
    var action = new AIAction(pos);
    var next = action.applyTo(game.currentState);
    action.minimaxValue = minimax(next);
    return action;
});
   
   
  if(turn === "X")
  	availableActions.sort(AIAction.DESCENDING);
  else
  	availableActions.sort(AIAction.ASCENDING);

 

  //Applying the probablity
  var chosenAction;
  if ((Math.random() * 100) < 40)
  {
  	chosenAction = availableActions[0];
  }
  else if (availableActions.length >= 2)
  	chosenAction = availableActions[1] ;
  else
  	chosenAction = availableActions[0] ;

  var next = chosenAction.applyTo(game.currentState);
  

  //Print it on the screen
  ui.insertAt(chosenAction.movePosition, game.currentState.computerTurn);
  //Advance the game to the next level by updating the state
  game.advanceTo(next) ;
}

function takeAMasterMove(turn)
{
   var available = game.currentState.emptyCells();

   var availableActions = available.map(function(pos){
   	var action = new AIAction(pos);
   	var next = action.applyTo(game.currentState);
   	action.minimaxValue = minimax(next);
    
   	   	return action;
   });

   if(turn === "X")
   	availableActions.sort(AIAction.DESCENDING);
   else
   	availableActions.sort(AIAction.ASCENDING);

   var chosenAction = availableActions[0]; //Since it's optimal
   var next = chosenAction.applyTo(game.currentState); //Overwriting the currentState with the most optimal move as decided by the minimax function


   //Print it on the screen
   ui.insertAt(chosenAction.movePosition, game.currentState.computerTurn);

   game.advanceTo(next);
}


//A Public function to specify the game the AI player will play
this.plays = function(_game)
{
	game = _game;
}

//Public method to notify the AI player that it's his turn
this.notify = function(turn)
{
	switch(levelOfIntelligence)
	{
		case "Blind" :
		{
			takeABlindMove(turn);
			break;
		}
		case "Novice":
		{
			takeANoviceMove(turn);
			break;
		}
		case "Master":
		{
			takeAMasterMove(turn);
			break;
		}
	}
}

//End of the AI Player class
};



//The AI Action Class - For better modular design
//Parameter-pos-Takes every possible position and applys minimax and the transition function to it

var AIAction = function(pos)
{

	//A public variable to store the position
	this.movePosition = pos;

	//God knows what it does. Yet to figure this variable out
	this.minimaxValue = 0;

	//Transition function (initial state + transition function = new state)  --- No logic -- Just gives us the changed configuration
	this.applyTo = function(state)
	{
		var next = new State(state);
		next.board[this.movePosition] = state.turn ;

		if(state.turn === "O")
				next.oMovesCount++;
		        next.advanceTurn();
		    
		return next;
	}

	//End of AI action
}; 

//A public static function to sort the best possible moves (as estimated by using the AI action function multiple times)

AIAction.ASCENDING = function(firstAction,secondAction)
{
	if (firstAction.minimaxValue < secondAction.minimaxValue)
		return -1;
	else if (firstAction.minimaxValue > secondAction.minimaxValue)
		return 1;
	else
		return 0; // For same values
};


//A public static function to sort the best possible moves (as estimated using the AI action function multiple times)

AIAction.DESCENDING = function(firstAction, secondAction)
{
   if (firstAction.minimaxValue < secondAction.minimaxValue)
   	return 1;
   else if (firstAction.minimaxValue > secondAction.minimaxValue)
   	return -1;
   else return 0;
};

//TheGameClass - The class which gets the game working
//Parameter-autoPlayer-The AI player                       
var Game = function (autoPlayer)                                                                                    
{                                                           
//Initializing the AI player                                 
this.ai = autoPlayer;

//The current state in the game
this.currentState = new State();
this.currentState.board = ["E","E","E","E","E","E","E","E","E"];
this.currentState.turn = "X"; //X plays first
this.status = "beginning" ;

//To advance to new states as the game continues
this.advanceTo = function(_state)
{
	this.currentState = _state;
 
	if(_state.isTerminal())
	{
       this.status = "Ended";
       $("p").text(this.currentState.result);
	}
	else if (this.currentState.turn === this.currentState.computerTurn)
		{
			//Ask the AI to play.
		    $("p").text("AI Playing");
		    this.ai.notify(this.currentState.computerTurn);   
        }
		else
		{
			 $("p").text("Your Turn");   
        }
};

//Function to start the game when the Game object is instantiated
this.start = function()
{
	
	if(this.status === "beginning")
	{
		this.status = "running";
		this.advanceTo(this.currentState);
	}
}

};

//A public static function that calculates the score of the X player when the game terminates
//Parameter- Terminal state

Game.score = function(_state)
{
	if(_state.result !== "still running")
	{
		if (_state.result == "X-won")
			return (10 - _state.oMovesCount);
		else if (_state.result == "O-won")
			return (-10 + _state.oMovesCount);
		else
			return 0;
	}
}

 var ui = {};



ui.insertAt = function(index, symbol)
{
	$(".cell").each(function(){
     if(($(this).attr("value")) == index)
       {
       	$(this).html(symbol);
       }
	});

};
