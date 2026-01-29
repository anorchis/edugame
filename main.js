// Game State
const state = {
    started: false, // True once dialogue intro starts
    dialogueActive: false,
    currentLineIndex: 0,
    isTyping: false,
    typingSpeed: 50, // ms per char
    timeoutId: null,
    currentAudio: null, // Track playing audio
    currentUser: null, // Logged in user info
    
    // Village Scene State (bg4)
    village: {
        active: false,
        playerX: 50, // Initial X position
        playerY: 150, // Fixed Y position (adjust based on container height)
        direction: 'right', // 'right' or 'left'
        isMoving: false,
        animationFrame: 0,
        lastFrameTime: 0,
        frameInterval: 100, // Animation speed (ms)
        currentImageIndex: 1, // 1, 2, 3
        speed: 4, // Movement speed
        boriInteraction: false // Has interacted with Bori?
    },
    
    keys: {
        ArrowRight: false,
        ArrowLeft: false
    }
};

// Dialogue Data
const introLines = [
    "하...다음 주가 벌써 한자 8급 시험이네...",
    "책만 보면 왜 이렇게 잠이 오냐...",
    "응? (모니터를 발견하며)",
    "'할수록 머리가 좋아지는 게임'?",
    "세상에 그런 게임이 어딨어~",
    "에이, 속는 셈 치고 딱 한 판만 해볼까?",
    "이거 깨면 시험 백 점 맞는 거 아냐?"
];

const boriLines = [
    "안녕, 미래의 한자 수호자! 여긴 한자의 신비로운 힘이 깃든 '화과산'이야.",
    "우리 수호자들은 아주 오래전부터 '마법천자문'의 글귀를 외치며 세상을 보살펴왔어.",
    "'불 화(火)'를 외치면 따뜻한 불씨가 생기고, '물 수(水)'를 외치면 맑은 시냇물이 흐르는 평화로운 곳이었지.",
    "우리는 이 한자의 힘으로 세상의 질서를 지키고 있었단다."
];

let currentDialogueSet = introLines; // Track which dialogue to show

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
const playerImage = gameView.querySelector('img[alt="Player"]'); // Select the player image
const npcBori = document.getElementById('npc-bori'); // Select Bori NPC

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
        if (currentDialogueSet === introLines) {
            finishIntro();
        } else if (currentDialogueSet === boriLines) {
            finishBoriDialogue();
        }
    });

    // Global click to advance dialogue if active
    document.addEventListener('click', (e) => {
        // Only advance dialogue if dialogue is active and click is not on auth overlay or skip button
        if (state.dialogueActive && !authOverlay.contains(e.target) && !skipButton.contains(e.target)) {
            advanceDialogue();
        }
    });
    
    // Spacebar to advance dialogue
    window.addEventListener('keydown', (e) => {
        if (state.dialogueActive && (e.code === 'Space' || e.key === ' ')) {
            advanceDialogue();
        }
    });

    // Movement Key Listeners
    window.addEventListener('keydown', (e) => {
        if (state.village.active && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            state.keys[e.key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (state.village.active && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
            state.keys[e.key] = false;
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
        startVillageScene(); // Start Village Logic
    } else {
        alert("아이디 또는 비밀번호가 잘못되었습니다.");
    }
}

// Start Village Scene Logic
function startVillageScene() {
    state.village.active = true;
    state.village.playerX = 50; // Reset position
    state.village.boriInteraction = false;
    requestAnimationFrame(updateVillageLoop);
}

// Village Scene Game Loop
function updateVillageLoop(timestamp) {
    if (!state.village.active) return;

    // Skip movement update if dialogue is active (freeze player)
    if (state.dialogueActive) {
         requestAnimationFrame(updateVillageLoop);
         return;
    }

    // 1. Update Movement
    if (state.keys.ArrowRight) {
        state.village.direction = 'right';
        state.village.isMoving = true;
        state.village.playerX += state.village.speed;
    } else if (state.keys.ArrowLeft) {
        state.village.direction = 'left';
        state.village.isMoving = true;
        state.village.playerX -= state.village.speed;
    } else {
        state.village.isMoving = false;
    }

    // Boundary Checks (Container width ~660px, player width ~80px)
    if (state.village.playerX < -20) state.village.playerX = -20;
    if (state.village.playerX > 560) state.village.playerX = 560;

    // Apply Position
    playerImage.style.left = `${state.village.playerX}px`;

    // 2. Handle Animation
    if (state.village.isMoving) {
        if (timestamp - state.village.lastFrameTime > state.village.frameInterval) {
            state.village.currentImageIndex++;
            if (state.village.currentImageIndex > 3) state.village.currentImageIndex = 1;
            state.village.lastFrameTime = timestamp;
            
            // Update Image Source
            const prefix = state.village.direction === 'right' ? 'run' : 'left';
            playerImage.src = `img/${prefix}${state.village.currentImageIndex}.png`;
        }
    } else {
        // Idle State
        const prefix = state.village.direction === 'right' ? 'run' : 'left';
        playerImage.src = `img/${prefix}1.png`; // Reset to frame 1
    }

    // 3. Check Collision with Bori & Interaction
    // Bori is at right-[161px]. Container 660px.
    // Bori Width ~96px. Bori Left position ~= 660 - 161 - 96 = 403px.
    // Let's set a stop point before Bori, e.g., at X=325.

    if (state.village.playerX > 325) {
        // Stop player from moving past Bori
        state.village.playerX = 325;
        
        // Trigger interaction if not yet triggered
        if (!state.village.boriInteraction) {
            state.village.boriInteraction = true;
            triggerBoriDialogue();
        }
    }

    // Apply Position
    playerImage.style.left = `${state.village.playerX}px`;

    requestAnimationFrame(updateVillageLoop);
}

function triggerBoriDialogue() {
    console.log("Meeting Bori Dosa!");
    
    // Change Appearance
    npcBori.src = "img/bori2.png";
    npcBori.classList.remove('animate-float');
    
    // Setup Dialogue
    currentDialogueSet = boriLines;
    state.dialogueActive = true;
    dialogueBox.classList.remove('hidden');
    skipButton.classList.remove('hidden'); // Show skip button
    
    // Start Dialogue
    showLine(0);
}

// Play audio for the specific line
function playDialogueAudio(index) {
    // Only play audio for intro lines for now
    if (currentDialogueSet !== introLines) return;

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
    if (index >= currentDialogueSet.length) {
        if (currentDialogueSet === introLines) {
            finishIntro();
        } else if (currentDialogueSet === boriLines) {
            finishBoriDialogue();
        }
        return;
    }

    state.currentLineIndex = index;
    state.isTyping = true;
    dialogueIndicator.classList.add('hidden');
    dialogueText.textContent = ""; // Clear
    
    // Play Audio (only for intro)
    playDialogueAudio(index);

    const line = currentDialogueSet[index];
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
        dialogueText.textContent = currentDialogueSet[state.currentLineIndex];
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

function finishBoriDialogue() {
    state.dialogueActive = false;
    dialogueBox.classList.add('hidden');
    skipButton.classList.add('hidden'); // Hide skip button
    alert("보리 도사와의 대화 끝! 이제 Stage 1으로 이동합니다.");
    // TODO: Transition to Stage 1
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

// Run Init
init();