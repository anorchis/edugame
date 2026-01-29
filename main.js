// Game State
const state = {
    started: false,
    dialogueActive: false,
    currentLineIndex: 0,
    isTyping: false,
    typingSpeed: 50, // ms per char
    timeoutId: null
};

// Dialogue Data
const dialogueLines = [
    "하...",
    "다음 주가 벌써 한자 8급 시험이네",
    "책만 보면 왜 이렇게 잠이 오냐...",
    "응? (모니터를 발견하며)",
    "'할수록 머리가 좋아지는 게임'?",
    "세상에 그런 게임이 어딨어~",
    "에이, 속는 셈 치고 딱 한 판만 해볼까?",
    "이거 깨면 시험 백 점 맞는 거 아냐?"
];

// DOM Elements
const startScreen = document.getElementById('start-screen');
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueIndicator = document.getElementById('dialogue-indicator');
const backgroundLayer = document.getElementById('background-layer');

// Initialize
function init() {
    startScreen.addEventListener('click', startGameSequence);
    // Global click to advance dialogue if active
    document.addEventListener('click', (e) => {
        if (state.dialogueActive && !startScreen.contains(e.target)) {
            advanceDialogue();
        }
    });
}

// Start the Intro Sequence
function startGameSequence() {
    if (state.started) return;
    state.started = true;
    
    // Hide Start Screen
    startScreen.style.display = 'none';
    
    // Show Dialogue Box
    state.dialogueActive = true;
    dialogueBox.classList.remove('hidden');
    
    // Start First Line
    showLine(0);
}

// Display a line of dialogue
function showLine(index) {
    if (index >= dialogueLines.length) {
        finishIntro();
        return;
    }

    state.currentLineIndex = index;
    state.isTyping = true;
    dialogueIndicator.classList.add('hidden');
    dialogueText.textContent = ""; // Clear
    
    const line = dialogueLines[index];
    let charIndex = 0;

    function typeChar() {
        if (charIndex < line.length) {
            dialogueText.textContent += line[charIndex];
            charIndex++;
            state.timeoutId = setTimeout(typeChar, state.typingSpeed);
        } else {
            state.isTyping = false;
            dialogueIndicator.classList.remove('hidden');
        }
    }
    
    typeChar();
}

// Advance to next line or complete current typing instantly
function advanceDialogue() {
    if (state.isTyping) {
        // Instant finish
        clearTimeout(state.timeoutId);
        dialogueText.textContent = dialogueLines[state.currentLineIndex];
        state.isTyping = false;
        dialogueIndicator.classList.remove('hidden');
    } else {
        // Next line
        showLine(state.currentLineIndex + 1);
    }
}

// Finish Intro and Transition to Game (Placeholder)
function finishIntro() {
    state.dialogueActive = false;
    dialogueBox.classList.add('hidden');
    
    // Placeholder for Stage 1 transition
    console.log("Intro finished. Starting Stage 1...");
    alert("Intro Finished! Ready for Stage 1.");
    // In future: initStage(1);
}

// Run Init
init();