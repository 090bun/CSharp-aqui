const userContainer = document.getElementById("userContainer");

// 假資料：實際你會改成 API 回傳
let userData = {
    name: "張小明",
    email: "test@example.com"
};

function renderUserView() {
    userContainer.innerHTML = `
        <div class="user-card">
            <p><strong>會員名稱：</strong> ${userData.name}</p>
            <p><strong>信箱：</strong> ${userData.email}</p>
            <button class="btn btn-edit" onclick="switchToEdit()">修改會員資料</button>
        </div>
    `;
}

function switchToEdit() {
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

    // 更新本地資料
    userData.name = newName;
    userData.email = newEmail;

    // TODO：在這裡呼叫 API 更新後端資料
    // fetch("/api/update_user", { method: "POST", body: ... })

    renderUserView();
}

renderUserView();
