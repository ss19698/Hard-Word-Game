let isDarkMode = true;
let previousGuesses = []; // Array to store previous guesses
let gameOver = false; // Track if the game is over

// Show a specific page and hide others
function showPage(pageId) {
    // Hide all pages
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('instructions-page').classList.add('hidden');
    document.getElementById('game-page').classList.add('hidden');
    
    // Show the selected page
    document.getElementById(pageId).classList.remove('hidden');
    
    // If showing the game page, start a new game
    if (pageId === 'game-page') {
        startGame();
    }
}

function toggleMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode');
    document.querySelector('.toggle-mode').innerText = isDarkMode ? '🌙' : '☀';
}

const wordLists = {
    easy: ["Wind","Love","Tree","Fish"], 
    medium: ["Apple","Alive","Alert","Alter","Anger","Annoy","Ankle","Apart","Apply","Argue","Aroma","Birth","Black","Blade","Blame","Bleed","Bless","Blind","Block","Blood","Bloom",
"Blush","Board","Booth"], 
    hard: ["Abroad","Abrupt","absent","accept","access","acting","active","action","addict","adjoin","adjust","admire" ]
};

let secretWord = "";
let attempts = 0;
let maxAttempts = 0;

function updateInputLength() {
    let difficulty = document.getElementById("difficulty").value;
    const inputLength = difficulty === "easy" ? 4 : difficulty === "medium" ? 5 : 6;
    const guessInput = document.getElementById("guess");
    guessInput.setAttribute("maxlength", inputLength);
    guessInput.placeholder = `Enter a ${inputLength}-letter word`;
}

function startGame() {
    let difficulty = document.getElementById("difficulty").value;
    // Select a random word from the list and convert to uppercase for consistency
    let randomWord = wordLists[difficulty][Math.floor(Math.random() * wordLists[difficulty].length)];
    secretWord = randomWord.toUpperCase(); // Convert to uppercase for case-insensitive comparison
    attempts = 0;
    previousGuesses = []; // Reset previous guesses
    gameOver = false; // Reset the game over flag
    document.getElementById("message").innerText = "Guess the word!";
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("next").classList.add("hidden");
    document.getElementById("guess").value = "";
    updateInputLength();
    
    if(difficulty === "easy") {
        maxAttempts = 5;
    } else if(difficulty === "medium") {
        maxAttempts = 6;
    } else {
        maxAttempts = 8;
    }
}

function showEmoji() {
    const emojis = ["🎉", "🔥", "💯", "👏", "🥳"];
    let emoji = document.createElement("div");
    emoji.className = "popup-emoji";
    emoji.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(emoji);
    emoji.style.left = Math.random() * 90 + "%";
    emoji.style.top = Math.random() * 90 + "%";
    setTimeout(() => emoji.remove(), 3000);
}

async function isValidWord(word) {
    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    } catch (error) {
        console.error("API Error:", error);
        return false;
    }
}

async function checkGuess() {
    // Check if the game is over - don't allow more guesses
    if (gameOver) {
        return;
    }
    
    let guess = document.getElementById("guess").value.toUpperCase();
    
    // Check if word is the correct length
    if (guess.length !== secretWord.length) {
        alert(`Word must be exactly ${secretWord.length} letters!`);
        return;
    }
    
    // Check if this word has already been guessed
    if (previousGuesses.includes(guess)) {
        alert("You've already tried this word. Try a different one!");
        return;
    }

    // Check if the word is valid using dictionary API or word list
    let difficulty = document.getElementById("difficulty").value;
    
    // Case-insensitive search in the word list
    let isInWordList = wordLists[difficulty].some(word => word.toUpperCase() === guess);
    
    if (!isInWordList && !(await isValidWord(guess))) {
        alert("Invalid word! Try a real word from the dictionary.");
        return;
    }

    // Add to previous guesses
    previousGuesses.push(guess);
    
    let feedbackDiv = document.getElementById("feedback");
    let used = Array(secretWord.length).fill(false);
    let guessUsed = Array(guess.length).fill(false);
    let result = Array(guess.length).fill("");

    // First pass - check for exact matches (Green)
    for (let i = 0; i < guess.length; i++) {
        if (guess[i] === secretWord[i]) {
            result[i] = `<span class='letter green'>${guess[i]}</span>`;
            used[i] = true;
            guessUsed[i] = true;
        }
    }

    // Second pass - check for misplaced letters (Yellow)
    for (let i = 0; i < guess.length; i++) {
        if (!guessUsed[i]) {
            for (let j = 0; j < secretWord.length; j++) {
                if (!used[j] && guess[i] === secretWord[j]) {
                    result[i] = `<span class='letter yellow'>${guess[i]}</span>`;
                    used[j] = true;
                    guessUsed[i] = true;
                    break;
                }
            }
        }
    }

    // Third pass - mark incorrect letters (Gray)
    for (let i = 0; i < guess.length; i++) {
        if (!guessUsed[i]) {
            result[i] = `<span class='letter gray'>${guess[i]}</span>`;
        }
    }

    // Show the feedback with letters in the correct order
    feedbackDiv.innerHTML += `<div>${result.join("")}</div>`;
    
    // Clear the input field for the next guess
    document.getElementById("guess").value = "";
    
    attempts++;

    if (guess === secretWord) {
        document.getElementById("message").innerText = "🎉 Congratulations! You guessed the word!";
        document.getElementById("next").classList.remove("hidden");
        for (let i = 0; i < 5; i++) setTimeout(showEmoji, i * 300);
        // Set gameOver to true when correct word is guessed
        gameOver = true;
    } else if (attempts >= maxAttempts) {
        document.getElementById("message").innerText = `❌ Game Over! The word was ${secretWord}`;
        document.getElementById("next").classList.remove("hidden");
        // Set gameOver to true when max attempts are reached
        gameOver = true;
    }
}

// Add event listener for enter key on guess input
document.getElementById("guess").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

// Start with the landing page visible by default
window.onload = function() {
    showPage('landing-page');
};
