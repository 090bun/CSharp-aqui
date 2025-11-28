/* 假資料 */
// 使用全域 window.currentUser 以與其他模組同步狀態

const orders = [
    {
        id: "A0001",
        created: "2025-01-23 11:30",
        total: 180,
        status: "pending",
        items: [
            { name: "雞腿飯", qty: 1, price: 120 },
            { name: "滷蛋", qty: 2, price: 30 }
        ]
    },
    {
        id: "A0002",
        created: "2025-01-23 11:55",
        total: 90,
        status: "confirmed",
        items: [
            { name: "滷肉飯", qty: 1, price: 60 },
            { name: "大冰紅", qty: 1, price: 30 }
        ]
    }
];

const STATUS_LABEL = {
    0: "品項不足",  // OutOfStock
    1: "待確認",    // Pending
    2: "已確認",    // Confirmed
    3: "已取餐",    // PickedUp
    4: "已完成",    // Completed
    5: "取消訂單",  // Cancelled
    6: "未取餐"     // NotPickedUp
};
const STATUS_CLASS = {
    0: "bg-fail",      // OutOfStock
    1: "bg-pending",   // Pending
    2: "bg-confirm",   // Confirmed
    3: "bg-ready",     // PickedUp
    4: "bg-ready",     // Completed
    5: "bg-fail",      // Cancelled
    6: "bg-fail"       // NotPickedUp
};

/* 產生表格 */
function renderOrders() {
    const wrap = document.getElementById("order-table");
    wrap.innerHTML = "";

    orders.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td class="order-id">${order.created}</td>
            <td class="order-id">${order.total} 元</td>
            <td class="order-id">
                <span class="badge ${STATUS_CLASS[order.status]}">
                    ${STATUS_LABEL[order.status]}
                </span>
            </td>
            <td class="order-id">
                <button type="button" onclick="event.stopPropagation(); showDetail('${order.id}')">查看</button>
            </td>
        `;
        wrap.appendChild(tr);
    });
}

/* 顯示詳細內容（含滑入動畫 +背景遮罩） */
function showDetail(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    const overlay = document.getElementById("overlay");

    container.classList.add("active");
    updateOverlay();

    panel.innerHTML = `
        <div class="detail-item">
            <span><strong>訂單編號：</strong>${order.id}</span>
            <span><strong>時間：</strong>${order.created}</span>
            <span><strong>總金額：</strong>${order.total} 元</span>
        </div>

        <div class="detail-item">
            <span><strong>訂單狀態：</strong></span>
            <select onchange="changeStatus('${order.id}', this.value)">
                <option value="pending"   ${order.status === "pending" ? "selected" : ""}>待確認</option>
                <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>已確認</option>
                <option value="ready"     ${order.status === "ready" ? "selected" : ""}>可取餐</option>
                <option value="cancel"    ${order.status === "cancel" ? "selected" : ""}>取消</option>
            </select>
        </div>

        <div class="detail-item">
            <span><strong>品項內容：</strong></span>
            <div class="order-items">
                ${order.items.map(it => `
                    <div class="order-item">
                        ${it.name} x ${it.qty} (${it.price} 元)
                    </div>
                `).join("")}
            </div>
        </div>
    `;
}

/* 更改狀態 */
function changeStatus(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    // renderOrders();
    showDetail(orderId);
}

/* 關閉面板（動畫 +遮罩） */
function closeDetail() {
    document.getElementById("detailPanel").classList.remove("active");
    updateOverlay();
}

/* 初始化 */
function initOrderPage() {

    // renderOrders();

    // 點 main 空白處關閉
    document.querySelector(".main").addEventListener("click", function (e) {
        if (e.target.classList.contains("main")) {
            closeDetail();
        }
    });

    // 點遮罩關閉
    document.getElementById("overlay").addEventListener("click", closeDetail);
}

/* ====================== 會員名稱 → 上方滑出選單 ====================== */
function initUserMenu() {
    const btn = document.getElementById("userNameBtn");
    const menu = document.getElementById("userMenu");
    const overlay = document.getElementById("overlay");

    btn.addEventListener("click", function (e) {
        e.stopPropagation();

        // ===== 未登入 → 不開會員選單，只開登入框 =====
        if (!window.currentUser) {
            document.getElementById("loginModal").classList.add("active");
            return;
        }

        // ===== 已登入 → 正常開會員選單 =====
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

        updateOverlay();
    });

    // 點頁面其他地方關閉
    document.addEventListener("click", function () {
        menu.classList.remove("active");
        updateOverlay();
    });

    // 點選單本身不要關閉
    menu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    // 點遮罩關閉選單
    overlay.addEventListener("click", function () {
        menu.classList.remove("active");
        updateOverlay();
    });
}



/* 在 DOM 完成後啟動 */
document.addEventListener("DOMContentLoaded", function () {
    initOrderPage();
    initUserMenu();   // ★ 新增這行
    initAuthUI(true);
});


/* ====================== 共用：依開啟狀態更新遮罩 ====================== */
function updateOverlay() {
    const overlay = document.getElementById("overlay");
    const panelOpen = document.getElementById("detailPanel").classList.contains("active");
    const menuOpen = document.getElementById("userMenu").classList.contains("active");
    if (panelOpen || menuOpen) {
        overlay.classList.add("active");
    } else {
        overlay.classList.remove("active");
    }
}


function initAuthUI() {
    const loginModal = document.getElementById("loginModal");
    const registerModal = document.getElementById("registerModal");
    const registerDone = document.getElementById("registerDone");
    const userBtn = document.getElementById("userNameBtn");


    // 未登入 → 顯示「登入」
    updateUserName();

    // 打開登入視窗
    userBtn.addEventListener("click", function(e){
        e.stopPropagation();
        if (!window.currentUser) {
            loginModal.classList.add("active");
        }
    });

    // 登入
    document.getElementById("loginBtn").addEventListener("click", function(){
        const email = document.getElementById("loginEmail").value;
        const pwd = document.getElementById("loginPassword").value;

        if (!email || !pwd) return;

        // 使用全域狀態，並嘗試同步到 localStorage（若後端有 token 應由 auth 流程處理）
        window.currentUser = { name: email.split("@")[0], email };
        loginModal.classList.remove("active");
        updateUserName();
    });

    // 切到註冊
    document.getElementById("goRegisterBtn").addEventListener("click", function(){
        loginModal.classList.remove("active");
        registerModal.classList.add("active");
    });

    // 註冊
    document.getElementById("registerBtn").addEventListener("click", function(){
        const email = document.getElementById("regEmail").value;
        const pwd = document.getElementById("regPassword").value;
        if (!email || !pwd) return;

        registerModal.classList.remove("active");
        registerDone.classList.add("active");
    });

    // 註冊 → 回登入
    document.getElementById("backLoginBtn").addEventListener("click", function(){
        registerModal.classList.remove("active");
        loginModal.classList.add("active");
    });

    // 註冊完成 → 回登入
    document.getElementById("backToLogin").addEventListener("click", function(){
        registerDone.classList.remove("active");
        loginModal.classList.add("active");
    });

function closeAllAuth() {
    loginModal.classList.remove("active");
    registerModal.classList.remove("active");
    registerDone.classList.remove("active");
}
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// 點遮罩關閉
loginModal.addEventListener("click", function(e){
    if (e.target === loginModal) closeAllAuth();
});
registerModal.addEventListener("click", function(e){
    if (e.target === registerModal) closeAllAuth();
});
registerDone.addEventListener("click", function(e){
    if (e.target === registerDone) closeAllAuth();
});

// 點 X 關閉
document.getElementById("closeLogin").onclick = closeAllAuth;
document.getElementById("closeRegister").onclick = closeAllAuth;
document.getElementById("closeRegisterDone").onclick = closeAllAuth;


}

function updateUserName() {
    const userBtn = document.getElementById("userNameBtn");
    userBtn.textContent = window.currentUser ? window.currentUser.name : "登入";
}

