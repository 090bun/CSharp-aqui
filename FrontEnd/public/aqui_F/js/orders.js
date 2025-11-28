// 訂單資料（從 API 載入）
window.orders = [];

// API 基礎路徑
window.API_BASE_URL = 'http://localhost:5082/api/v1';

// 訂單狀態對應 (API status -> 顯示文字)
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

// 從 API 載入訂單
async function loadOrders() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/Order`, {
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('無法載入訂單資料');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            // 轉換 API 資料格式為前端使用的格式
            window.orders = result.data.map(order => ({
                id: order.orderGuid,
                created: formatDateTime(order.createdAt),
                total: order.totalPrice,
                status: order.status,
                totalQuantity: order.totalQuantity,
                needUtensils: order.needUtensils,
                pickupTime: formatDateTime(order.pickupTime),
                items: order.items
            }));
            
            renderOrders();
        }
    } catch (error) {
        console.error('載入訂單失敗:', error);
        alert('載入訂單資料失敗，請稍後再試');
    }
}

// 從 API 載入單筆訂單詳細資料
async function loadOrderDetail(orderGuid) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/Order/${orderGuid}`, {
            method: 'GET',
            headers: {
                'authorization': 'Bearer ' + localStorage.getItem('token'),
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('無法載入訂單詳細資料');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
            // 轉換並返回訂單詳細資料
            return {
                id: result.data.orderGuid,
                userId: result.data.userId,
                created: formatDateTime(result.data.createdAt),
                updated: formatDateTime(result.data.updatedAt),
                total: result.data.totalPrice,
                status: result.data.status,
                totalQuantity: result.data.totalQuantity,
                needUtensils: result.data.needUtensils,
                pickupTime: formatDateTime(result.data.pickupTime),
                items: result.data.items
            };
        }
        return null;
    } catch (error) {
        console.error('載入訂單詳細資料失敗:', error);
        throw error;
    }
}

// 格式化日期時間
function formatDateTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function renderOrders() {
    const wrap = document.getElementById("order-table");
    if (!wrap) {
        console.error('找不到訂單表格元素');
        return;
    }
    
    wrap.innerHTML = "";

    if (!window.orders || window.orders.length === 0) {
        const emptyRow = document.createElement("tr");
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center; padding: 20px;">目前沒有訂單</td>`;
        wrap.appendChild(emptyRow);
        return;
    }

    window.orders.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td class="order-id">${order.created}</td>
            <td class="order-id">${order.total} 元</td>
            <td class="order-id">
                <span class="badge ${window.STATUS_CLASS[order.status] || 'bg-pending'}">
                    ${window.STATUS_LABEL[order.status] || '未知狀態'}
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
    const mainElement = document.querySelector(".main");
    if (mainElement) {
        mainElement.addEventListener("click", function (e) {
            if (e.target.classList.contains("main")) {
                closeDetail();
            }
        });
    }

    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", closeDetail);
    }
    
    // 初始化時載入訂單資料
    loadOrders();
}
