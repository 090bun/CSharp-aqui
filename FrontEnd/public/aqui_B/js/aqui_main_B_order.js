/* ====================== 訂單頁面專屬功能 ====================== */

// 儲存訂單資料
let ordersData = [];

// 取得 JWT Token（可依實際登入流程調整 key 名稱）
function getAuthToken() {
    // 嘗試多種可能的 key 名稱並回傳字串
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("jwtToken") ||
        localStorage.getItem("accessToken") ||
        ""
    );
}

// 狀態索引對應名稱（後端枚舉順序）
const ORDER_STATUS_NAMES = [
    "OutOfStock",     //0
    "Pending",        //1
    "Confirmed",      //2
    "PickedUp",       //3
    "Completed",      //4
    "Cancelled",      //5
    "NotPickedUp"     //6
];

function statusIndexToName(v) {
    if (typeof v !== 'number') return (ORDER_STATUS_NAMES.indexOf(v) !== -1) ? v : 'Unknown';
    return ORDER_STATUS_NAMES[v] || 'Unknown';
}

// 將後端回傳的 OrderDto 轉成前端顯示格式（處理大小寫差異）
function mapOrderDto(dto) {
    const guid = dto.orderGuid || dto.OrderGuid;
    const createdAt = dto.createdAt || dto.CreatedAt;
    const pickupTime = dto.pickupTime || dto.PickupTime;
    const totalPrice = dto.totalPrice || dto.TotalPrice || 0;
    const statusRaw = (dto.status !== undefined) ? dto.status : dto.Status; // 可能是數字或字串
    const itemsRaw = dto.items || dto.Items || [];

    return {
        id: guid,
        createdAt: formatDateTime(createdAt),
        pickupTime: formatDateTime(pickupTime),
        total: totalPrice,
        status: statusIndexToName(statusRaw),
        items: itemsRaw.map(i => ({
            menuId: i.menuId || i.MenuId,
            qty: i.quantity || i.Quantity || 0,
            price: i.price || i.Price || 0,
            subtotal: i.subtotal || i.Subtotal || 0,
            name: `品項#${i.menuId || i.MenuId}`
        }))
    };
}

function formatDateTime(value) {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
    } catch { return value; }
}

// 進入頁面直接呼叫 Admin 全部訂單 API
async function fetchAllOrders(params = {}) {
    const token = getAuthToken();
    if (!token) throw new Error("尚未登入，缺少 Token");

    const q = new URLSearchParams();
    if (params.status) q.append("status", params.status);
    if (params.start) q.append("start", params.start);
    if (params.end) q.append("end", params.end);
    if (params.by) q.append("by", params.by);
    const baseUrl = window.api.getUrl('/Order/all?by=CreatedAt');
    const url = q.toString() ? `${baseUrl}?${q}` : baseUrl;

    const res = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status === 401 || res.status === 403) {
        throw new Error("權限不足：需要 Admin 角色才能查看全部訂單");
    }
    if (!res.ok) throw new Error(`取得訂單失敗: ${res.status}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map(mapOrderDto);
}

/* 渲染訂單列表 */
async function renderOrders() {
    const tbody = document.getElementById("order-table");
    if (!tbody) return;

    tbody.innerHTML = "";

    try {
        // 每次進入頁面直接打 GET /api/v1/Order/all
        const orders = await fetchAllOrders();
        ordersData = orders;
        // 可選：快取最新資料
        localStorage.setItem("orders_cache", JSON.stringify(orders));

        orders.forEach(order => {
            const tr = document.createElement("tr");
            tr.style.cursor = "pointer";
            tr.innerHTML = `
                <td>${order.createdAt}</td>
                <td>${order.id}</td>
                <td>${order.pickupTime}</td>
                <td>$${order.total}</td>
                <td>
                    <span class="badge ${getStatusClass(order.status)}">${getStatusLabel(order.status)}</span>
                </td>
                <td>
                    <button onclick="event.stopPropagation(); showOrderDetail('${order.id}')" class="view-btn">查看</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("載入訂單失敗:", error);
        let msg = error.message || "未知錯誤";
        if (msg.includes("Token")) msg = "尚未登入或 Token 遺失";
        if (msg.includes("Admin")) msg = "目前帳號沒有 Admin 權限，無法查看全部訂單";
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#999;">${msg}</td></tr>`;
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
    if(!order) return;
    const prevStatus = order.status; // 目前顯示的（字串）
    if (prevStatus === newStatus) return; // 未變更

    // 確認對話（顯示中文）
    const prevLabel = getStatusLabel(prevStatus);
    const newLabel = getStatusLabel(newStatus);
    const ok = confirm(`確定要將訂單狀態由「${prevLabel}」改為「${newLabel}」嗎？`);
    if(!ok){
        // 使用者取消，還原 select 顯示
        const selectEl = document.getElementById(`status-${orderId}`);
        if (selectEl) {
            selectEl.value = prevStatus;
        }
        return;
    }

    // 標記暫時 loading
    const selectEl = document.getElementById(`status-${orderId}`);
    if (selectEl) {
        selectEl.disabled = true;
    }

    patchOrderStatus(orderId, newStatus).finally(()=>{
        if (selectEl) selectEl.disabled = false;
    });
}

function statusNameToIndex(name){
    return ORDER_STATUS_NAMES.indexOf(name);
}

async function patchOrderStatus(orderGuid, statusName){
    const token = getAuthToken();
    if(!token){
        alert("尚未登入，無法修改訂單狀態");
        return;
    }
    const statusIndex = statusNameToIndex(statusName);
    if(statusIndex === -1){
        alert("無效的狀態: " + statusName);
        return;
    }
    // 後端使用 OrderDto，屬性名稱採預設大小寫不敏感，但 'id' 不會對應 OrderGuid，建議傳 orderGuid
    const body = {
        orderGuid: orderGuid,
        status: statusIndex
    };
    try {
        const res = await fetch(window.api.getUrl('/Order'), {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if(res.status === 401){
            alert("未授權，請重新登入");
            return;
        }
        if(res.status === 403){
            alert("權限不足：一般使用者只能取消訂單");
            return;
        }
        if(!res.ok){
            const txt = await res.text();
            alert("更新失敗:" + res.status + "\n" + txt);
            // 失敗後還原 select 顯示為原狀
            const order = ordersData.find(o=>o.id === orderGuid);
            if(order){
                const selectEl = document.getElementById(`status-${orderGuid}`);
                if(selectEl) selectEl.value = order.status;
            }
            return;
        }
        const api = await res.json();
        if(api && api.data){
            // 後端回傳最新資料，重新映射
            const updated = mapOrderDto(api.data);
            const idx = ordersData.findIndex(o=>o.id === orderGuid);
            if(idx !== -1){
                ordersData[idx] = updated;
            }
            localStorage.setItem("orders_cache", JSON.stringify(ordersData));
            renderOrders();
            showOrderDetail(orderGuid);
        } else {
            alert("回傳格式不正確");
        }
    } catch(err){
        console.error(err);
        alert("網路錯誤，稍後再試\n" + err.message);
        // 網路錯誤也還原 select
        const order = ordersData.find(o=>o.id === orderGuid);
        if(order){
            const selectEl = document.getElementById(`status-${orderGuid}`);
            if(selectEl) selectEl.value = order.status;
        }
    }
}

/* 初始化訂單頁面 */
function initOrderPage() {
    renderOrders();
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI（內部會呼叫 restoreLoginState）
    if (typeof initAuthUI === 'function') {
        initAuthUI(true);
    }
    
    // 2. 初始化會員選單
    if (typeof initUserMenu === 'function') {
        initUserMenu();
    }
    
    // 3. 初始化訂單頁面
    initOrderPage();
});


