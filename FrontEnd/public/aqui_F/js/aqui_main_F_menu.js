/* ====================== 菜單頁面專屬功能 ====================== */

/* 菜單假資料 */
// const menus = [
//     { id: 1, name: "套餐雞腿飯", category: "套餐", desc: "特製滷汁雞腿搭配香Q白飯", price: 120, img: "https://picsum.photos/300/200?random=1" },
//     { id: 2, name: "主餐滷肉飯", category: "主餐", desc: "古早味滷肉香噴噴", price: 60, img: "https://picsum.photos/300/200?random=2" },
//     { id: 3, name: "主餐滷蛋", category: "主餐", desc: "入味滷蛋，香氣十足", price: 15, img: "https://picsum.photos/300/200?random=3" },
//     { id: 4, name: "飲品大冰紅", category: "飲品", desc: "清涼又解渴的大杯冰紅茶", price: 30, img: "https://picsum.photos/300/200?random=4" },
//     { id: 5, name: "主餐控肉飯", category: "主餐", desc: "肥瘦均勻 控肉入口即化", price: 90, img: "https://picsum.photos/300/200?random=5" },
//     { id: 6, name: "湯品味噌湯", category: "湯品", desc: "暖心熱湯 暖胃首選", price: 20, img: "https://picsum.photos/300/200?random=6" },
//     { id: 7, name: "飲品大冰紅", category: "飲品", desc: "清涼又解渴的大杯冰紅茶", price: 30, img: "https://picsum.photos/300/200?random=4" },
// ];

// 購物車內容
let cart = [];

// 儲存菜單資料
let menusData = [];

/* 渲染菜單卡片 */
async function renderMenuCards() {
    const list = document.querySelector(".menu-list");
    list.innerHTML = "";

    try {
        let menus;
        
        // 先嘗試從 localStorage 讀取菜單資料
        const cachedMenus = localStorage.getItem("menus_cache");
        
        if (cachedMenus) {
            // 如果有快取，直接使用
            menus = JSON.parse(cachedMenus);
            menusData = menus;
        } else {
            // 如果沒有快取，從 API 獲取
            const token = localStorage.getItem("jwt_token");
            const userRes = await fetch("http://localhost:5082/api/v1/menu", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            
            if (!userRes.ok) {
                throw new Error(`HTTP error! status: ${userRes.status}`);
            }
            
            const response = await userRes.json();
            menus = response.data || response;
            
            // 儲存到 localStorage
            localStorage.setItem("menus_cache", JSON.stringify(menus));
            
            // 儲存到全域變數
            menusData = menus;
        }
        
        // 取得所有類別（不重複）
        const categories = [...new Set(menus.map(m => m.category))];

        categories.forEach(category => {
            // 類別標題
            const catDiv = document.createElement("div");
            catDiv.className = "menu-category-title";
            catDiv.innerHTML = `<h2>${category}</h2>`;
            list.appendChild(catDiv);

            // 類別卡片群組外層
            const groupDiv = document.createElement("div");
            groupDiv.className = "menu-category-group";

            // 卡片內容
            const items = menus.filter(m => m.category === category);
            items.forEach(m => {
                const card = document.createElement("div");
                card.className = "menu-card";
                card.innerHTML = `
                    <img src="${m.img || m.image || 'https://picsum.photos/300/200'}" class="menu-img" alt="${m.name}" />
                    <div class="menu-name">${m.name}</div>
                    <div class="menu-desc">${m.desc || m.description || ''}</div>
                    <div class="menu-price">$${m.price}</div>
                    <button onclick="addToCart(${m.id})">加入購物車</button>
                `;
                groupDiv.appendChild(card);
            });

            list.appendChild(groupDiv);
        });
    } catch (error) {
        console.error("載入菜單失敗:", error);
        list.innerHTML = `<div class="empty">載入菜單時發生錯誤，請稍後再試</div>`;
    }
}

/* 加入購物車 */
function addToCart(id) {
    // 直接使用已載入的菜單資料
    const item = menusData.find(m => m.id === id);
    
    if (!item) {
        alert("找不到該商品");
        return;
    }

    const exists = cart.find(c => c.id === id);
    if (exists) {
        exists.qty += 1;
        alert(`"${item.name}" 已加入購物車`);
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1
        });
        alert(`"${item.name}" 已加入購物車`);
    }
}

/* 顯示購物車內容 */
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

        <button onclick="checkout()" style="
            width:100%;
            margin-top:20px;
            background:#198754;
            padding:10px 0;
            border-radius:6px;
            color:white;
            border:none;
            cursor:pointer;
        ">
            前往結帳
        </button>
    `;
}

/* 增加數量 */
function increaseQty(id) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += 1;
    showCart();
}

/* 減少數量 */
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

/* 移除商品 */
function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    showCart();
}

/* 結帳功能 */
function checkout() {
    if (cart.length === 0) {
        alert("購物車是空的");
        return;
    }
    
    // TODO: 實作結帳 API 呼叫
    alert("結帳功能開發中...");
}

/* 初始化菜單頁面 */
function initMenuPage() {
    renderMenuCards();
    
    // 購物車按鈕事件
    const cartBtn = document.getElementById("cartButton");
    if (cartBtn) {
        cartBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            showCart();
        });
    }
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI（內部會呼叫 restoreLoginState）
    initAuthUI();
    
    // 2. 初始化會員選單
    initUserMenu();
    
    // 3. 初始化菜單頁面
    initMenuPage();
});


