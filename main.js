// Game State
const state = {
    started: false, // True once dialogue intro starts
    dialogueActive: false,
    currentLineIndex: 0,
    isTyping: false,
    typingSpeed: 50, // ms per char
    timeoutId: null,
    currentAudio: null, // Track playing audio
    currentUser: null // Logged in user info
};

// Dialogue Data
const dialogueLines = [
    "하...다음 주가 벌써 한자 8급 시험이네...",
    "책만 보면 왜 이렇게 잠이 오냐...",
    "응? (모니터를 발견하며)",
    "'할수록 머리가 좋아지는 게임'?",
    "세상에 그런 게임이 어딨어~",
    "에이, 속는 셈 치고 딱 한 판만 해볼까?",
    "이거 깨면 시험 백 점 맞는 거 아냐?"
];

// Audio Mapping
const audioFiles = [
    "sound/intro1.m4a",
    "sound/intro2.m4a",
    "sound/intro3.m4a",
    "sound/intro4.m4a",
    "sound/intro5.m4a",
    "sound/intro6.m4a",
    "sound/intro7.m4a",
    null // No audio for the last line
];

// DOM Elements (Game UI)
const gameContainer = document.getElementById('game-container');
const startScreen = document.getElementById('start-screen'); // Click to start intro
const dialogueBox = document.getElementById('dialogue-box');
const dialogueText = document.getElementById('dialogue-text');
const dialogueIndicator = document.getElementById('dialogue-indicator');
const skipButton = document.getElementById('skip-button');

// Game View Elements
const gameView = document.getElementById('game-view');
const gameLevelDisplay = document.getElementById('game-level-display');

// DOM Elements (Auth UI)
const authOverlay = document.getElementById('auth-overlay');
const authMenu = document.getElementById('auth-menu');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const btnShowLogin = document.getElementById('btn-show-login');
const btnShowSignup = document.getElementById('btn-show-signup');
const btnLoginSubmit = document.getElementById('btn-login-submit');
const btnSignupSubmit = document.getElementById('btn-signup-submit');
const loginIdInput = document.getElementById('login-id');
const loginPwInput = document.getElementById('login-pw');
const signupIdInput = document.getElementById('signup-id');
const signupPwInput = document.getElementById('signup-pw');
const backButtons = document.querySelectorAll('.btn-back');

// Initialize
function init() {
    // Initial setup: Show start screen, hide auth overlay and game view
    startScreen.classList.remove('hidden');
    authOverlay.classList.add('hidden');
    gameView.classList.add('hidden');

    // Start Screen Event Listener (to begin dialogue intro)
    startScreen.addEventListener('click', startGameSequence);
    
    // Auth Event Listeners
    btnShowLogin.addEventListener('click', () => showAuthView('login'));
    btnShowSignup.addEventListener('click', () => showAuthView('signup'));
    
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => showAuthView('menu'));
    });

    btnSignupSubmit.addEventListener('click', handleSignup);
    btnLoginSubmit.addEventListener('click', handleLogin);

    // Skip Button Event Listener (for dialogue intro)
    skipButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent global click from firing
        finishIntro();
    });

    // Global click to advance dialogue if active
    document.addEventListener('click', (e) => {
        // Only advance dialogue if dialogue is active and click is not on auth overlay or skip button
        if (state.dialogueActive && !authOverlay.contains(e.target) && !skipButton.contains(e.target)) {
            advanceDialogue();
        }
    });
}

// Auth View Switcher
function showAuthView(view) {
    authMenu.classList.add('hidden');
    loginForm.classList.add('hidden');
    signupForm.classList.add('hidden');

    if (view === 'menu') authMenu.classList.remove('hidden');
    else if (view === 'login') loginForm.classList.remove('hidden');
    else if (view === 'signup') signupForm.classList.remove('hidden');
}

// Handle Sign Up
function handleSignup() {
    const id = signupIdInput.value.trim();
    const pw = signupPwInput.value.trim();

    if (!id || !pw) {
        alert("아이디와 비밀번호를 모두 입력해주세요.");
        return;
    }

    const users = JSON.parse(localStorage.getItem('edugame_users') || '{}');

    if (users[id]) {
        alert("이미 존재하는 아이디입니다.");
        return;
    }

    // Save new user
    users[id] = { password: pw, level: 1 }; // Default level 1
    localStorage.setItem('edugame_users', JSON.stringify(users));
    
    alert("가입이 완료되었습니다! 로그인해주세요.");
    showAuthView('login');
}

// Handle Login
function handleLogin() {
    const id = loginIdInput.value.trim();
    const pw = loginPwInput.value.trim();

    if (!id || !pw) {
        alert("아이디와 비밀번호를 입력해주세요.");
        return;
    }

    const users = JSON.parse(localStorage.getItem('edugame_users') || '{}');
    const user = users[id];

    if (user && user.password === pw) {
        // Login Success
        state.currentUser = { id: id, ...user };
        console.log(`Logged in as ${id}, Level: ${user.level}`);
        
        // Hide Auth Overlay and Show Game View
        authOverlay.classList.add('hidden');
        gameView.classList.remove('hidden');
        
        // Update Level Display
        if(gameLevelDisplay) {
            gameLevelDisplay.textContent = user.level;
        }

        // Clean up UI elements
        dialogueBox.classList.add('hidden');
        skipButton.classList.add('hidden');
        
        console.log("Game View Started");
    } else {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
    }
}

// Start the Intro Sequence (Dialogue)
function startGameSequence() {
    if (state.started) return;
    state.started = true;
    
    // Hide initial start screen, show dialogue box, skip button
    startScreen.style.display = 'none'; // Hide the "Click to Start" screen
    state.dialogueActive = true;
    dialogueBox.classList.remove('hidden');
    skipButton.classList.remove('hidden');
    
    // Start First Line
    showLine(0);
}

// Play audio for the specific line
function playDialogueAudio(index) {
    // Stop any currently playing audio
    if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio.currentTime = 0;
    }

    // Check if audio exists for this line
    if (index < audioFiles.length && audioFiles[index]) {
        state.currentAudio = new Audio(audioFiles[index]);
        state.currentAudio.play().catch(e => console.log("Audio play failed:", e));
    }
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
    
    // Play Audio
    playDialogueAudio(index);

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

// Finish Intro (Dialogue) and Transition to Auth Screen
function finishIntro() {
    state.dialogueActive = false;
    dialogueBox.classList.add('hidden');
    skipButton.classList.add('hidden');
    
    // Stop any audio
    if (state.currentAudio) {
        state.currentAudio.pause();
        state.currentAudio.currentTime = 0;
    }
    
    // Show the Auth Overlay
    authOverlay.classList.remove('hidden');
    showAuthView('menu'); // Show the login/signup choice
    
    console.log("Intro finished. Showing Login/Signup.");
}

// Run Init
init();
