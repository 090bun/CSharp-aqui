const userContainer = document.getElementById("userContainer");

// 從 localStorage 獲取用戶資料
let userData = null;

// 從 token 或 localStorage 獲取用戶資料
function getUserData() {
    // 優先使用 localStorage 中的用戶資料
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
        try {
            return JSON.parse(savedUserData);
        } catch (error) {
            console.error("解析用戶資料失敗:", error);
        }
    }

    // 如果沒有用戶資料，嘗試從 token 解析
    const token = localStorage.getItem("token");
    if (token && typeof token === 'string' && token.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.Id || payload.id,
                name: payload.Name || payload.name,
                email: payload.Email || payload.email,
                role: payload.Role || payload.role
            };
        } catch (error) {
            console.error("從 token 解析用戶資料失敗:", error);
        }
    }

    return null;
}

// 初始化用戶資料
userData = getUserData();

// 如果沒有用戶資料，顯示提示訊息
if (!userData) {
    if (userContainer) {
        userContainer.innerHTML = `
            <div class="user-card">
                <p>請先登入</p>
            </div>
        `;
    }
}

function renderUserView() {
    if (!userData || !userContainer) return;
    
    userContainer.innerHTML = `
        <div class="user-card">
            <p><strong>會員名稱：</strong> ${userData.name}</p>
            <p><strong>信箱：</strong> ${userData.email}</p>
            <button class="btn btn-edit" onclick="switchToEditName()">修改名稱</button>
            <button class="btn btn-edit" onclick="switchToEditPassword()">修改密碼</button>
        </div>
    `;
}

function switchToEditName() {
    if (!userData || !userContainer) return;
    
    userContainer.innerHTML = `
        <div class="user-card">
            <h3>修改名稱</h3>
            
            <label>會員名稱</label>
            <input id="editName" type="text" value="${userData.name}" placeholder="輸入新名稱">

            <div style="margin-top: 16px;">
                <button class="btn btn-confirm" onclick="confirmEditName()">確認</button>
                <button class="btn btn-cancel" onclick="renderUserView()">取消</button>
            </div>
        </div>
    `;
}

function switchToEditPassword() {
    if (!userData || !userContainer) return;
    
    userContainer.innerHTML = `
        <div class="user-card">
            <h3>修改密碼</h3>
            
            <label>輸入舊密碼</label>
            <input id="oldPassword" type="password" placeholder="輸入舊密碼">

            <label>輸入新密碼</label>
            <input id="newPassword" type="password" placeholder="輸入新密碼">

            <label>確認新密碼</label>
            <input id="newPasswordConfirm" type="password" placeholder="再次輸入新密碼">

            <div style="margin-top: 16px;">
                <button class="btn btn-confirm" onclick="confirmEditPassword()">確認</button>
                <button class="btn btn-cancel" onclick="renderUserView()">取消</button>
            </div>
        </div>
    `;
}

function confirmEditName() {
    const newName = document.getElementById("editName").value.trim();

    if (!newName) {
        alert("請輸入名稱");
        return;
    }

    // 呼叫 API 更新名稱
    fetch(window.api.getUrl('/user'), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            Name: newName
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success || data.data) {
            // 更新本地資料
            userData.name = newName;
            localStorage.setItem("userData", JSON.stringify(userData));

            // 同步更新全域的 currentUser
            if (window.currentUser) {
                window.currentUser.name = newName;
            }

            alert("名稱修改成功");
            renderUserView();
        } else {
            alert("名稱修改失敗：" + (data.message || "未知錯誤"));
        }
    })
    .catch(error => {
        console.error("修改名稱錯誤:", error);
        alert("名稱修改失敗，請稍後再試");
    });
}

function confirmEditPassword() {
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const newPasswordConfirm = document.getElementById("newPasswordConfirm").value;

    if (!oldPassword || !newPassword || !newPasswordConfirm) {
        alert("請填寫所有密碼欄位");
        return;
    }
    if (newPassword !== newPasswordConfirm) {
        alert("新密碼與確認密碼不一致");
        return;
    }
    if (newPassword.length < 6) {
        alert("新密碼長度至少需要 6 個字元");
        return;
    }
    fetch(window.api.getUrl('/user/password'), {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            OldPassword: oldPassword,
            NewPassword: newPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success || data.data) {

            alert("密碼修改成功，請重新登入");

            // 轉跳頁面
            window.location.href = '../aqui_F/aqui_main_F_menu.html';
            // 清除登入狀態
            logout();
        } else {
            alert("密碼修改失敗：" + (data.message || "未知錯誤"));
        }
    })
    .catch(error => {
        console.error("修改密碼錯誤:", error);
    });
}


// 初始化畫面
if (userData) {
    renderUserView();
}
