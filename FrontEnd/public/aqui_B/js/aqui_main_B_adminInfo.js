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
    if (adminContainer) {
        adminContainer.innerHTML = `
            <div class="admin-card">
                <p>請先以管理員身份登入</p>
            </div>
        `;
    }
}

function renderAdminView() {
    if (!adminData || !adminContainer) return;
    
    adminContainer.innerHTML = `
        <div class="admin-card">
            <p><strong>管理員名稱：</strong> ${adminData.name}</p>
            <p><strong>信箱：</strong> ${adminData.email}</p>
            <button class="btn btn-edit" onclick="switchToEdit()">修改管理員資料</button>
        </div>
    `;
}

function switchToEdit() {
    if (!adminData || !adminContainer) return;
    
    adminContainer.innerHTML = `
        <div class="admin-card">
            <label>管理員名稱</label>
            <input id="editName" type="text" value="${adminData.name}">

            <label>信箱</label>
            <input id="editEmail" type="email" value="${adminData.email}">

            <label>新密碼（不修改請留空）</label>
            <input id="editPassword" type="password" placeholder="輸入新密碼">

            <label>確認新密碼</label>
            <input id="editPasswordConfirm" type="password" placeholder="再次輸入新密碼">

            <div style="margin-top: 16px;">
                <button class="btn btn-confirm" onclick="confirmEdit()">確認</button>
                <button class="btn btn-cancel" onclick="renderAdminView()">取消</button>
            </div>
        </div>
    `;
}

function confirmEdit() {
    const newName = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();
    const newPassword = document.getElementById("editPassword").value;
    const newPasswordConfirm = document.getElementById("editPasswordConfirm").value;

    if (!newName || !newEmail) {
        alert("請填寫完整資料");
        return;
    }

    // 驗證 email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        alert("請輸入有效的 Email 格式");
        return;
    }

    // 如果要修改密碼，檢查密碼是否一致且符合規則
    if (newPassword || newPasswordConfirm) {
        if (newPassword !== newPasswordConfirm) {
            alert("兩次輸入的密碼不一致");
            return;
        }
        if (newPassword.length < 6) {
            alert("密碼長度至少需要 6 個字元");
            return;
        }
    }

    // 更新本地資料
    adminData.name = newName;
    adminData.email = newEmail;

    // 更新 localStorage 中的管理員資料
    localStorage.setItem("adminData", JSON.stringify(adminData));

    // 同步更新全域的 currentUser
    if (window.currentUser) {
        window.currentUser.name = newName;
        window.currentUser.email = newEmail;
    }

    // TODO：在這裡呼叫 API 更新後端資料
    // const token = localStorage.getItem("token");
    // const updateData = { name: newName, email: newEmail };
    // if (newPassword) {
    //     updateData.password = newPassword;
    // }
    // fetch("http://localhost:5082/api/v1/admin/update", {
    //     method: "PUT",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`
    //     },
    //     body: JSON.stringify(updateData)
    // });

    renderAdminView();
    
    if (newPassword) {
        alert("資料已更新（包含密碼）（僅本地）");
    } else {
        alert("資料已更新（僅本地）");
    }
}

// 初始化畫面
if (adminData) {
    renderAdminView();
}
