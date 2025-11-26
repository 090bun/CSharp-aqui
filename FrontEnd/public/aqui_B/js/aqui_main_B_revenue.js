/* ====================== 營業金額頁面 ====================== */

let ordersForRevenue = [];

function loadOrdersForRevenue() {
    try {
        const cached = localStorage.getItem('orders_cache');
        if (cached) {
            ordersForRevenue = JSON.parse(cached);
        } else {
            // 若尚未有訂單快取，使用測試資料並寫入，與訂單頁一致格式
            ordersForRevenue = [
                {
                    id: 'ORD001',
                    createdAt: '2025-01-25 10:30',
                    pickupTime: '2025-01-25 11:00',
                    total: 250,
                    status: 'Pending',
                    items: [
                        { name: '雞腿飯', qty: 1, price: 120 },
                        { name: '滷蛋', qty: 2, price: 30 },
                        { name: '大冰紅', qty: 1, price: 40 }
                    ]
                },
                {
                    id: 'ORD002',
                    createdAt: '2025-01-25 10:45',
                    pickupTime: '2025-01-25 11:15',
                    total: 180,
                    status: 'Confirmed',
                    items: [
                        { name: '滷肉飯', qty: 2, price: 60 },
                        { name: '燙青菜', qty: 1, price: 30 }
                    ]
                },
                {
                    id: 'ORD003',
                    createdAt: '2025-01-25 11:00',
                    pickupTime: '2025-01-25 11:30',
                    total: 320,
                    status: 'PickedUp',
                    items: [
                        { name: '排骨飯', qty: 2, price: 100 },
                        { name: '滷蛋', qty: 1, price: 15 },
                        { name: '小冰紅', qty: 2, price: 30 }
                    ]
                }
            ];
            localStorage.setItem('orders_cache', JSON.stringify(ordersForRevenue));
        }
    } catch (e) {
        console.warn('讀取 orders_cache 失敗', e);
        ordersForRevenue = [];
    }
}

function formatCurrency(n) { return `$
${Number(n || 0).toLocaleString()}`; }

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

function applyAndRender() {
    const { start, end } = getRange();
    const filtered = filterOrdersByRange(ordersForRevenue, start, end);
    renderSummary(filtered);
    renderTable(filtered);
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
    loadOrdersForRevenue();
    const def = getDefaultRange();
    setRange(def.start, def.end);
    applyAndRender();

    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) filterBtn.addEventListener('click', applyAndRender);
    const t = document.getElementById('quickTodayBtn');
    if (t) t.addEventListener('click', quickToday);
    const w = document.getElementById('quickWeekBtn');
    if (w) w.addEventListener('click', quickWeek);
    const m = document.getElementById('quickMonthBtn');
    if (m) m.addEventListener('click', quickMonth);
}

/* 頁面載入完成後初始化 */
document.addEventListener('DOMContentLoaded', function () {
    if (typeof initAuthUI === 'function') initAuthUI();
    if (typeof initUserMenu === 'function') initUserMenu();
    initRevenuePage();
});
