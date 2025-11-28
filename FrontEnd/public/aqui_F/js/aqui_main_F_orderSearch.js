/* ====================== 訂單查詢頁面特有的 showDetail（客戶視角） ====================== */
async function showDetail(orderId) {
    // 先從本地資料找訂單
    const localOrder = window.orders.find(o => o.id === orderId);
    if (!localOrder) {
        console.error('找不到訂單:', orderId);
        return;
    }

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    
    if (!panel || !container) {
        console.error('找不到詳情面板元素');
        return;
    }

    container.classList.add("active");
    if (typeof updateOverlay === 'function') {
        updateOverlay();
    }

    // 顯示載入中狀態
    panel.innerHTML = '<div style="text-align: center; padding: 20px;">載入中...</div>';

    try {
        // 從 API 載入完整的訂單詳細資料
        const order = await loadOrderDetail(orderId);
        
        if (!order) {
            panel.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">載入訂單失敗</div>';
            return;
        }

        /* 狀態按鈕：若狀態是待確認(1)，顯示取消訂單按鈕 */
        let actionArea = "";
        if (order.status === 1) {
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
                <span><strong>建立時間：</strong>${order.created}</span>
                <span><strong>更新時間：</strong>${order.updated}</span>
            </div>

            <div class="detail-item">
                <span><strong>取餐時間：</strong>${order.pickupTime || '未設定'}</span>
                <span><strong>總金額：</strong>${order.total} 元</span>
                <span><strong>總數量：</strong>${order.totalQuantity} 份</span>
            </div>

            <div class="detail-item">
                <span><strong>需要餐具：</strong>${order.needUtensils ? '是' : '否'}</span>
                <span><strong>訂單狀態：</strong>${window.STATUS_LABEL[order.status] || '未知狀態'}</span>
            </div>

            <div class="detail-item">
                <span><strong>品項內容：</strong></span>
                <div class="order-items">
                    ${order.items && order.items.length > 0 ? order.items.map(it => `
                        <div class="order-item">
                            菜單 ID: ${it.menuId} x ${it.quantity} (單價 ${it.price} 元，小計 ${it.subtotal} 元)
                        </div>
                    `).join("") : '<div class="order-item">無品項資料</div>'}
                </div>
            </div>

            ${actionArea}
        `;
    } catch (error) {
        console.error('載入訂單詳細資料時發生錯誤:', error);
        panel.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">載入訂單失敗，請稍後再試</div>';
    }
}

/* 取消訂單（客戶專用） */
async function cancelOrder(orderId) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) {
        console.error('找不到訂單:', orderId);
        return;
    }
    
    // 只有待確認的訂單才能取消 (status = 1)
    if (order.status !== 1) {
        alert('只有待確認的訂單才能取消');
        return;
    }

    if (confirm('確定要取消此訂單嗎？')) {
        try {
            // 呼叫 API 更新訂單狀態為已取消 (status = 5)
            const response = await fetch(`${window.API_BASE_URL}/Order`, {
                method: 'PATCH',
                headers: {
                    'authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: orderId,
                    status: 5
                })
            });

            if (!response.ok) {
                throw new Error('取消訂單失敗');
            }

            const result = await response.json();
            
            if (result.success) {
                // 更新本地訂單狀態
                order.status = 5;
                
                // 重新渲染訂單列表
                if (typeof renderOrders === 'function') {
                    renderOrders();
                }
                
                // 更新詳情面板
                showDetail(orderId);
                
                alert('訂單已成功取消');
            } else {
                throw new Error(result.message || '取消失敗');
            }
        } catch (error) {
            console.error('取消訂單失敗:', error);
            alert('取消訂單失敗，請稍後再試');
        }
    }
}

/* 關閉詳情面板 */
function closeDetail() {
    const container = document.getElementById("detailPanel");
    if (container) {
        container.classList.remove("active");
    }
    
    if (typeof updateOverlay === 'function') {
        updateOverlay();
    }
}

/* 頁面初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 載入訂單資料
    if (typeof loadOrders === 'function') {
        loadOrders();
    }
    
    // 設置 overlay 點擊事件
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", closeDetail);
    }
});
