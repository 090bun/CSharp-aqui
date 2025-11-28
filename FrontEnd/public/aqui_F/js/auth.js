function initAuthUI() {
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const registerDone = document.getElementById("registerDone");
    const userBtn = document.getElementById("userNameBtn");

    // 頁面載入時檢查 localStorage 是否有 token，恢復登入狀態

    restoreLoginState();

    if (userBtn) {
        userBtn.addEventListener("click", function(e){
            e.stopPropagation();
            if (!window.currentUser) {
                if (loginModal) loginModal.classList.add("active");
            }
        });
    }
    var name = window.currentUser ? window.currentUser.name : "登入";
    console.log("目前使用者名稱:", name);



    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", async function(){
            const emailEl = document.getElementById("loginEmail");
            const pwdEl = document.getElementById("loginPassword");
            const email = emailEl ? emailEl.value : '';
            const pwd = pwdEl ? pwdEl.value : '';
            if (!email || !pwd){
                alert("請輸入完整的 Email 和密碼");
                return;
            }

            const res = await fetch("http://localhost:5082/api/v1/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Email: email,
                    Password: pwd
                })
            });

            if (!res.ok) {
                // 登入失敗
                alert("登入失敗，請檢查帳號密碼");
                return;
            }

            const data = await res.json();

            // 核心：把 token 存到 localStorage
            localStorage.setItem("token", data.token);

            // 從 token 解析用戶資料
            try {
                const payload = JSON.parse(atob(data.token.split('.')[1]));
                const tokenEmail = payload.Email || payload.email;
                const tokenName = payload.Name || payload.name;
                const tokenId = payload.Id || payload.id;
                const tokenRole = payload.Role || payload.role;
                
                // 設定全域登入狀態
                window.currentUser = { 
                    id: tokenId,
                    name: tokenName, 
                    email: tokenEmail,
                    role: tokenRole
                };
                
                // 儲存用戶資料到 localStorage
                localStorage.setItem("userData", JSON.stringify(window.currentUser));
            } catch (error) {
                console.error("解析 token 失敗:", error);
                alert("登入失敗，token 格式錯誤");
                return;
            }

            // 關閉登入視窗（若存在）
            if (loginModal) loginModal.classList.remove("active");
            updateUserName();
            
            alert("登入成功");
        });
    }

    

    const goRegisterBtn = document.getElementById("goRegisterBtn");
    if (goRegisterBtn) {
        goRegisterBtn.addEventListener("click", function(){
            if (loginModal) loginModal.classList.remove("active");
            if (registerModal) registerModal.classList.add("active");
        });
    }

    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", function(){
            const emailEl = document.getElementById("regEmail");
            const pwdEl = document.getElementById("regPassword");
            const email = emailEl ? emailEl.value : '';
            const pwd = pwdEl ? pwdEl.value : '';
            if (!email || !pwd) return;

            if (registerModal) registerModal.classList.remove("active");
            if (registerDone) registerDone.classList.add("active");
        });
    }

    const backLoginBtn = document.getElementById("backLoginBtn");
    if (backLoginBtn) {
        backLoginBtn.addEventListener("click", function(){
            if (registerModal) registerModal.classList.remove("active");
            if (loginModal) loginModal.classList.add("active");
        });
    }

    const backToLogin = document.getElementById("backToLogin");
    if (backToLogin) {
        backToLogin.addEventListener("click", function(){
            if (registerDone) registerDone.classList.remove("active");
            if (loginModal) loginModal.classList.add("active");
        });
    }

    function closeAllAuth() {
        if (loginModal) loginModal.classList.remove("active");
        if (registerModal) registerModal.classList.remove("active");
        if (registerDone) registerDone.classList.remove("active");
    }

    if (loginModal) {
        loginModal.addEventListener("click", function(e){
            if (e.target === loginModal) closeAllAuth();
        });
    }
    if (registerModal) {
        registerModal.addEventListener("click", function(e){
            if (e.target === registerModal) closeAllAuth();
        });
    }
    if (registerDone) {
        registerDone.addEventListener("click", function(e){
            if (e.target === registerDone) closeAllAuth();
        });
    }

    const closeLogin = document.getElementById("closeLogin");
    if (closeLogin) closeLogin.onclick = closeAllAuth;
    const closeRegister = document.getElementById("closeRegister");
    if (closeRegister) closeRegister.onclick = closeAllAuth;
    const closeRegisterDone = document.getElementById("closeRegisterDone");
    if (closeRegisterDone) closeRegisterDone.onclick = closeAllAuth;
}

function updateUserName() {
    const userBtn = document.getElementById("userNameBtn");
    if (userBtn) {
        userBtn.textContent = window.currentUser ? window.currentUser.name : "登入";
    }
    console.debug('[auth] updateUserName:', { currentUser: window.currentUser, token: localStorage.getItem('token') });
}






// 恢復登入狀態
function restoreLoginState() {
    const token = localStorage.getItem("token");
    const savedUserData = localStorage.getItem("userData");

    // 優先使用儲存的用戶資料
    if (savedUserData) {
        try {
            window.currentUser = JSON.parse(savedUserData);
            updateUserName();
            return;
        } catch (error) {
            console.error("解析用戶資料失敗:", error);
            localStorage.removeItem("userData");
        }
    }

    // 如果沒有儲存的用戶資料，但有 token，從 token 解析
    if (typeof token === 'string' && token.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const email = payload.Email || payload.email;
            const name = payload.Name || payload.name;
            const id = payload.Id || payload.id;
            const role = payload.Role || payload.role;
            
            window.currentUser = {
                id: id,
                name: name,
                email: email,
                role: role
            };
            localStorage.setItem("userData", JSON.stringify(window.currentUser));
            updateUserName();
        } catch (err) {
            console.error("Token 解析失敗:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            window.currentUser = null;
            updateUserName();
        }
    } else if (token) {
        // token 存在但格式不正確，移除以避免後續錯誤
        console.warn('Invalid token format, removing token');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.currentUser = null;
        updateUserName();
    } else {
        updateUserName();
    }
}





// 登出功能
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    window.currentUser = null;
    updateUserName();
    
    // 關閉會員選單
    const menu = document.getElementById("userMenu");
    if (menu) {
        menu.classList.remove("active");
    }
    
    // 更新 overlay
    if (typeof updateOverlay === 'function') {
        updateOverlay();
    }
    // 轉跳頁面
    window.location.href = '../aqui_F/aqui_main_F_menu.html';
}

// 取得帶驗證的 header（只在 token 看起來像 JWT 時回傳）
function getAuthHeader() {
    const token = localStorage.getItem("token");
    if (typeof token === 'string' && token.split('.').length === 3) {
        return { "Authorization": `Bearer ${token}` };
    }
    return {};
}

// 當其他分頁修改 localStorage 時，透過 storage 事件同步登入狀態
window.addEventListener('storage', function(e) {
    if (e.key !== 'token') return;

    const newToken = e.newValue;

    if (typeof newToken === 'string' && newToken.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const email = payload.Email || payload.email;
            const name = payload.Name || payload.name;
            const id = payload.Id || payload.id;
            const role = payload.Role || payload.role;
            window.currentUser = { id, name, email, role };
        } catch (err) {
            console.error('storage event: token 解析失敗', err);
            window.currentUser = null;
            localStorage.removeItem('token');
        }
    } else {
        // token 被移除或格式不正確（登出）
        window.currentUser = null;
    }

    updateUserName();
});
