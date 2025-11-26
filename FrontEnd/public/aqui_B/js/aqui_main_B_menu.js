/* ====================== 菜單頁面專屬功能 ====================== */


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

    // 類別外層容器（整組放在一起，不分段）
    const block = document.createElement("div");
    block.className = "menu-block";

    // 類別標題 + 底線
    const title = document.createElement("h2");
    title.className = "menu-category-title";
    title.textContent = category;
    block.appendChild(title);

    // 表格標題列
    const headerDiv = document.createElement("div");
    headerDiv.className = "menu-header";
    headerDiv.innerHTML = `
        <div class="header-img">圖片</div>
        <div class="header-name">品項</div>
        <div class="header-price">價格</div>
        <div class="header-status">提供中</div>
        <div class="header-action">修改</div>
    `;
    block.appendChild(headerDiv);

    // 內容卡片群組
    const groupDiv = document.createElement("div");
    groupDiv.className = "menu-category-group";

    const items = menus.filter(m => m.category === category);
    items.forEach(m => {
        const card = document.createElement("div");
        card.className = "menu-card";
        card.innerHTML = `
            <img src="${m.img || m.image || 'https://picsum.photos/300/200'}" class="menu-img" alt="${m.name}" />
            <div class="menu-name">${m.name}</div>
            <div class="menu-price">$${m.price}</div>

            <label class="toggle-switch">
                <input type="checkbox" ${m.isAvailable !== false ? 'checked' : ''} onchange="toggleMenuStatus(${m.id}, this.checked)">
                <span class="toggle-slider"></span>
            </label>

            <button class="edit-btn" onclick="showMenuDetail(${m.id})">查看</button>
        `;
        groupDiv.appendChild(card);
    });

    block.appendChild(groupDiv);

    list.appendChild(block);
});

    } catch (error) {
        console.error("載入菜單失敗:", error);
        list.innerHTML = `<div class="empty">載入菜單時發生錯誤，請稍後再試</div>`;
    }
}


/* 顯示購物車內容 */
function showCart() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();


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

/* 移除商品 */
function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    showCart();
}


/* 切換菜單狀態 */
function toggleMenuStatus(menuId, isAvailable) {
    const menu = menusData.find(m => m.id === menuId);
    if (menu) {
        menu.isAvailable = isAvailable;
        localStorage.setItem("menus_cache", JSON.stringify(menusData));
        console.log(`菜單 ${menuId} 狀態已更新為: ${isAvailable ? '提供中' : '已售完'}`);
    }
}

/* 顯示品項詳細資訊 */
function showMenuDetail(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    // 格式化日期
    const createDate = menu.createdAt || menu.created || '未設定';

    panel.innerHTML = `
        <div class="detail-item">
            <div class="detail-image-wrap" onclick="document.getElementById('imageUpload-${menu.id}').click()" style="cursor: pointer; position: relative;">
                <img src="${menu.img || menu.image || 'https://picsum.photos/300/200'}" alt="${menu.name}" class="detail-image" id="preview-${menu.id}" />
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    點擊更換圖片
                </div>
            </div>
            <input type="file" id="imageUpload-${menu.id}" accept="image/*" style="display: none;" onchange="handleImageUpload(${menu.id}, this)">
        </div>

        <div class="detail-item">
            <label><strong>種類：</strong></label>
            <input type="text" id="category-${menu.id}" value="${menu.category}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>品項：</strong></label>
            <input type="text" id="name-${menu.id}" value="${menu.name}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>金額：</strong></label>
            <input type="number" id="price-${menu.id}" value="${menu.price}" class="detail-input">
        </div>

        <div class="detail-item" style="display: flex; align-items: center; justify-content: space-between;">
            <label><strong>是否提供：</strong></label>
            <label class="toggle-switch">
                <input type="checkbox" id="available-${menu.id}" ${menu.isAvailable !== false ? 'checked' : ''}>
                <span class="toggle-slider"></span>
            </label>
        </div>

        <button onclick="saveMenuChanges(${menu.id})" style="
            width:100%;
            margin-top:20px;
            background: #0d6efd;
            padding:10px 0;
            border-radius:6px;
            color:white;
            border:none;
            cursor:pointer;
            font-size: 16px;
        ">
            保存修改
        </button>
    `;
}

/* 處理圖片上傳 */
function handleImageUpload(menuId, input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(`preview-${menuId}`);
            if (preview) {
                preview.src = e.target.result;
            }
            // 暫存到 menu 物件
            const menu = menusData.find(m => m.id === menuId);
            if (menu) {
                menu.img = e.target.result;
            }
        };
        reader.readAsDataURL(input.files[0]);
    }
}

/* 保存菜單修改 */
function saveMenuChanges(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;

    // 獲取表單值
    const category = document.getElementById(`category-${menuId}`).value;
    const name = document.getElementById(`name-${menuId}`).value;
    const price = parseFloat(document.getElementById(`price-${menuId}`).value);
    const isAvailable = document.getElementById(`available-${menuId}`).checked;

    // 驗證
    if (!category || !name || !price || price <= 0) {
        alert('請填寫所有必填欄位，金額必須大於 0');
        return;
    }

    // 更新資料
    menu.category = category;
    menu.name = name;
    menu.price = price;
    menu.isAvailable = isAvailable;

    // 儲存到 localStorage
    localStorage.setItem("menus_cache", JSON.stringify(menusData));

    // 重新渲染菜單列表
    renderMenuCards();

    // 關閉面板
    closeDetail();

    alert('修改已保存！');
}

/* 編輯菜單 */
function editMenu(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;
    console.log('編輯菜單:', menu);
    alert(`編輯菜單: ${menu.name}\n價格: ${menu.price}`);
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

    // 新增種類按鈕
    const addCategoryBtn = document.getElementById("addCategoryBtn");
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener("click", function(e){
            e.stopPropagation();
            openAddCategoryPanel();
        });
    }

    // 新增品項按鈕
    const addMenuItemBtn = document.getElementById("addMenuItemBtn");
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener("click", function(e){
            e.stopPropagation();
            openAddMenuItemPanel();
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

/* ====================== 新增種類 ====================== */
function openAddCategoryPanel(){
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    container.classList.add("active");
    updateOverlay();
    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>新增種類名稱：</strong></label>
            <input type="text" id="newCategoryName" class="detail-input" placeholder="輸入種類名稱">
        </div>
        <button id="saveCategoryBtn" style="width:100%;margin-top:16px;background:#198754;padding:10px 0;border-radius:6px;color:#fff;border:none;cursor:pointer;">保存種類</button>
    `;
    const saveBtn = document.getElementById("saveCategoryBtn");
    saveBtn.addEventListener("click", createCategory);
}

async function createCategory(){
    const nameInput = document.getElementById("newCategoryName");
    const name = nameInput ? nameInput.value.trim() : "";
    if(!name){
        alert("請輸入種類名稱");
        return;
    }
    const token = localStorage.getItem("jwt_token");
    try {
        const res = await fetch("http://localhost:5082/api/v1/category",{
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type":"application/json"
            },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if(!res.ok){
            throw new Error(data.message || "新增種類失敗");
        }
        alert("種類新增成功！");
        closeDetail();
    }catch(err){
        console.error(err);
        alert(err.message || "種類新增失敗");
    }
}

/* ====================== 新增品項 ====================== */
function openAddMenuItemPanel(){
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    container.classList.add("active");
    updateOverlay();

    const existingCategories = [...new Set(menusData.map(m => m.category))];

    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>種類：</strong></label>
            <select id="newMenuCategory" class="detail-input">
                <option value="">--選擇或輸入--</option>
                ${existingCategories.map(c => `<option value="${c}">${c}</option>`).join("")}
            </select>
            
        </div>
        <div class="detail-item">
            <label><strong>品項名稱：</strong></label>
            <input type="text" id="newMenuName" class="detail-input" placeholder="輸入品項名稱" />
        </div>
        <div class="detail-item">
            <label><strong>價格：</strong></label>
            <input type="number" id="newMenuPrice" class="detail-input" placeholder="輸入價格" />
        </div>
        <div class="detail-item">
            <label><strong>圖片：</strong></label>
            <input type="file" id="newMenuImage" accept="image/*" class="detail-input" />
        </div>
        <div class="detail-item" style="display:flex;align-items:center;justify-content:space-between;">
            <label><strong>是否提供：</strong></label>
            <label class="toggle-switch">
                <input type="checkbox" id="newMenuAvailable" checked>
                <span class="toggle-slider"></span>
            </label>
        </div>
        <button id="saveMenuItemBtn" style="width:100%;margin-top:16px;background:#0d6efd;padding:10px 0;border-radius:6px;color:#fff;border:none;cursor:pointer;">新增品項</button>
    `;
    document.getElementById("saveMenuItemBtn").addEventListener("click", createMenuItem);
}

async function createMenuItem(){
    const categorySelect = document.getElementById("newMenuCategory");
    const categoryText = document.getElementById("newMenuCategoryText");
    const nameEl = document.getElementById("newMenuName");
    const priceEl = document.getElementById("newMenuPrice");
    const imgEl = document.getElementById("newMenuImage");
    const availableEl = document.getElementById("newMenuAvailable");

    const category = (categoryText.value.trim() || categorySelect.value.trim());
    const name = nameEl.value.trim();
    const price = parseInt(priceEl.value,10);
    const isAvailable = availableEl.checked;

    if(!category || !name || !price || price <= 0){
        alert("請填寫所有必填欄位，價格需大於 0");
        return;
    }

    let base64Image = "";
    if(imgEl.files && imgEl.files[0]){
        base64Image = await fileToBase64(imgEl.files[0]);
    }

    const token = localStorage.getItem("jwt_token");
    try {
        const res = await fetch("http://localhost:5082/api/v1/menu", {
            method:"POST",
            headers:{
                "Authorization": `Bearer ${token}`,
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                name,
                price,
                image: base64Image,
                category,
                isAvailable
            })
        });
        const data = await res.json();
        if(!res.ok){
            throw new Error(data.message || "新增品項失敗");
        }
        // 後端回傳資料可能在 data.data
        const newItem = data.data || data;
        // 加入本地資料並重建快取
        menusData.push({
            id: newItem.id,
            name: newItem.name,
            price: newItem.price,
            image: newItem.image,
            category: newItem.category,
            isAvailable: newItem.isAvailable
        });
        localStorage.setItem("menus_cache", JSON.stringify(menusData));
        renderMenuCards();
        closeDetail();
        alert("品項新增成功！");
    }catch(err){
        console.error(err);
        alert(err.message || "品項新增失敗");
    }
}

function fileToBase64(file){
    return new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


