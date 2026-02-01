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

    // 모바일 감지 함수
    function isMobileDevice() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 1024;
        return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
    }

    // 모바일 페이지로 리다이렉트
    function redirectToMobile() {
        window.location.href = 'mobile/index.html';
    }

    // 모바일 기기면 자동 리다이렉트
    if (isMobileDevice()) {
        redirectToMobile();
    }
})();
