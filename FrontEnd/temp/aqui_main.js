/* 假資料 */
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
    pending:  "待確認",
    confirmed:"已確認",
    ready:    "可取餐",
    cancel:   "取消"
};
const STATUS_CLASS = {
    pending: "bg-pending",
    confirmed:"bg-confirm",
    ready: "bg-ready",
    cancel: "bg-fail"
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

    overlay.classList.add("active");
    container.classList.add("active");

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
    renderOrders();
    showDetail(orderId);
}

/* 關閉面板（動畫 +遮罩） */
function closeDetail() {
    document.getElementById("detailPanel").classList.remove("active");
    document.getElementById("overlay").classList.remove("active");
}

/* 初始化 */
function initOrderPage() {

    renderOrders();

    // 點 main 空白處關閉
    document.querySelector(".main").addEventListener("click", function (e) {
        if (e.target.classList.contains("main")) {
            closeDetail();
        }
    });

    // 點遮罩關閉
    document.getElementById("overlay").addEventListener("click", closeDetail);
}

document.addEventListener("DOMContentLoaded", initOrderPage);
