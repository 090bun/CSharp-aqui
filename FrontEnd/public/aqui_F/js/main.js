document.addEventListener("DOMContentLoaded", function () {
        // 1. 先恢復登入狀態
    restoreLoginState();
    
    // 2. 初始化驗證 UI（登入/註冊視窗）
    initAuthUI();
    
    // 3. 初始化會員選單
    initUserMenu();
});