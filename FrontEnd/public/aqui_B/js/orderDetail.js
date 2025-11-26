function showDetail(orderId) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

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

function changeStatus(orderId, newStatus) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = newStatus;

    // 若有訂單表格則重新渲染（狀態徽章即時更新）
    if (typeof renderOrders === "function" && document.getElementById("order-table")) {
        renderOrders();
    }

    showDetail(orderId);
}

function closeDetail() {
    document.getElementById("detailPanel").classList.remove("active");
    updateOverlay();
}
