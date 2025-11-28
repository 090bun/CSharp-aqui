/* ====================== 菜單頁面專屬功能 ====================== */

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
            // 如果沒有快取,從 API 獲取
            const token = localStorage.getItem("token");
            const userRes = await fetch(window.api.getUrl('/menu/with-categories'), {
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
                
                // 處理圖片路徑：如果是相對路徑，加上後端 URL
                const menuImage = m.img || m.image;
                const fullImageUrl = menuImage 
                    ? (menuImage.startsWith('http') ? menuImage : `${window.API_IMG_BASE}/uploads/menus${menuImage}`)
                    : `${window.API_IMG_BASE}/uploads/menus/default.jpg`;
                
                card.innerHTML = `
                    <img src="${fullImageUrl}" class="menu-img" alt="${m.name}" onerror="this.src='${window.API_IMG_BASE}/uploads/menus/default.jpg'" />
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

    // 顯示加入購物車的對話框
    showAddToCartDialog(item);
}

/* 顯示加入購物車對話框 */
function showAddToCartDialog(item) {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    panel.innerHTML = `
        <div class="detail-item"><strong>加入購物車</strong></div>
        
        <div class="detail-item" style="margin-top:16px;">
            <strong>商品：</strong>${item.name}
        </div>
        
        <div class="detail-item">
            <strong>單價：</strong>$${item.price}
        </div>
        
        <div class="detail-item" style="margin-top:16px;">
            <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="spicyCheckbox" style="width:18px;height:18px;cursor:pointer;">
                <span style="font-size:16px;">要辣 🌶️</span>
            </label>
        </div>
        
        <div class="detail-item" style="margin-top:16px;">
            <strong>數量：</strong>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px;">
                <button onclick="changeDialogQty(-1)" style="width:36px;height:36px;font-size:20px;">-</button>
                <span id="dialogQty" style="font-size:18px;min-width:30px;text-align:center;">1</span>
                <button onclick="changeDialogQty(1)" style="width:36px;height:36px;font-size:20px;">+</button>
            </div>
        </div>
        
        <div class="detail-item" style="margin-top:16px;">
            <strong>小計：</strong>
            <span id="dialogSubtotal" style="font-size:18px;color:#4CAF50;">$${item.price}</span>
        </div>
        
        <div style="display:flex;gap:12px;margin-top:24px;">
            <button onclick="document.getElementById('detailPanel').classList.remove('active'); updateOverlay();" style="
                flex:1;
                background:#6c757d;
                padding:12px 0;
                border-radius:6px;
                color:white;
                border:none;
                cursor:pointer;
                font-size:16px;
            ">
                取消
            </button>
            <button onclick="confirmAddToCart(${item.id}, ${item.price})" style="
                flex:1;
                background:#198754;
                padding:12px 0;
                border-radius:6px;
                color:white;
                border:none;
                cursor:pointer;
                font-size:16px;
            ">
                確認加入
            </button>
        </div>
    `;
}

/* 改變對話框中的數量 */
function changeDialogQty(delta) {
    const qtyElement = document.getElementById("dialogQty");
    const subtotalElement = document.getElementById("dialogSubtotal");
    
    let currentQty = parseInt(qtyElement.textContent);
    currentQty += delta;
    
    if (currentQty < 1) currentQty = 1;
    
    qtyElement.textContent = currentQty;
    
    // 更新小計（從按鈕的 onclick 屬性中取得價格）
    const confirmBtn = document.querySelector('button[onclick^="confirmAddToCart"]');
    if (confirmBtn) {
        const price = parseInt(confirmBtn.getAttribute('onclick').split(',')[1].trim().replace(')', ''));
        subtotalElement.textContent = `$${price * currentQty}`;
    }
}

/* 確認加入購物車 */
function confirmAddToCart(id, price) {
    const item = menusData.find(m => m.id === id);
    if (!item) return;
    
    const qty = parseInt(document.getElementById("dialogQty").textContent);
    const spicyLevel = document.getElementById("spicyCheckbox").checked ? 1 : 0;
    
    // 只更新本地購物車，結帳時才打 API
    const exists = cart.find(c => c.id === id && c.spicyLevel === spicyLevel);
    if (exists) {
        exists.qty += qty;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: qty,
            spicyLevel: spicyLevel
        });
    }
    
    alert(`"${item.name}" x${qty} 已加入購物車`);
    showCart();
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
                    <div>${item.name} ${item.spicyLevel === 1 ? '🌶️' : ''}</div>
                    <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
                        <button onclick="decreaseQty(${item.id}, ${item.spicyLevel})">-</button>
                        <span>${item.qty}</span>
                        <button onclick="increaseQty(${item.id}, ${item.spicyLevel})">+</button>
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
        ">前往結帳</button>
    `;
}

/* 增加數量 */
function increaseQty(id, spicyLevel) {
    const item = cart.find(i => i.id === id && i.spicyLevel === spicyLevel);
    if (!item) return;
    
    // 只更新本地購物車，結帳時才打 API
    item.qty += 1;
    showCart();
}

/* 減少數量 */
function decreaseQty(id, spicyLevel) {
    const item = cart.find(i => i.id === id && i.spicyLevel === spicyLevel);
    if (!item) return;

    if (item.qty <= 1) {
        // 數量為 1 時，減少就是刪除
        removeItem(id, spicyLevel);
        return;
    }

    // 只更新本地購物車，結帳時才打 API
    item.qty -= 1;
    showCart();
}

/* 移除商品 */
function removeItem(id, spicyLevel) {
    cart = cart.filter(i => !(i.id === id && i.spicyLevel === spicyLevel));
    showCart();
}

/* 結帳功能 */
function checkout() {
    if (cart.length === 0) {
        alert("購物車是空的");
        return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
        alert("請先登入才能結帳");
        return;
    }
    
    // 顯示結帳對話框
    showCheckoutDialog();
}

/* 顯示結帳對話框 */
function showCheckoutDialog() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    // 取得當前日期時間，設定為預設值
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const defaultDate = `${year}-${month}-${day}`;
    const defaultTime = `${hours}:${minutes}`;

    panel.innerHTML = `
        <div class="detail-item"><strong>結帳資訊</strong></div>
        
        <div class="detail-item" style="margin-top:16px;">
            <strong>訂單內容：</strong>
            <div style="margin-top:8px;font-size:14px;color:#c9c9c9;">
                ${cart.map(item => `
                    <div style="margin:4px 0;">
                        ${item.name} ${item.spicyLevel === 1 ? '🌶️' : ''} x${item.qty} - $${item.price * item.qty}
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="detail-item" style="margin-top:12px;">
            <strong>總金額：</strong>
            <span style="font-size:18px;color:#4CAF50;">$${cart.reduce((sum, i) => sum + i.qty * i.price, 0)}</span>
        </div>
        
        <div class="detail-item" style="margin-top:16px;">
            <strong>取餐日期：</strong>
            <input type="date" id="pickupDate" value="${defaultDate}" style="
                width:100%;
                margin-top:8px;
                padding:8px;
                border:1px solid #444;
                border-radius:4px;
                background:#2a2a2a;
                color:#fff;
                font-size:14px;
            ">
        </div>
        
        <div class="detail-item" style="margin-top:12px;">
            <strong>取餐時間：</strong>
            <input type="time" id="pickupTime" value="${defaultTime}" style="
                width:100%;
                margin-top:8px;
                padding:8px;
                border:1px solid #444;
                border-radius:4px;
                background:#2a2a2a;
                color:#fff;
                font-size:14px;
            ">
        </div>
        
        <div class="detail-item" style="margin-top:16px;">
            <label style="display:flex;align-items:center;gap:8px;">
                <input type="checkbox" id="utensilsCheckbox" checked style="width:18px;height:18px;cursor:pointer;">
                <span style="font-size:16px;">需要餐具</span>
            </label>
        </div>
        
        <div style="display:flex;gap:12px;margin-top:24px;">
            <button onclick="showCart()" style="
                flex:1;
                background:#6c757d;
                padding:12px 0;
                border-radius:6px;
                color:white;
                border:none;
                cursor:pointer;
                font-size:16px;
            ">
                返回購物車
            </button>
            <button id="confirmCheckoutBtn" onclick="confirmCheckout()" style="
                flex:1;
                background:#198754;
                padding:12px 0;
                border-radius:6px;
                color:white;
                border:none;
                cursor:pointer;
                font-size:16px;
            ">
                確認送出
            </button>
        </div>
    `;
}

/* 確認結帳 */
async function confirmCheckout() {
    const pickupDate = document.getElementById("pickupDate").value;
    const pickupTime = document.getElementById("pickupTime").value;
    const utensils = document.getElementById("utensilsCheckbox").checked;
    
    if (!pickupDate || !pickupTime) {
        alert("請選擇取餐日期和時間");
        return;
    }
    
    // 組合成 ISO 8601 格式
    const pickupDateTime = `${pickupDate}T${pickupTime}:00`;
    
    // 顯示載入中的提示
    const submitBtn = document.getElementById("confirmCheckoutBtn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "傳送訂單中...";
    submitBtn.style.cursor = "wait";
    submitBtn.style.opacity = "0.6";
    
    try {
        const token = localStorage.getItem("token");
        
        // 步驟 1: 先將本地購物車的所有商品透過 API 加入到資料庫（使用陣列格式）
        console.log("開始同步購物車到資料庫...");
        const cartItems = cart.map(item => ({
            menuId: item.id,
            quantity: item.qty,
            spicyLevel: item.spicyLevel
        }));
        
        const addResponse = await fetch(window.api.getUrl('/Cart'), {
            method: "POST",
            headers: {
                "authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cartItems)
        });

        if (!addResponse.ok) {
            const errorData = await addResponse.json().catch(() => ({}));
            throw new Error(errorData.message || `加入購物車失敗: ${addResponse.status}`);
        }
        
        console.log("購物車同步成功");
        
        // 步驟 2: 所有商品都加入後，執行結帳
        console.log("開始結帳...");
        const response = await fetch(window.api.getUrl('/Cart/checkout'), {
            method: "POST",
            headers: {
                "authorization": "Bearer " + token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pickupTime: pickupDateTime,
                utensils: utensils
            })
        });
        
        if (!response.ok) {
            // 嘗試解析錯誤訊息，如果解析失敗則使用預設訊息
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
                // JSON 解析失敗，使用預設訊息
            }
            throw new Error(errorMessage);
        }
        
        const result = await response.json();
        console.log("結帳回應:", result);
        
        // 檢查回應是否包含錯誤
        if (result.success === false || result.error) {
            throw new Error(result.message || result.error || "結帳失敗");
        }
        
        // 恢復按鈕狀態
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.cursor = "";
        submitBtn.style.opacity = "";
        
        // 關閉對話框
        const detailPanel = document.getElementById("detailPanel");
        if (detailPanel) {
            detailPanel.classList.remove("active");
            updateOverlay();
        }
        
        // 顯示成功訊息
        alert("訂單已送出...\n等待店家確認");
        // 清空購物車
        cart = [];
        
        // 更新購物車顯示（如果購物車面板是開啟的）
        const detailPanelCheck = document.getElementById("detailPanel");
        if (detailPanelCheck && detailPanelCheck.classList.contains("active")) {
            showCart();
        }
    } catch (error) {
        console.error("結帳失敗:", error);
        
        // 恢復按鈕狀態
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.cursor = "";
        submitBtn.style.opacity = "";
        
        alert(`結帳失敗: ${error.message}`);
    }
        
}

/* 初始化菜單頁面 */
async function initMenuPage() {
    // 載入菜單
    await renderMenuCards();
    
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


