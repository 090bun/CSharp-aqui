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
            <button class="btn btn-edit" onclick="switchToEdit()">修改會員資料</button>
        </div>
    `;
}

function switchToEdit() {
    if (!userData || !userContainer) return;
    
    userContainer.innerHTML = `
        <div class="user-card">
            <label>會員名稱</label>
            <input id="editName" type="text" value="${userData.name}">

            <label>信箱</label>
            <input id="editEmail" type="email" value="${userData.email}">

            <button class="btn btn-confirm" onclick="confirmEdit()">確認</button>
        </div>
    `;
}

function confirmEdit() {
    const newName = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();

    if (!newName || !newEmail) {
        alert("請填寫完整資料");
        return;
    }

    // 更新本地資料
    userData.name = newName;
    userData.email = newEmail;

    // 更新 localStorage 中的用戶資料
    localStorage.setItem("userData", JSON.stringify(userData));

    // 同步更新全域的 currentUser
    if (window.currentUser) {
        window.currentUser.name = newName;
        window.currentUser.email = newEmail;
    }

    // TODO：在這裡呼叫 API 更新後端資料
    // const token = localStorage.getItem("token");
    // fetch("http://localhost:5082/api/v1/user/update", {
    //     method: "PUT",
    //     headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${token}`
    //     },
    //     body: JSON.stringify({ name: newName, email: newEmail })
    // });

    renderUserView();
    alert("資料已更新（僅本地）");
}

// 初始化畫面
if (userData) {
    renderUserView();
}
