/* ====================== 營業金額頁面 ====================== */

let ordersForRevenue = [];

function getAuthToken() {
    return (
        localStorage.getItem('token')
    );
}

function formatCurrency(n) { return `$${Number(n || 0).toLocaleString()}`; }

function formatDateTime(value) {
    if (!value) return '';
    try {
        const d = new Date(value);
        if (isNaN(d.getTime())) return value;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const HH = String(d.getHours()).padStart(2, '0');
        const MM = String(d.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${HH}:${MM}`;
    } catch { return value; }
}

function mapSoldDto(dto) {
    const guid = dto.orderGuid || dto.OrderGuid;
    const totalPrice = dto.totalPrice || dto.TotalPrice || 0;
    const updatedAt = dto.updatedAt || dto.UpdatedAt || null;
    return {
        id: guid,
        // 這個頁面僅需日期聚合，使用 UpdatedAt 作為基準
        createdAt: formatDateTime(updatedAt),
        total: totalPrice
    };
}

async function fetchSoldOrders(params = {}) {
    const token = getAuthToken();
    if (!token) throw new Error('尚未登入，缺少 Token');

    const q = new URLSearchParams();
    if (params.status) q.append('status', params.status);
    if (params.start) q.append('start', params.start);
    if (params.end) q.append('end', params.end);
    if (params.by) q.append('by', params.by);
    const baseUrl = window.api.getUrl('/Order/sold');
    const url = q.toString() ? `${baseUrl}?${q}` : baseUrl;

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status === 401) throw new Error('未授權，請重新登入');
    if (res.status === 403) throw new Error('權限不足：需要 Admin 角色');
    if (!res.ok) throw new Error(`取得營業額資料失敗: ${res.status}`);

    const data = await res.json();
    if (!data || !Array.isArray(data.data)) return [];
    return data.data.map(mapSoldDto);
}

function getDateOnly(str) {
    // str 可能是 'YYYY-MM-DD HH:mm'，取前 10 碼
    return (str || '').toString().slice(0, 10);
}

function getDefaultRange() {
    const now = new Date();
    const end = now.toISOString().slice(0,10);
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    return { start: firstDay, end };
}

function setRange(start, end) {
    const s = document.getElementById('startDate');
    const e = document.getElementById('endDate');
    if (s) s.value = start;
    if (e) e.value = end;
}

function getRange() {
    const s = document.getElementById('startDate')?.value;
    const e = document.getElementById('endDate')?.value;
    return { start: s, end: e };
}

function filterOrdersByRange(orders, start, end) {
    if (!start && !end) return orders;
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    return orders.filter(o => {
        const dStr = getDateOnly(o.createdAt || o.pickupTime);
        if (!dStr) return false;
        const d = new Date(dStr);
        if (s && d < s) return false;
        if (e) {
            const eInclusive = new Date(end);
            eInclusive.setDate(eInclusive.getDate() + 1);
            if (d >= eInclusive) return false;
        }
        return true;
    });
}

function groupByDate(orders) {
    const map = new Map();
    orders.forEach(o => {
        const d = getDateOnly(o.createdAt || o.pickupTime);
        if (!d) return;
        const cur = map.get(d) || { date: d, count: 0, revenue: 0 };
        cur.count += 1;
        cur.revenue += Number(o.total || 0);
        map.set(d, cur);
    });
    return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date));
}

function renderSummary(orders) {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const orderCount = orders.length;
    const avg = orderCount ? Math.round(totalRevenue / orderCount) : 0;
    const sumRevenueEl = document.getElementById('sumRevenue');
    const sumOrdersEl = document.getElementById('sumOrders');
    const avgOrderEl = document.getElementById('avgOrder');
    if (sumRevenueEl) sumRevenueEl.textContent = formatCurrency(totalRevenue);
    if (sumOrdersEl) sumOrdersEl.textContent = orderCount.toString();
    if (avgOrderEl) avgOrderEl.textContent = formatCurrency(avg);
}

function renderTable(orders) {
    const tbody = document.getElementById('revenue-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:20px;color:#999;">目前無資料</td></tr>';
        return;
    }
    const rows = groupByDate(orders);
    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>${r.date}</td>
            <td>${r.count}</td>
            <td>${formatCurrency(r.revenue)}</td>
        </tr>
    `).join('');
}

async function applyAndRender() {
    const { start, end } = getRange();
    try {
        // 以 UpdatedAt 作為統計依據，直接請後端依區間回傳
        const fresh = await fetchSoldOrders({ start, end, by: 'UpdatedAt' });
        ordersForRevenue = fresh;
        localStorage.setItem('orders_cache', JSON.stringify(ordersForRevenue));
        renderSummary(ordersForRevenue);
        renderTable(ordersForRevenue);
    } catch (err) {
        console.error('載入營業額資料失敗:', err);
        // 退回使用快取 + 前端篩選
        try {
            const cached = localStorage.getItem('orders_cache');
            ordersForRevenue = cached ? JSON.parse(cached) : [];
        } catch { ordersForRevenue = []; }
        const filtered = filterOrdersByRange(ordersForRevenue, start, end);
        const tbody = document.getElementById('revenue-table');
        if (tbody && (err.message.includes('Admin') || err.message.includes('未授權'))) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;padding:20px;color:#999;">${err.message}</td></tr>`;
        } else {
            renderSummary(filtered);
            renderTable(filtered);
        }
    }
}

function quickToday() {
    const now = new Date();
    const d = now.toISOString().slice(0,10);
    setRange(d, d);
    applyAndRender();
}

function quickWeek() {
    const now = new Date();
    const day = now.getDay() || 7; // 1-7 (Mon-Sun)
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day - 1));
    const start = monday.toISOString().slice(0,10);
    const end = now.toISOString().slice(0,10);
    setRange(start, end);
    applyAndRender();
}

function quickMonth() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const end = now.toISOString().slice(0,10);
    setRange(start, end);
    applyAndRender();
}

function initRevenuePage() {
    const def = getDefaultRange();
    setRange(def.start, def.end);
    // 初次載入以 UpdatedAt 區間查詢
    applyAndRender();

    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) filterBtn.addEventListener('click', () => { applyAndRender(); });
    const t = document.getElementById('quickTodayBtn');
    if (t) t.addEventListener('click', quickToday);
    const w = document.getElementById('quickWeekBtn');
    if (w) w.addEventListener('click', quickWeek);
    const m = document.getElementById('quickMonthBtn');
    if (m) m.addEventListener('click', quickMonth);
}

/* 頁面載入完成後初始化 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof initAuthUI === 'function') initAuthUI(true);
    if (typeof initUserMenu === 'function') initUserMenu();
    initRevenuePage();
});
