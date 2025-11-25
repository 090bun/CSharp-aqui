// 標記是否已初始化，避免重複綁定
let userMenuInitialized = false;

function initUserMenu() {
    const btn = document.getElementById("userNameBtn");
    const menu = document.getElementById("userMenu");
    const overlay = document.getElementById("overlay");

    // 若頁面沒有相關元素，安全返回
    if (!btn || !menu || !overlay) return;
    
    // 若已初始化，避免重複綁定事件
    if (userMenuInitialized) return;
    userMenuInitialized = true;

    // 點擊會員名稱按鈕
    btn.addEventListener("click", function (e) {
        e.stopPropagation();

        if (!window.currentUser) {
            const loginModal = document.getElementById("loginModal");
            if (loginModal) loginModal.classList.add("active");
            console.log("點擊登入");
            return;
        }

        const rect = btn.getBoundingClientRect();
        const menuWidth = menu.offsetWidth || 200;
        const left = Math.max(8, Math.min(rect.right - menuWidth + window.scrollX, window.innerWidth - menuWidth - 8));
        const top = rect.bottom + window.scrollY + 8;

        menu.style.left = left + "px";
        menu.style.top = top + "px";

        if (menu.classList.contains("active")) {
            menu.classList.remove("active");
        } else {
            menu.classList.add("active");
        }
        menu.classList.add("active");
        if (typeof updateOverlay === 'function') updateOverlay();
    });

    // 點擊頁面其他地方關閉選單
    document.addEventListener("click", function () {
        menu.classList.remove("active");
        if (typeof updateOverlay === 'function') updateOverlay();
    });

    // 點擊選單本身不關閉
    menu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    // 點擊遮罩關閉選單
    overlay.addEventListener("click", function () {
        menu.classList.remove("active");
        if (typeof updateOverlay === 'function') updateOverlay();
    });

    // 登出按鈕事件監聽
    const logoutItems = menu.querySelectorAll(".menu-item");
    logoutItems.forEach(item => {
        if (item.textContent.trim() === "登出") {
            item.addEventListener("click", function(e) {
                e.stopPropagation();
                if (typeof logout === 'function') {
                    logout();
                    alert("已登出");
                    
                }
            });
        }
    });
}

// 監聽 auth-ready 與 DOMContentLoaded：任一事件都會嘗試初始化一次
document.addEventListener("auth-ready", initUserMenu);
document.addEventListener("DOMContentLoaded", initUserMenu);
