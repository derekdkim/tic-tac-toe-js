// Gameboard module
const gameBoard = (() => {
  let boardArray = [];
  const winningConditions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
  let gameEnded = false;

  // Gameboard setup methods
  const createGrid = () => {
    const container = document.querySelector('#gameboard-container');
    for (let i = 0; i < 9; i++) {
      const block = document.createElement('div');
      block.classList.add('grid');
      block.setAttribute('id', `${i}`);
      container.appendChild(block);
    }
  };

  const populateArray = () => {
    for (let x = 0; x < 9; x++) {
      boardArray.push('');
    }
  };

  const setupGameBoard = () => {
    createGrid();
    populateArray();
    updateGrid();
  };

  const resetGameBoard = () => {
    boardArray = [];
    populateArray();
    gameEnded = false;
    updateGrid();
  };

  // Update the tic-tac-toe grid on the DOM
  const updateGrid = () => {
    const gridArr = document.querySelectorAll('.grid');
    for (let i = 0; i < gridArr.length; i++) {
      gridArr[i].innerHTML = `<div>${boardArray[i]}</div>`;
    }
  };

  const markGrid = (index, mark) => {
    if (boardArray[index].length === 0 && !gameEnded) {
      boardArray.splice(index, 1, mark);
      return true;
    }
    // When nothing was marked, boolean output determines whether CPU should mark
    return false;
  };

  const checkForWinner = () => {
    for (let i = 0; i < winningConditions.length; i++) {
      const combo = winningConditions[i];
      if (boardArray[combo[0]].length > 0) {
        if (boardArray[combo[0]] === boardArray[combo[1]] && boardArray[combo[1]] === boardArray[combo[2]]) {
          const winningMark = boardArray[combo[0]];
          return winningMark;
        }
      }
    }
    const emptySlots = boardArray.filter(slot => slot === '').length;
    if (emptySlots === 0) {
      return 'draw';
    }
    return null;
  };

  const checkGameState = () => {
    if (checkForWinner() != null) {
      gameEnded = true;
      if (checkForWinner() === 'draw') {
        document.getElementById('message').innerHTML = 'Draw!';
      } else {
        document.getElementById('message').innerHTML = `${checkForWinner()} is the winner!`;
      }
    } else {
      gameEnded = false;
    }
  };

  // Getter methods
  const getBoardArray = () => {
    return boardArray;
  };

  const getEmptyIndices = () => {
    const indexArray = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    return indexArray.filter(slot => boardArray[slot].length === 0);
  };

  const didGameEnd = () => {
    return gameEnded;
  };

  return {
    setupGameBoard,
    markGrid,
    updateGrid,
    getBoardArray,
    didGameEnd,
    resetGameBoard,
    checkGameState,
    checkForWinner,
    getEmptyIndices
  };
})();

// Player factory
const Player = (markType) => {
  const markGrid = (id) => {
    return gameBoard.markGrid(id, markType);
  };

  const randomlyMark = () => {
    const emptyIndices = gameBoard.getEmptyIndices();

    if (emptyIndices.length > 1) {
      const randomIndex = Math.floor(Math.random() * emptyIndices.length);
      markGrid(emptyIndices[randomIndex]);
    }
  };

  const optimalMark = () => {
    /* 1. Check how many slots are empty -- May be better practice to make a new function that does that for both random and optimal */
    /* 2. Iterate through each, use minmax to determine the best outcome */
    /* 3. Mark the optimal slot */
    const boardArray = gameBoard.getBoardArray();
    const emptyIndices = gameBoard.getEmptyIndices();
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < emptyIndices.length; i++) {
      boardArray[emptyIndices[i]] = 'X';
      const score = minimax(boardArray, 0, -Infinity, Infinity, false);
      boardArray[emptyIndices[i]] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = emptyIndices[i];
      }
    }
    gameBoard.markGrid(bestMove, 'X');
  };

  // Uses alpha-beta pruning to speed up runtime
  const minimax = (boardArray, depth, alpha, beta, isMaximizing) => {
    const outcome = { X: 1, O: -1, draw: 0 };

    // Check for the winner
    const winner = gameBoard.checkForWinner();
    if (winner != null) {
      return outcome[winner];
    }
    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardArray[i] === '') {
          boardArray[i] = 'X';
          const score = minimax(boardArray, depth + 1, alpha, beta, false);
          boardArray[i] = '';
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) {
            break;
          }
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardArray[i] === '') {
          boardArray[i] = 'O';
          const score = minimax(boardArray, depth + 1, alpha, beta, true);
          boardArray[i] = '';
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, score);
          if (beta <= alpha) {
            break;
          }
        }
      }
      return bestScore;
    }
  };

  return {
    markGrid,
    randomlyMark,
    optimalMark
  };
};

/* Main Function */
document.addEventListener('DOMContentLoaded', () => {
  gameBoard.setupGameBoard();
  const humanPlayer = Player('O');
  const CPUPlayer = Player('X');
  CPUPlayer.randomlyMark();
  gameBoard.updateGrid();

  document.querySelectorAll('.grid').forEach(slot => {
    slot.addEventListener('click', () => {
      if (!gameBoard.didGameEnd()) {
        const didItMark = humanPlayer.markGrid(slot.id);
        if (didItMark) {
          CPUPlayer.optimalMark();
        }
        gameBoard.checkGameState();
        gameBoard.updateGrid();
      }
    });
  });

  /* Reset Button */
  document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('message').innerHTML = '';
    gameBoard.resetGameBoard();
    CPUPlayer.randomlyMark();
    gameBoard.updateGrid();
  });
});
