window.orders = [
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

window.STATUS_LABEL = {
    0: "品項不足",  // OutOfStock
    1: "待確認",    // Pending
    2: "已確認",    // Confirmed
    3: "已取餐",    // PickedUp
    4: "已完成",    // Completed
    5: "取消訂單",  // Cancelled
    6: "未取餐"     // NotPickedUp
};
window.STATUS_CLASS = {
    0: "bg-fail",      // OutOfStock
    1: "bg-pending",   // Pending
    2: "bg-confirm",   // Confirmed
    3: "bg-ready",     // PickedUp
    4: "bg-ready",     // Completed
    5: "bg-fail",      // Cancelled
    6: "bg-fail"       // NotPickedUp
};

// 安全渲染：若頁面無表格容器則不執行（避免 null 操作）
function renderOrders() {
    const wrap = document.getElementById("order-table");
    if (!wrap) return; // guard: 頁面不是訂單列表時直接跳出
    wrap.innerHTML = "";

    window.orders.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td class="order-id">${order.created}</td>
            <td class="order-id">${order.total} 元</td>
            <td class="order-id">
                <span class="badge ${window.STATUS_CLASS[order.status]}">
                    ${window.STATUS_LABEL[order.status]}
                </span>
            </td>
            <td class="order-id">
                <button type="button" onclick="event.stopPropagation(); showDetail('${order.id}')">查看</button>
            </td>
        `;
        wrap.appendChild(tr);
    });
}

function initOrderPage() {
    const mainEl = document.querySelector(".main");
    if (mainEl) {
        mainEl.addEventListener("click", function (e) {
            if (e.target.classList.contains("main")) {
                closeDetail();
            }
        });
    }

    const overlayEl = document.getElementById("overlay");
    if (overlayEl) overlayEl.addEventListener("click", closeDetail);
}

// 頁面載入後才嘗試渲染（避免在未完成 DOM 建立時操作）
document.addEventListener("DOMContentLoaded", () => {
    renderOrders();
});
