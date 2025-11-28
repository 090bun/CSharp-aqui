const adminContainer = document.getElementById("adminContainer");

// 從 localStorage 獲取管理員資料
let adminData = null;

// 從 token 或 localStorage 獲取管理員資料
function getAdminData() {
    // 優先使用 localStorage 中的管理員資料
    const savedAdminData = localStorage.getItem("adminData");
    if (savedAdminData) {
        try {
            return JSON.parse(savedAdminData);
        } catch (error) {
            console.error("解析管理員資料失敗:", error);
        }
    }

    // 如果沒有管理員資料，嘗試從 token 解析
    const token = localStorage.getItem("token");
    if (token && typeof token === 'string' && token.split('.').length === 3) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // 確保是管理員角色
            if (payload.Role === 'Admin' || payload.role === 'Admin') {
                return {
                    id: payload.Id || payload.id,
                    name: payload.Name || payload.name,
                    email: payload.Email || payload.email,
                    role: payload.Role || payload.role
                };
            }
        } catch (error) {
            console.error("從 token 解析管理員資料失敗:", error);
        }
    }

    return null;
}

// 初始化管理員資料
adminData = getAdminData();

// 如果沒有管理員資料，顯示提示訊息
if (!adminData) {
    // 若沒有管理員登入，導向後台登入頁
    try {
        window.location.href = 'aqui_main_B_login.html';
    } catch (e) {
        if (adminContainer) {
            adminContainer.innerHTML = `
                <div class="admin-card">
                    <p>請先以管理員身份登入</p>
                </div>
            `;
        }
    }
    // 停止後續腳本執行
    throw new Error('未登入，已導向登入頁');
}

function renderAdminView() {
    if (!adminData || !adminContainer) return;
    
    adminContainer.innerHTML = `
        <div class="admin-card">
            <p><strong>管理員名稱：</strong> ${adminData.name}</p>
            <p><strong>信箱：</strong> ${adminData.email}</p>
            <button class="btn btn-edit" onclick="switchToEditName()">修改名稱</button>
            <button class="btn btn-edit" onclick="switchToEditPassword()">修改密碼</button>
        </div>
    `;
}

function switchToEditName() {
    if (!adminData || !adminContainer) return;
    
    adminContainer.innerHTML = `
        <div class="admin-card">
            <h3>修改名稱</h3>
            
            <label>管理員名稱</label>
            <input id="editName" type="text" value="${adminData.name}" placeholder="輸入新名稱">

            <div style="margin-top: 16px;">
                <button class="btn btn-confirm" onclick="confirmEditName()">確認</button>
                <button class="btn btn-cancel" onclick="renderAdminView()">取消</button>
            </div>
        </div>
    `;
}

function switchToEditPassword() {
    if (!adminData || !adminContainer) return;
    
    adminContainer.innerHTML = `
        <div class="admin-card">
            <h3>修改密碼</h3>
            
            <label>輸入舊密碼</label>
            <input id="oldPassword" type="password" placeholder="輸入舊密碼">

            <label>輸入新密碼</label>
            <input id="newPassword" type="password" placeholder="輸入新密碼">

            <label>確認新密碼</label>
            <input id="newPasswordConfirm" type="password" placeholder="再次輸入新密碼">

            <div style="margin-top: 16px;">
                <button class="btn btn-confirm" onclick="confirmEditPassword()">確認</button>
                <button class="btn btn-cancel" onclick="renderAdminView()">取消</button>
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
            adminData.name = newName;
            localStorage.setItem("adminData", JSON.stringify(adminData));

            // 同步更新全域的 currentUser
            if (window.currentUser) {
                window.currentUser.name = newName;
            }

            alert("名稱修改成功");
            renderAdminView();
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

    // 呼叫 API 修改密碼
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
    .then(response => response.json())
    .then(data => {
        if (data.success || data.data) {
            alert("密碼修改成功");
            renderAdminView();
        } else {
            alert("密碼修改失敗：" + (data.message || "未知錯誤"));
        }
    })
    .catch(error => {
        console.error("修改密碼錯誤:", error);
        alert("密碼修改失敗，請稍後再試");
    });
}

// 初始化畫面
if (adminData) {
    renderAdminView();
}
