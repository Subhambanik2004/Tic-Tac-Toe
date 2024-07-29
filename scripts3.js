window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const backButton = document.querySelector('#back');
    const announcer = document.querySelector('.announcer');
    const modeSelection = document.querySelector('.mode-selection');
    const display = document.querySelector('.display');
    const container = document.querySelector('.container');
    const controls = document.querySelector('.controls');
    const twoPlayerButton = document.querySelector('#twoPlayer');
    const onePlayerButton = document.querySelector('#onePlayer');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = false;
    let isSinglePlayer = false;

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    function handleResultValidation() {
        let roundWon = false;
        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = board[winCondition[0]];
            const b = board[winCondition[1]];
            const c = board[winCondition[2]];
            if (a === '' || b === '' || c === '') {
                continue;
            }
            if (a === b && b === c) {
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return;
        }

        if (!board.includes('')) announce(TIE);
    }

    const announce = (type) => {
        switch (type) {
            case PLAYERO_WON:
                announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                break;
            case TIE:
                announcer.innerText = 'Tie';
        }
        announcer.classList.remove('hide');
    };

    const isValidAction = (tile) => {
        return tile.innerText === '' && isGameActive;
    };

    const updateBoard = (index) => {
        board[index] = currentPlayer;
    }

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
    }

    const userAction = (tile, index) => {
        if (isValidAction(tile) && isGameActive) {
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            handleResultValidation();
            if (isGameActive) {
                changePlayer();
                if (isSinglePlayer && currentPlayer === 'O') {
                    setTimeout(() => aiAction(), 500); // AI makes its move after 500ms
                }
            }
        }
    }

    const aiAction = () => {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax(board, 0, false);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }
        if (move !== undefined) {
            board[move] = 'O';
            tiles[move].innerText = 'O';
            tiles[move].classList.add('playerO');
            handleResultValidation();
            if (isGameActive) changePlayer();
        }
    }

    const minimax = (board, depth, isMaximizing) => {
        let scores = { X: 1, O: -1, TIE: 0 };
        let result = checkWinner();
        if (result !== null) {
            return scores[result];
        }

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    const checkWinner = () => {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (!board.includes('')) return 'TIE';
        return null;
    }

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        announcer.classList.add('hide');
        if (currentPlayer === 'O') {
            changePlayer();
        }
        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
        });
    }

    const backToMain = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = false; // Disable game
        announcer.classList.add('hide');
        display.classList.add('hide');
        container.classList.add('hide');
        controls.classList.add('hide');
        modeSelection.classList.remove('hide');
        disableTiles(); // Disable tiles
        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX');
            tile.classList.remove('playerO');
        });
        currentPlayer = 'X'; // Ensure X starts by default
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add('playerX');
    }

    const disableTiles = () => {
        tiles.forEach(tile => tile.classList.add('disabled'));
    }

    const enableTiles = () => {
        tiles.forEach(tile => tile.classList.remove('disabled'));
    }

    // Call disableTiles initially to disable the tiles
    disableTiles();

    // Update startGame function to enable tiles
    const startGame = () => {
        isGameActive = true; // Enable game
        modeSelection.classList.add('hide');
        display.classList.remove('hide');
        container.classList.remove('hide');
        controls.classList.remove('hide');
        enableTiles(); // Enable tiles
        currentPlayer = 'X'; // Ensure that X always starts
        playerDisplay.innerText = 'X';
        playerDisplay.classList.add('playerX');
    }

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);
    backButton.addEventListener('click', backToMain);
    twoPlayerButton.addEventListener('click', () => {
        isSinglePlayer = false;
        startGame();
    });
    onePlayerButton.addEventListener('click', () => {
        isSinglePlayer = true;
        startGame();
    });
});
