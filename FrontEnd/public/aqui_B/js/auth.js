function initAuthUI(enforceRedirect = false) {
    const loginModal = document.getElementById("loginModal");
    const userBtn = document.getElementById("userNameBtn");

    restoreLoginState();

    // 若在需要管理權限的頁面並且沒有權限，直接導向後台登入頁
    const isAdmin = !!(window.currentUser && (window.currentUser.role === "Admin" || window.currentUser.role === "0"));
    if (!isAdmin && enforceRedirect) {
        // 假設管理頁與登入頁同一資料夾，使用相對路徑導向
        window.location.href = 'aqui_main_B_login.html';
        return;
    }

    // 若未登入,自動顯示登入視窗（非強制導向情況）
    if (!window.currentUser && loginModal) {
        loginModal.classList.add("active");
    }

    if (userBtn) {
        userBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            if (!window.currentUser && loginModal) {
                loginModal.classList.add("active");
            }
        });
    }

    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async function() {
            const emailEl = document.getElementById("loginEmail");
            const pwdEl = document.getElementById("loginPassword");
            const email = emailEl ? emailEl.value : '';
            const pwd = pwdEl ? pwdEl.value : '';
            
            if (!email || !pwd) {
                alert("請輸入完整的 Email 和密碼");
                return;
            }

            try {
                const res = await fetch(window.api.getUrl('/login'), {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ Email: email, Password: pwd })
                });

                if (!res.ok) {
                    alert("登入失敗，請檢查帳號密碼");
                    return;
                }

                const data = await res.json();
                const token = data.token || data.Token || data.Token;
                localStorage.setItem("token", token);

                // 解析 token 並驗證權限
                const payload = JSON.parse(atob(token.split('.')[1]));
                const tokenRole = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.Role || payload.role;
                
                if (tokenRole !== "Admin" && tokenRole !== "0") {
                    alert("非管理員帳號無法登入後台");
                    localStorage.removeItem("token");
                    window.location.href = '../aqui_F/aqui_main_F_menu.html';
                    return;
                }

                window.currentUser = { 
                    id: payload.Id || payload.id,
                    name: payload.Name || payload.name, 
                    email: payload.Email || payload.email,
                    role: tokenRole
                };
                
                localStorage.setItem("adminData", JSON.stringify(window.currentUser));
                
                if (loginModal) loginModal.classList.remove("active");
                updateUserName();
                alert("登入成功");
            } catch (error) {
                console.error("登入錯誤:", error);
                alert("登入失敗，請稍後再試");
            }
        });
    }

    const closeLogin = document.getElementById("closeLogin");
    if (closeLogin) {
        closeLogin.addEventListener("click", function() {
            if (loginModal) loginModal.classList.remove("active");
        });
    }

    if (loginModal) {
        loginModal.addEventListener("click", function(e) {
            if (e.target === loginModal) {
                loginModal.classList.remove("active");
            }
        });
    }
}

function updateUserName() {
    const userBtn = document.getElementById("userNameBtn");
    if (userBtn) {
        userBtn.textContent = window.currentUser ? window.currentUser.name : "登入";
    }
}

function restoreLoginState() {
    const token = localStorage.getItem("token");
    const savedAdminData = localStorage.getItem("adminData");

    // 優先使用儲存的用戶資料
    if (savedAdminData) {
        try {
            window.currentUser = JSON.parse(savedAdminData);
            updateUserName();
            return;
        } catch (error) {
            console.error("解析用戶資料失敗:", error);
            localStorage.removeItem("adminData");
        }
    }

    // 如果沒有儲存的用戶資料,但有 token,從 token 解析
    if (typeof token === 'string' && token.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.Role || payload.role;
            
            window.currentUser = {
                id: payload.Id || payload.id,
                name: payload.Name || payload.name,
                email: payload.Email || payload.email,
                role: role
            };
            localStorage.setItem("adminData", JSON.stringify(window.currentUser));
            updateUserName();
        } catch (err) {
            console.error("Token 解析失敗:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("adminData");
            window.currentUser = null;
            updateUserName();
        }
    } else if (token) {
        console.warn("Invalid token format, removing token");
        localStorage.removeItem("token");
        localStorage.removeItem("adminData");
        window.currentUser = null;
        updateUserName();
    } else {
        window.currentUser = null;
        updateUserName();
    }
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("adminData");
    window.currentUser = null;
    updateUserName();
    // 導向後台登入頁
    try {
        // 如果當前在後台目錄，使用相對路徑
        window.location.href = 'aqui_main_B_login.html';
    } catch (e) {
        // fallback: 重新載入頁面
        window.location.reload();
    }
    
    const menu = document.getElementById("userMenu");
    if (menu) {
        menu.classList.remove("active");
    }
    
    if (typeof updateOverlay === 'function') {
        updateOverlay();
    }
}

function getAuthHeader() {
    const token = localStorage.getItem("token");
    if (typeof token === 'string' && token.split('.').length === 3) {
        return { "Authorization": `Bearer ${token}` };
    }
    return {};
}

// 跨分頁同步登入狀態
window.addEventListener('storage', function(e) {
    if (e.key !== 'token') return;

    const newToken = e.newValue;
    if (typeof newToken === 'string' && newToken.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.Role || payload.role;
            
            window.currentUser = { 
                id: payload.Id || payload.id,
                name: payload.Name || payload.name, 
                email: payload.Email || payload.email, 
                role: role 
            };
        } catch (err) {
            console.error("storage event: token 解析失敗", err);
            window.currentUser = null;
            localStorage.removeItem("token");
        }
    } else {
        window.currentUser = null;
    }
    
    updateUserName();
});
