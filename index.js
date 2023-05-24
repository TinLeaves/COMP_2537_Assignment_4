// Game variables
let cards = document.querySelectorAll('.pokeCard');
let isFlipped = false;
let firstCard, secondCard;
let numMatches = 0;
let numClicks = 0;
let pairsLeft;
let timerInterval;
let powerUpActive = false;
let isGameStarted = false;

function flipCard() {
  if (powerUpActive || !isGameStarted) return; // Prevent flipping cards during power-up or before the game starts

  if (this === firstCard) return; // Corner case 1: If the user clicks on the same card twice, do nothing
  
  if (this.classList.contains('matched')) return; // Corner case 2: If the user clicks on a card that is already matched, do nothing
  
  if (secondCard) return; // Corner case 3: If the user clicks on a card while two cards are already flipped, do nothing
  
  this.classList.add('flip');

  if (!isFlipped) {
    isFlipped = true;
    firstCard = this;
  } else {
    isFlipped = false;
    secondCard = this;

    checkForMatch();
    updateGameStats();
  }
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  if (isMatch) {
    disableCards();
    numMatches++;
    pairsLeft--;

    if (pairsLeft === 0) {
      endGame();
    }
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');
  resetBoard();
}

function unflipCards() {
  powerUpActive = true;

  setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    resetBoard();
    powerUpActive = false;
  }, 1000);
}

function resetBoard() {
  isFlipped = false;
  firstCard = null;
  secondCard = null;
}

function updateGameStats() {
  document.getElementById('matches').textContent = numMatches;
  document.getElementById('left').textContent = pairsLeft;
  document.getElementById('clicks').textContent = ++numClicks;
}

function endGame() {
  clearInterval(timerInterval);
  setTimeout(() => {
    alert('Congratulations! You have completed the game!');
  }, 500);
}

function fetchRandomPokemon(difficulty) {
  let gridRows, gridColumns, totalPairs;
  if (difficulty === 'easy') {
    gridRows = 2;
    gridColumns = 3;
    totalPairs = 3;
  } else if (difficulty === 'medium') {
    gridRows = 3;
    gridColumns = 4;
    totalPairs = 6;
  } else if (difficulty === 'hard') {
    gridRows = 4;
    gridColumns = 6;
    totalPairs = 12;
  } else {
    // Default to easy mode if no difficulty is provided
    gridRows = 2;
    gridColumns = 3;
    totalPairs = 3;
  }

  const totalCards = gridRows * gridColumns;

  return fetch('https://pokeapi.co/api/v2/pokemon?limit=810')
    .then(response => response.json())
    .then(data => data.results)
    .then(results => {
      // Shuffle the results array
      shuffleArray(results);
      const selectedResults = results.slice(0, totalPairs);

      const pokemonPromises = selectedResults.map(result => {
        return fetch(result.url)
          .then(response => response.json())
          .then(pokemonData => {
            return {
              name: pokemonData.name,
              image: pokemonData.sprites.front_default
            };
          });
      });
      return Promise.all(pokemonPromises);
    })
    .then(pokemons => {
      const duplicatedPokemons = [...pokemons, ...pokemons];
      shuffleArray(duplicatedPokemons);
      return duplicatedPokemons.slice(0, totalCards);
    });
}

// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateGameGrid(difficulty) {
  const gameGrid = document.getElementById('game_grid');
  gameGrid.innerHTML = ''; // Clear existing game grid
  isGameStarted = false;

  let gridRows, gridColumns, totalPairs;
  if (difficulty === 'easy') {
    gridRows = 2;
    gridColumns = 3;
    totalPairs = 3;
  } else if (difficulty === 'medium') {
    gridRows = 3;
    gridColumns = 4;
    totalPairs = 6;
  } else if (difficulty === 'hard') {
    gridRows = 4;
    gridColumns = 6;
    totalPairs = 12;
  } else {
    // Default to easy mode if no difficulty is provided
    gridRows = 2;
    gridColumns = 3;
    totalPairs = 3;
  }

  const totalCards = gridRows * gridColumns;

  fetchRandomPokemon(difficulty).then(pokemons => {
    const gridSizeClass = `grid-${totalCards}`;

    gameGrid.classList.add(gridSizeClass);
    pairsLeft = totalCards / 2;

    shuffleArray(pokemons); // Shuffle the pokemons array

    pokemons.forEach(pokemon => {
      const card = document.createElement('div');
      card.className = 'pokeCard';
      card.innerHTML = `
        <div class="card-inner">
          <div class="card-front">
            <img class="front_face" src="${pokemon.image}" alt="${pokemon.name}">
          </div>
          <div class="card-back">
            <img class="back_face" src="back.webp" alt="Pokemon">
          </div>
        </div>
      `;

      card.addEventListener('click', flipCard);

      card.dataset.name = pokemon.name;
      gameGrid.appendChild(card);
    });

    startGame(); // Start the game after generating the grid
  });
}

// Function to handle difficulty selection
function handleDifficultySelection() {
  const difficultyButtons = document.querySelectorAll('#difficulty label');
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedDifficulty = button.querySelector('input').value;
      generateGameGrid(selectedDifficulty);
    });
  });
}

// Function to start the game
function startGame() {
  numMatches = 0;
  numClicks = 0;
  isGameStarted = true;
  resetTimer();
  updateGameStats();
}

// Function to reset the timer
function resetTimer() {
  clearInterval(timerInterval);
  const timerElement = document.getElementById('timer');
  timerElement.textContent = '00:00';
}

// Function to update the timer
function updateTimer() {
  const timerElement = document.getElementById('timer');
  let seconds = 0;
  timerInterval = setInterval(() => {
    seconds++;
    const minutes = Math.floor(seconds / 60);
    const formattedSeconds = seconds % 60;
    timerElement.textContent = `${formatTime(minutes)}:${formatTime(formattedSeconds)}`;
  }, 1000);
}

// Function to format time values (prepend 0 if less than 10)
function formatTime(time) {
  return time < 10 ? `0${time}` : time;
}

// Function to handle reset button click
function handleResetButtonClick() {
  generateGameGrid();
  resetTimer();
}

// Function to handle start button click
function handleStartButtonClick() {
  startGame();
  updateTimer();
}

// Call the handleDifficultySelection function when the page loads
document.addEventListener('DOMContentLoaded', handleDifficultySelection);

// Call the generateGameGrid function with the desired difficulty level when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const difficulty = 'easy'; // Change the difficulty level here ('easy', 'medium', or 'hard')
  generateGameGrid(difficulty);
});

// Add event listener for reset button click
const resetButton = document.getElementById('reset_button');
resetButton.addEventListener('click', handleResetButtonClick);

// Add event listener for start button click
const startButton = document.getElementById('start_button');
startButton.addEventListener('click', handleStartButtonClick);
