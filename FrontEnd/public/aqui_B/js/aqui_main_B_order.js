/* ====================== 訂單頁面專屬功能 ====================== */

// 儲存訂單資料
let ordersData = [];

/* 渲染訂單列表 */
async function renderOrders() {
    const tbody = document.getElementById("order-table");
    if (!tbody) return;
    
    tbody.innerHTML = "";

    try {
        let orders;
        
        // 先嘗試從 localStorage 讀取訂單資料
        const cachedOrders = localStorage.getItem("orders_cache");
        
        if (cachedOrders) {
            orders = JSON.parse(cachedOrders);
            ordersData = orders;
        } else {
            // 從 API 獲取（未來實作）
            // 目前使用測試資料
            orders = [
                {
                    id: "ORD001",
                    createdAt: "2025-01-25 10:30",
                    pickupTime: "2025-01-25 11:00",
                    total: 250,
                    status: "Pending",
                    items: [
                        { name: "雞腿飯", qty: 1, price: 120 },
                        { name: "滷蛋", qty: 2, price: 30 },
                        { name: "大冰紅", qty: 1, price: 40 }
                    ]
                },
                {
                    id: "ORD002",
                    createdAt: "2025-01-25 10:45",
                    pickupTime: "2025-01-25 11:15",
                    total: 180,
                    status: "Confirmed",
                    items: [
                        { name: "滷肉飯", qty: 2, price: 60 },
                        { name: "燙青菜", qty: 1, price: 30 }
                    ]
                },
                {
                    id: "ORD003",
                    createdAt: "2025-01-25 11:00",
                    pickupTime: "2025-01-25 11:30",
                    total: 320,
                    status: "PickedUp",
                    items: [
                        { name: "排骨飯", qty: 2, price: 100 },
                        { name: "滷蛋", qty: 1, price: 15 },
                        { name: "小冰紅", qty: 2, price: 30 }
                    ]
                }
            ];
            ordersData = orders;
            localStorage.setItem("orders_cache", JSON.stringify(orders));
        }

        // 渲染訂單列表
        orders.forEach(order => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.innerHTML = `
                <td>${order.createdAt}</td>
                <td>${order.id}</td>
                <td>${order.pickupTime}</td>
                <td>$${order.total}</td>
                <td>
                    <span class="badge ${getStatusClass(order.status)}">
                        ${getStatusLabel(order.status)}
                    </span>
                </td>
                <td>
                    <button onclick="event.stopPropagation(); showOrderDetail('${order.id}')" class="view-btn">查看</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("載入訂單失敗:", error);
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;">載入訂單時發生錯誤，請稍後再試</td></tr>`;
    }
}

/* 取得訂單狀態樣式 */
function getStatusClass(status) {
    const statusMap = {
        OutOfStock: "bg-fail",
        Pending: "bg-pending",
        Confirmed: "bg-confirm",
        PickedUp: "bg-ready",
        Completed: "bg-ready",
        Cancelled: "bg-fail",
        NotPickedUp: "bg-fail"
    };
    return statusMap[status] || "bg-pending";
}

/* 取得訂單狀態文字 */
function getStatusLabel(status) {
    const labelMap = {
        OutOfStock: "品項不足",
        Pending: "待確認",
        Confirmed: "已確認",
        PickedUp: "已取餐",
        Completed: "已完成",
        Cancelled: "取消訂單",
        NotPickedUp: "未取餐"
    };
    return labelMap[status] || "未知";
}


/* 顯示訂單詳細資訊 */
function showOrderDetail(orderId) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    panel.innerHTML = `
        <div class="detail-item">
            <span><strong>訂單編號：</strong></span>
            <span>${order.id}</span>
        </div>

        <div class="detail-item">
            <span><strong>建立時間：</strong></span>
            <span>${order.createdAt}</span>
        </div>

        <div class="detail-item">
            <span><strong>取餐時間：</strong></span>
            <span>${order.pickupTime}</span>
        </div>

        <div class="detail-item">
            <span><strong>總金額：</strong></span>
            <span style="color: #198754; font-size: 18px; font-weight: bold;">$${order.total}</span>
        </div>

        <div class="detail-item">
            <span><strong>訂單狀態：</strong></span>
            <select id="status-${order.id}" onchange="updateOrderStatus('${order.id}', this.value)" style="
                width: 100%;
                padding: 8px;
                margin-top: 6px;
                background: #111;
                color: #fff;
                border: 1px solid #333;
                border-radius: 6px;
            ">
                <option value="OutOfStock" ${order.status === 'OutOfStock' ? 'selected' : ''}>品項不足</option>
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>待確認</option>
                <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>已確認</option>
                <option value="PickedUp" ${order.status === 'PickedUp' ? 'selected' : ''}>已取餐</option>
                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>已完成</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>取消訂單</option>
                <option value="NotPickedUp" ${order.status === 'NotPickedUp' ? 'selected' : ''}>未取餐</option>
            </select>
        </div>

        <div class="detail-item">
            <span><strong>訂單內容：</strong></span>
            <div class="order-items" style="margin-top: 10px;">
                ${order.items.map(item => `
                    <div class="order-item" style="
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #333;
                    ">
                        <span>${item.name} x ${item.qty}</span>
                        <span>$${item.price * item.qty}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

/* 更新訂單狀態 */
function updateOrderStatus(orderId, newStatus) {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    localStorage.setItem("orders_cache", JSON.stringify(ordersData));
    
    // 重新渲染訂單列表
    renderOrders();
    
    // 重新顯示詳細資訊
    showOrderDetail(orderId);
}

/* 初始化訂單頁面 */
function initOrderPage() {
    renderOrders();
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI（內部會呼叫 restoreLoginState）
    if (typeof initAuthUI === 'function') {
        initAuthUI();
    }
    
    // 2. 初始化會員選單
    if (typeof initUserMenu === 'function') {
        initUserMenu();
    }
    
    // 3. 初始化訂單頁面
    initOrderPage();
});


