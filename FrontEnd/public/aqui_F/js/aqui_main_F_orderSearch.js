/* ====================== 訂單查詢頁面特有的 showDetail（客戶視角） ====================== */
function showDetail(orderId) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    /* 狀態按鈕：若狀態是 pending，顯示取消訂單按鈕 */
    let actionArea = "";
    if (order.status === "pending") {
        actionArea = `
            <div class="detail-actions">
                <button class="cancel-btn" onclick="cancelOrder('${order.id}')">
                    取消訂單
                </button>
            </div>
        `;
    }

    panel.innerHTML = `
        <div class="detail-item">
            <span><strong>訂單編號：</strong>${order.id}</span>
            <span><strong>時間：</strong>${order.created}</span>
            <span><strong>總金額：</strong>${order.total} 元</span>
        </div>

        <div class="detail-item">
            <span><strong>訂單狀態：</strong>${window.STATUS_LABEL[order.status]}</span>
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

        ${actionArea}
    `;
}

/* 取消訂單（客戶專用） */
function cancelOrder(orderId) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) return;

    if (confirm('確定要取消此訂單嗎？')) {
        order.status = 'cancel';
        renderOrders();
        showDetail(orderId);
    }
}

/* 頁面初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 渲染訂單表格
    renderOrders();
});
