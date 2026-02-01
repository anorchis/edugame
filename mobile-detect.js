/**
 * 모바일 감지 및 자동 리다이렉트 스크립트
 * 모바일 기기 접속 시 /mobile/ 버전으로 자동 이동
 */
(function() {
    'use strict';

    // 이미 모바일 페이지에 있으면 실행하지 않음
    if (window.location.pathname.includes('/mobile/')) {
        return;
    }

    // 웹 버전 강제 접속 플래그 확인
    if (sessionStorage.getItem('forceDesktop') === 'true') {
        return;
    }

    // 모바일 감지 함수
    function isMobileDevice() {
        // User Agent 기반 감지
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

        // 터치 지원 + 화면 크기 기반 감지 (태블릿 포함)
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 1024;

        return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
    }

    // 모바일 페이지로 리다이렉트
    function redirectToMobile() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';

        // 현재 페이지에 맞는 모바일 페이지로 이동
        let mobilePath = '/mobile/';
        if (currentFile === 'stage1.html') {
            mobilePath += 'stage1.html';
        } else if (currentFile === 'stage2.html') {
            mobilePath += 'stage2.html';
        } else {
            mobilePath += 'index.html';
        }

        window.location.href = mobilePath;
    }

    // 모바일 기기면 자동 리다이렉트
    if (isMobileDevice()) {
        redirectToMobile();
    }
})();
