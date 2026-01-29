# 마법천자문: 8급 한자 수호대 - Development Blueprint

## 1. Project Overview
A web-based 2D side-scrolling runner game designed to help users study 8th-grade Hanja (Chinese characters). The game features a story-driven progression through 3 stages and an intro/outro sequence.

**Target Audience:** Students studying for 8th-grade Hanja proficiency.
**Core Mechanics:** Run, Jump, Attack (Shoot Hanja), Collect Hanja.

## 2. Game Structure

### Intro (Village)
- **Visuals:** Background `img/bg.png`.
- **Audio:** Background music (to be implemented), Voice effects?
- **Action:**
    -   User clicks to start.
    -   Story dialogue sequence (Typewriter effect).
    -   Transition to Stage 1.

### Stage 1 (Forest - Day)
- **Background:** `img/bg1.png`
- **Player:** Run (`run1-3`), Jump (`jump1-2`), Attack (`attack1-2`).
- **Enemies:** Monster 1 (`monster1/motion1-3`).
- **Obstacles:** `img/obstacle1.png`.
- **Items:** `img/item1.png` ~ `item3.png`.
- **Goal:** Survive, collect Hanja, defeat monsters.

### Stage 2 (Mountain - Sunset)
- **Background:** `img/bg2.png`
- **Enemies:** Monster 2 (`monster2/motion1-3`).
- **Obstacles:** `img/obstacle2.png`.
- **Items:** `img/item4.png` ~ `item6.png`.

### Stage 3 (Dungeon)
- **Background:** `img/bg3.png`
- **Enemies:** Monster 3 (`monster3/motion1-3`).
- **Obstacles:** `img/obstacle3.png`.
- **Items:** `img/item7.png` ~ `item9.png`.

### Outro (Village)
- **Background:** `img/bg4.png`
- **Action:** Final dialogue and "Mission Complete".

## 3. Technical Stack
- **Frontend:** HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+).
- **Rendering:** HTML5 Canvas for gameplay, DOM for UI layers.
- **Assets:** Pre-provided PNGs in `img/` folder.

## 4. Implementation Plan (Current Request)
- **Focus:** Intro Sequence.
- **Tasks:**
    1.  Setup `index.html` with Tailwind CSS and Game Canvas/Container.
    2.  Implement `main.js` to handle:
        -   Asset loading.
        -   Scene management (Intro -> Stage1).
        -   Intro Dialogue System (Typewriter effect).
    3.  Implement the specific dialogue lines provided by the user.

## 5. Hanja Database (8th Grade)
(List of 50 characters to be used for game logic)
가르칠 교, 학교 교, 아홉 구, 나라 국, 군사 군, 쇠 금, 남녘 남, 계집 녀, 해 년, 큰 대, 동녘 동, 여섯 육, 일만 만, 어머니 모, 나무 목, 문 문, 백성 민, 흰 백, 아버지 부, 북녘 북, 넉 사, 뫼 산, 석 삼, 날 생, 서녘 서, 먼저 선, 작을 소, 물 수, 집 실, 열 십, 다섯 오, 임금 왕, 바깥 외, 달 월, 두 이, 사람 인, 한 일, 날 일, 길 장, 아우 제, 가운데 중, 푸를 청, 마디 촌, 일곱 칠, 흙 토, 여덟 팔, 배울 학, 나라이름 한, 형 형, 불 화
