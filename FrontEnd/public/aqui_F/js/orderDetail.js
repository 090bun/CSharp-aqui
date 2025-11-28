async function showDetail(orderId) {
    // 先從本地資料找訂單（用於顯示基本資訊）
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

        // 顯示完整的訂單詳細資料
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
                <span><strong>使用者 ID：</strong>${order.userId}</span>
            </div>

            <div class="detail-item">
                <span><strong>訂單狀態：</strong></span>
                <select onchange="changeStatus('${order.id}', this.value)">
                    <option value="1" ${order.status === 1 ? "selected" : ""}>待確認</option>
                    <option value="2" ${order.status === 2 ? "selected" : ""}>已確認</option>
                    <option value="3" ${order.status === 3 ? "selected" : ""}>準備中</option>
                    <option value="4" ${order.status === 4 ? "selected" : ""}>可取餐</option>
                    <option value="5" ${order.status === 5 ? "selected" : ""}>已完成</option>
                    <option value="6" ${order.status === 6 ? "selected" : ""}>已取消</option>
                </select>
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
        `;
    } catch (error) {
        console.error('載入訂單詳細資料時發生錯誤:', error);
        panel.innerHTML = '<div style="text-align: center; padding: 20px; color: red;">載入訂單失敗，請稍後再試</div>';
    }
}

async function changeStatus(orderId, newStatus) {
    const order = window.orders.find(o => o.id === orderId);
    if (!order) {
        console.error('找不到訂單:', orderId);
        return;
    }
    
    try {
        // 呼叫 API 更新訂單狀態
        const response = await fetch(`${window.API_BASE_URL}/Order`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: orderId,
                status: parseInt(newStatus)
            })
        });

        if (!response.ok) {
            throw new Error('更新訂單狀態失敗');
        }

        const result = await response.json();
        
        if (result.success) {
            // 更新本地訂單狀態
            order.status = parseInt(newStatus);
            
            // 重新渲染訂單列表
            if (typeof renderOrders === 'function') {
                renderOrders();
            }
            
            // 更新詳情面板
            showDetail(orderId);
            
            alert('訂單狀態更新成功');
        } else {
            throw new Error(result.message || '更新失敗');
        }
    } catch (error) {
        console.error('更新訂單狀態失敗:', error);
        alert('更新訂單狀態失敗，請稍後再試');
        
        // 重新載入詳情以恢復原狀態
        showDetail(orderId);
    }
}

function closeDetail() {
    const container = document.getElementById("detailPanel");
    if (container) {
        container.classList.remove("active");
    }
    
    if (typeof updateOverlay === 'function') {
        updateOverlay();
    }
}
