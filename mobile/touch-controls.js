/**
 * 모바일 터치 컨트롤 시스템
 * 가상 조이스틱 + 액션 버튼
 */

class TouchControls {
    constructor(options = {}) {
        this.options = {
            joystickContainer: options.joystickContainer || null,
            buttonContainer: options.buttonContainer || null,
            joystickSize: options.joystickSize || 120,
            knobSize: options.knobSize || 50,
            deadzone: options.deadzone || 0.1,
            onMove: options.onMove || (() => {}),
            onAttack: options.onAttack || (() => {}),
            onJump: options.onJump || (() => {}),
            ...options
        };

        this.joystick = null;
        this.knob = null;
        this.attackBtn = null;
        this.jumpBtn = null;

        this.joystickActive = false;
        this.joystickTouchId = null;
        this.joystickCenter = { x: 0, y: 0 };
        this.currentDirection = { x: 0, y: 0 };

        this.init();
    }

    init() {
        if (this.options.joystickContainer) {
            this.createJoystick();
        }
        if (this.options.buttonContainer) {
            this.createButtons();
        }
    }

    createJoystick() {
        const container = this.options.joystickContainer;
        const size = this.options.joystickSize;
        const knobSize = this.options.knobSize;

        // 조이스틱 베이스
        this.joystick = document.createElement('div');
        this.joystick.className = 'virtual-joystick';
        this.joystick.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
            border: 3px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            position: relative;
            touch-action: none;
        `;

        // 조이스틱 노브 (움직이는 부분)
        this.knob = document.createElement('div');
        this.knob.className = 'joystick-knob';
        this.knob.style.cssText = `
            width: ${knobSize}px;
            height: ${knobSize}px;
            background: radial-gradient(circle, #f59e0b 0%, #d97706 100%);
            border: 3px solid #fef3c7;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            transition: transform 0.05s ease-out;
        `;

        this.joystick.appendChild(this.knob);
        container.appendChild(this.joystick);

        // 터치 이벤트 바인딩
        this.joystick.addEventListener('touchstart', this.handleJoystickStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleJoystickMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleJoystickEnd.bind(this), { passive: false });
        document.addEventListener('touchcancel', this.handleJoystickEnd.bind(this), { passive: false });
    }

    createButtons() {
        const container = this.options.buttonContainer;

        // 공격 버튼
        this.attackBtn = document.createElement('button');
        this.attackBtn.className = 'action-btn attack-btn';
        this.attackBtn.innerHTML = '⚔️';
        this.attackBtn.style.cssText = `
            width: 70px;
            height: 70px;
            background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
            border: 3px solid #fef2f2;
            border-radius: 50%;
            font-size: 28px;
            color: white;
            box-shadow: 0 4px 0 #b91c1c, 0 6px 12px rgba(0,0,0,0.4);
            touch-action: manipulation;
            margin-bottom: 12px;
        `;

        // 점프 버튼
        this.jumpBtn = document.createElement('button');
        this.jumpBtn.className = 'action-btn jump-btn';
        this.jumpBtn.innerHTML = '⬆️';
        this.jumpBtn.style.cssText = `
            width: 70px;
            height: 70px;
            background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
            border: 3px solid #eff6ff;
            border-radius: 50%;
            font-size: 28px;
            color: white;
            box-shadow: 0 4px 0 #1d4ed8, 0 6px 12px rgba(0,0,0,0.4);
            touch-action: manipulation;
        `;

        // 버튼 컨테이너 래퍼
        const btnWrapper = document.createElement('div');
        btnWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
        `;

        btnWrapper.appendChild(this.attackBtn);
        btnWrapper.appendChild(this.jumpBtn);
        container.appendChild(btnWrapper);

        // 버튼 이벤트
        this.attackBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.attackBtn.style.transform = 'translateY(4px)';
            this.attackBtn.style.boxShadow = '0 0 0 #b91c1c, 0 2px 6px rgba(0,0,0,0.4)';
            this.options.onAttack();
        }, { passive: false });

        this.attackBtn.addEventListener('touchend', () => {
            this.attackBtn.style.transform = '';
            this.attackBtn.style.boxShadow = '0 4px 0 #b91c1c, 0 6px 12px rgba(0,0,0,0.4)';
        });

        this.jumpBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.jumpBtn.style.transform = 'translateY(4px)';
            this.jumpBtn.style.boxShadow = '0 0 0 #1d4ed8, 0 2px 6px rgba(0,0,0,0.4)';
            this.options.onJump();
        }, { passive: false });

        this.jumpBtn.addEventListener('touchend', () => {
            this.jumpBtn.style.transform = '';
            this.jumpBtn.style.boxShadow = '0 4px 0 #1d4ed8, 0 6px 12px rgba(0,0,0,0.4)';
        });
    }

    handleJoystickStart(e) {
        e.preventDefault();
        const touch = e.changedTouches[0];
        this.joystickActive = true;
        this.joystickTouchId = touch.identifier;

        const rect = this.joystick.getBoundingClientRect();
        this.joystickCenter = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };

        this.updateKnobPosition(touch.clientX, touch.clientY);
    }

    handleJoystickMove(e) {
        if (!this.joystickActive) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.joystickTouchId) {
                e.preventDefault();
                this.updateKnobPosition(touch.clientX, touch.clientY);
                break;
            }
        }
    }

    handleJoystickEnd(e) {
        for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.joystickTouchId) {
                this.joystickActive = false;
                this.joystickTouchId = null;
                this.resetKnob();
                break;
            }
        }
    }

    updateKnobPosition(touchX, touchY) {
        const maxDist = this.options.joystickSize / 2 - this.options.knobSize / 4;

        let dx = touchX - this.joystickCenter.x;
        let dy = touchY - this.joystickCenter.y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > maxDist) {
            dx = (dx / dist) * maxDist;
            dy = (dy / dist) * maxDist;
        }

        // 노브 위치 업데이트
        this.knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

        // 정규화된 방향 (-1 ~ 1)
        const normalizedX = dx / maxDist;
        const normalizedY = dy / maxDist;

        // 데드존 적용
        this.currentDirection = {
            x: Math.abs(normalizedX) > this.options.deadzone ? normalizedX : 0,
            y: Math.abs(normalizedY) > this.options.deadzone ? normalizedY : 0
        };

        this.options.onMove(this.currentDirection);
    }

    resetKnob() {
        this.knob.style.transform = 'translate(-50%, -50%)';
        this.currentDirection = { x: 0, y: 0 };
        this.options.onMove(this.currentDirection);
    }

    getDirection() {
        return { ...this.currentDirection };
    }

    destroy() {
        if (this.joystick) {
            this.joystick.remove();
        }
        if (this.attackBtn) {
            this.attackBtn.remove();
        }
        if (this.jumpBtn) {
            this.jumpBtn.remove();
        }
    }
}

// 전역으로 내보내기
window.TouchControls = TouchControls;
