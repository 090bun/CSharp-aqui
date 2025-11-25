/* menu假資料 */
const menus = [
    { id: 1, name: "套餐雞腿飯", category: "套餐", desc: "特製滷汁雞腿搭配香Q白飯", price: 120, img: "https://picsum.photos/300/200?random=1" },
    { id: 2, name: "主餐滷肉飯", category: "主餐", desc: "古早味滷肉香噴噴", price: 60, img: "https://picsum.photos/300/200?random=2" },
    { id: 3, name: "主餐滷蛋", category: "主餐", desc: "入味滷蛋，香氣十足", price: 15, img: "https://picsum.photos/300/200?random=3" },
    { id: 4, name: "飲品大冰紅", category: "飲品", desc: "清涼又解渴的大杯冰紅茶", price: 30, img: "https://picsum.photos/300/200?random=4" },
    { id: 5, name: "主餐控肉飯", category: "主餐", desc: "肥瘦均勻 控肉入口即化", price: 90, img: "https://picsum.photos/300/200?random=5" },
    { id: 6, name: "湯品味噌湯", category: "湯品", desc: "暖心熱湯 暖胃首選", price: 20, img: "https://picsum.photos/300/200?random=6" },
    { id: 7, name: "飲品大冰紅", category: "飲品", desc: "清涼又解渴的大杯冰紅茶", price: 30, img: "https://picsum.photos/300/200?random=4" },

];
// 購物車內容
let cart = [];
// 補上空的 renderOrders，避免 JS 錯誤
function renderOrders() {
    // 尚未實作訂單功能，暫留空
}

/* 渲染menu卡片 */
function renderMenuCards() {
    const list = document.querySelector(".menu-list");
    list.innerHTML = "";

    // 取得所有類別（不重複）
    const categories = [...new Set(menus.map(m => m.category))];

    categories.forEach(category => {
        // 類別標題
        const catDiv = document.createElement("div");
        catDiv.className = "menu-category-title";
        catDiv.innerHTML = `<h2>${category}</h2>`;
        list.appendChild(catDiv);

        // 類別卡片群組外層 grid
        const groupDiv = document.createElement("div");
        groupDiv.className = "menu-category-group";

        // 卡片內容
        const items = menus.filter(m => m.category === category);
        items.forEach(m => {
            const card = document.createElement("div");
            card.className = "menu-card";
            card.innerHTML = `
                <img src="${m.img}" class="menu-img" />
                <div class="menu-name">${m.name}</div>
                <div class="menu-desc">${m.desc}</div>
                <div class="menu-price">$${m.price}</div>
                <button onclick="addToCart(${m.id})">加入購物車</button>
            `;
            groupDiv.appendChild(card);
        });

        // 不需 center-grid，grid 會自動留空格

        list.appendChild(groupDiv);
    });
}

/* 加入購物車 */
function addToCart(id) {
    const item = menus.find(m => m.id === id);
    if (!item) return;

    const exists = cart.find(c => c.id === id);
    if (exists) {
        exists.qty += 1;
        alert(`"${item.name}" 已加入購物車中`);
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1
        });
        alert(`"${item.name}" 已加入購物車中`);
    }
}


// 顯示購物車內容
function showCart() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    if (cart.length === 0) {
        panel.innerHTML = `<div class="empty">目前購物車是空的</div>`;
        return;
    }

    panel.innerHTML = `
        <div class="detail-item"><strong>購物車內容</strong></div>

        <div class="order-items">
            ${cart.map(item => `
                <div class="order-item">
                    <div>${item.name}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                        <button onclick="decreaseQty(${item.id})">-</button>
                        <span>${item.qty}</span>
                        <button onclick="increaseQty(${item.id})">+</button>
                        <span style="margin-left:auto;">$${item.price * item.qty}</span>
                    </div>
                </div>
            `).join("")}
        </div>

        <div class="detail-item" style="margin-top:12px;">
            <strong>總金額：</strong>
            $${cart.reduce((sum, i) => sum + i.qty * i.price, 0)}
        </div>

        <button style="
            width:100%;
            margin-top:20px;
            background:#198754;
            padding:10px 0;
            border-radius:6px;
        ">
            前往結帳
        </button>
    `;
}

// 調整數量 
function increaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += 1;
    showCart();
}

function decreaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty -= 1;

    if (item.qty <= 0) {
        removeItem(id);
        return;
    }

    showCart();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);

    if (cart.length === 0) {
        showCart();
        return;
    }
    showCart();
}




/* 顯示詳細內容（含滑入動畫 +背景遮罩） */
function showDetail(orderId) {
    
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
    updateOverlay();
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

/* ====================== 會員名稱 → 上方滑出選單 ====================== */
function initUserMenu() {
    const btn = document.getElementById("userNameBtn");
    const menu = document.getElementById("userMenu");
    const overlay = document.getElementById("overlay");
    if (!btn || !menu || !overlay) return;

    btn.addEventListener("click", function (e) {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        const menuWidth = menu.offsetWidth || 200;
        const left = Math.max(
            8,
            Math.min(rect.right - menuWidth + window.scrollX, window.innerWidth - menuWidth - 8)
        );
        const top = rect.bottom + window.scrollY + 8;
        menu.style.left = left + "px";
        menu.style.top = top + "px";
        menu.classList.toggle("active");
        updateOverlay();
    });

    document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && e.target !== btn) {
            menu.classList.remove("active");
            updateOverlay();
        }
    });

    menu.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    overlay.addEventListener("click", function () {
        menu.classList.remove("active");
        updateOverlay();
    });
}

/* 在 DOM 完成後啟動 */
document.addEventListener("DOMContentLoaded", function () {
    renderMenuCards();
    initOrderPage();
    initUserMenu();
    document.getElementById("cartButton").addEventListener("click", function (e) {
    e.stopPropagation();
    showCart();
});
});


/* ====================== 共用：依開啟狀態更新遮罩 ====================== */
function updateOverlay() {
    const overlay = document.getElementById("overlay");
    const panelOpen = document.getElementById("detailPanel").classList.contains("active");
    const menuOpen = document.getElementById("userMenu").classList.contains("active");
    if (panelOpen || menuOpen) {
        overlay.classList.add("active");
    } else {
        overlay.classList.remove("active");
    }
}
