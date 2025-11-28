/* ====================== 菜單頁面專屬功能 ====================== */


// 儲存菜單資料
let menusData = [];

/* 強制從 API 重新載入菜單資料 */
async function forceReloadMenus() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:5082/api/v1/menu/active-with-categories", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const menus = data.data || data;

        // 更新快取和全域變數
        localStorage.setItem("menus_cache", JSON.stringify(menus));
        menusData = menus;

        return menus;
    } catch (error) {
        console.error("重新載入菜單失敗:", error);
        throw error;
    }
}

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
            console.log('從快取讀取菜單:', menus);
            console.log('快取菜單數量:', menus.id);
            console.log('快取菜單名稱:', menus.Name);
        } else {
            // 如果沒有快取，從 API 獲取
            const token = localStorage.getItem("token");
            const userRes = await fetch("http://localhost:5082/api/v1/menu/active-with-categories", {
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

            console.log('從 API 獲取菜單:', menus);

            // 儲存到 localStorage
            localStorage.setItem("menus_cache", JSON.stringify(menus));

            // 儲存到全域變數
            menusData = menus;
        }

        // 獲取所有種類資料（包含 ID）
        const token = localStorage.getItem("token");
        let categoriesMap = {};

        try {
            const categoryRes = await fetch("http://localhost:5082/api/v1/Category", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (categoryRes.ok) {
                const categoryData = await categoryRes.json();
                const categories = categoryData.data || categoryData;
                // 建立 name -> id 的對應
                categories.forEach(c => {
                    categoriesMap[c.name] = c.id;
                });
            }
        } catch (error) {
            console.error("獲取種類失敗:", error);
        }

        // 取得所有類別（不重複）
        const categoryNames = [...new Set(menus.map(m => m.category))];

        categoryNames.forEach(categoryName => {

            // 類別外層容器（整組放在一起，不分段）
            const block = document.createElement("div");
            block.className = "menu-block";

            // 類別標題 + 底線 + 刪除按鈕
            const titleWrapper = document.createElement("div");
            titleWrapper.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;";

            const title = document.createElement("h2");
            title.className = "menu-category-title";
            title.textContent = categoryName;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "刪除種類";
            deleteBtn.style.cssText = "background: #dc3545; color: white; border: none; padding: 3px 6px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 20px;";

            // 直接帶入 category ID
            const categoryId = categoriesMap[categoryName];
            if (categoryId) {
                deleteBtn.setAttribute('data-category-id', categoryId);
                deleteBtn.onclick = () => deleteCategory(categoryId, categoryName);
            } else {
                deleteBtn.disabled = true;
                deleteBtn.style.opacity = "0.5";
            }

            titleWrapper.appendChild(title);
            titleWrapper.appendChild(deleteBtn);
            block.appendChild(titleWrapper);

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

            const items = menus.filter(m => m.category === categoryName);
            items.forEach(m => {
                console.log('渲染菜單項目:', m); // 調試：查看菜單物件結構
                const card = document.createElement("div");
                card.className = "menu-card";

                // 確保使用正確的屬性名稱
                const menuId = m.id || m.menuId;
                const menuName = m.name || m.menuName;
                const menuImage = m.img || m.image;
                const menuPrice = m.price;
                const isAvailable = m.isAvailable !== false;

                // 處理圖片路徑：如果是相對路徑，加上後端 URL
                const fullImageUrl = menuImage
                    ? (menuImage.startsWith('http') ? menuImage : `http://localhost:5082${menuImage}`)
                    : 'http://localhost:5082/uploads/menus/default.jpg';

                card.innerHTML = `
            <img src="${fullImageUrl}" class="menu-img" alt="${menuName}" onerror="this.src='http://localhost:5082/uploads/menus/default.jpg'" />
            <div class="menu-name">${menuName}</div>
            <div class="menu-price">$${menuPrice}</div>

            <label class="toggle-switch">
                <input type="checkbox" data-id="${menuId}" ${isAvailable ? 'checked' : ''} onchange="toggleMenuStatus(this)">
                <span class="toggle-slider"></span>
            </label>

            <button class="edit-btn" onclick="showMenuDetail(${menuId})">查看</button>
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
async function toggleMenuStatus(checkboxElement) {
    console.log('toggleMenuStatus 被調用', checkboxElement);

    const menuId = parseInt(checkboxElement.getAttribute('data-id'));
    const isAvailable = checkboxElement.checked;

    console.log(`菜單 ID: ${menuId}, 新狀態: ${isAvailable}`);

    const menu = menusData.find(m => m.id === menuId);
    if (!menu) {
        console.error('找不到菜單:', menuId);
        return;
    }

    // 立即更新本地資料
    menu.isAvailable = isAvailable;
    localStorage.setItem("menus_cache", JSON.stringify(menusData));
    console.log(`本地資料已更新: 菜單 ${menuId} 狀態為 ${isAvailable ? '提供中' : '已售完'}`);

    // 在背景調用 API，不等待結果
    updateMenuCloseStatus(menuId, isAvailable)
        .then(() => {
            console.log(`API 更新成功: 菜單 ${menuId}`);
        })
        .catch(error => {
            console.error("背景更新 API 失敗:", error);
            // API 失敗時回復狀態
            menu.isAvailable = !isAvailable;
            localStorage.setItem("menus_cache", JSON.stringify(menusData));
            checkboxElement.checked = !isAvailable;
            alert("更新菜單狀態失敗，已回復原狀態");
        });
}

// 確保函數在全域作用域中可訪問
window.toggleMenuStatus = toggleMenuStatus;

/* 調用 Menu Close API 更新菜單狀態 */
async function updateMenuCloseStatus(menuId, isAvailable) {
    const token = localStorage.getItem("token");

    const response = await fetch("http://localhost:5082/api/v1/Menu/close", {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify([
            {
                id: menuId,
                isAvailable: isAvailable
            }
        ])
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

/* 顯示品項詳細資訊 */
async function showMenuDetail(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) {
        console.error('找不到菜單:', menuId);
        return;
    }

    console.log('顯示菜單詳細資訊:', menu);

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    // 獲取所有種類
    const token = localStorage.getItem("token");
    let categories = [];

    try {
        const categoryRes = await fetch("http://localhost:5082/api/v1/Category", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            categories = categoryData.data || categoryData;
        }
    } catch (error) {
        console.error("獲取種類失敗:", error);
    }

    // 使用正確的屬性名稱（小寫）
    const menuName = menu.name || menu.menuName || '';
    const menuPrice = menu.price || menu.Price || 0;
    const menuImage = menu.image || menu.img || '';
    const menuCategory = menu.category || '';
    const menuDescription = menu.description || menu.Description || '';
    const isAvailable = menu.isAvailable !== false;

    // 處理圖片路徑：如果是相對路徑，加上後端 URL
    const fullImageUrl = menuImage
        ? (menuImage.startsWith('http') ? menuImage : `http://localhost:5082${menuImage}`)
        : 'http://localhost:5082/uploads/menus/default.jpg';

    panel.innerHTML = `
        <div class="detail-item">
            <div class="detail-image-wrap" onclick="document.getElementById('imageUpload-${menu.id}').click()" style="cursor: pointer; position: relative;">
                <img src="${fullImageUrl}" alt="${menuName}" class="detail-image" id="preview-${menu.id}" onerror="this.src='http://localhost:5082/uploads/menus/default.jpg'" />
                <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    點擊更換圖片
                </div>
            </div>
            <input type="file" id="imageUpload-${menu.id}" accept="image/*" style="display: none;" onchange="handleImageUpload(${menu.id}, this)">
        </div>

        <div class="detail-item">
            <label><strong>種類：</strong></label>
            <select id="category-${menu.id}" class="detail-input">
                ${categories.map(c => `<option value="${c.name}" ${c.name === menuCategory ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>

        <div class="detail-item">
            <label><strong>品項：</strong></label>
            <input type="text" id="name-${menu.id}" value="${menuName}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>說明：</strong></label>
            <textarea id="description-${menu.id}" class="detail-input" rows="3" placeholder="輸入品項說明（選填）">${menuDescription}</textarea>
        </div>

        <div class="detail-item">
            <label><strong>金額：</strong></label>
            <input type="number" id="price-${menu.id}" value="${menuPrice}" class="detail-input">
        </div>

        <div class="detail-item" style="display: flex; align-items: center; justify-content: space-between;">
            <label><strong>是否提供：</strong></label>
            <label class="toggle-switch">
                <input type="checkbox" id="available-${menu.id}" ${isAvailable ? 'checked' : ''}>
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
        reader.onload = function (e) {
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
async function saveMenuChanges(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;

    // 獲取表單值
    const category = document.getElementById(`category-${menuId}`).value;
    const name = document.getElementById(`name-${menuId}`).value;
    const description = document.getElementById(`description-${menuId}`).value;
    const price = parseFloat(document.getElementById(`price-${menuId}`).value);
    const isAvailable = document.getElementById(`available-${menuId}`).checked;

    // 驗證
    if (!category || !name || !price || price <= 0) {
        alert('請填寫所有必填欄位，金額必須大於 0');
        return;
    }

    // 使用 FormData 更新菜單
    const formData = new FormData();
    formData.append('Id', menuId);
    formData.append('Name', name);
    formData.append('Description', description);
    formData.append('Price', price);
    formData.append('Category', category);
    formData.append('IsAvailable', isAvailable);

    // 檢查是否有上傳新圖片
    const fileInput = document.getElementById(`imageUpload-${menuId}`);
    if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    } else {
        // 保留原有圖片路徑
        formData.append('Image', menu.image || menu.img || '');
    }

    const token = localStorage.getItem("token");
    try {
        // 調用 PATCH API 更新菜單（包含圖片）
        const res = await fetch("http://localhost:5082/api/v1/Menu", {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
                // 不要設定 Content-Type，讓瀏覽器自動處理
            },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "更新菜單失敗");
        }

        console.log(`菜單 ${menuId} 已成功更新到後端`);

        // 強制從 API 重新載入菜單資料
        await forceReloadMenus();

        // 重新渲染菜單列表
        await renderMenuCards();

        // 關閉面板
        closeDetail();

        alert('修改已保存！');
    } catch (error) {
        console.error("保存菜單修改失敗:", error);
        alert(error.message || "保存修改失敗，請稍後再試");
    }
}

/* 編輯菜單 */
function editMenu(menuId) {
    const menu = menusData.find(m => m.id === menuId);
    if (!menu) return;
    console.log('編輯菜單:', menu);
    alert(`編輯菜單: ${menu.menuName}\n價格: ${menu.price}`);
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
        addCategoryBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            openAddCategoryPanel();
        });
    }

    // 新增品項按鈕
    const addMenuItemBtn = document.getElementById("addMenuItemBtn");
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            openAddMenuItemPanel();
        });
    }
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI（內部會呼叫 restoreLoginState）
    // 若無權限則強制導向登入頁
    initAuthUI(true);

    // 2. 初始化會員選單
    initUserMenu();

    // 3. 初始化菜單頁面
    initMenuPage();
});

/* ====================== 新增種類 ====================== */
function openAddCategoryPanel() {
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

async function createCategory() {
    const nameInput = document.getElementById("newCategoryName");
    const name = nameInput ? nameInput.value.trim() : "";
    if (!name) {
        alert("請輸入種類名稱");
        return;
    }
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:5082/api/v1/Category", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "新增種類失敗");
        }

        // 強制從 API 重新載入菜單資料
        await forceReloadMenus();

        // 重新渲染菜單
        await renderMenuCards();

        closeDetail();
        alert("種類新增成功！");
    } catch (err) {
        console.error(err);
        alert(err.message || "種類新增失敗");
    }
}

/* ====================== 刪除種類 ====================== */
async function deleteCategory(categoryId, categoryName) {
    if (!confirm(`確定要刪除種類「${categoryName}」嗎？\n\n注意：此操作將刪除該種類下的所有品項！`)) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        // 直接呼叫刪除 API，使用傳入的 categoryId
        const res = await fetch(`http://localhost:5082/api/v1/Category/delete/${categoryId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "刪除種類失敗");
        }

        // 強制從 API 重新載入菜單資料
        await forceReloadMenus();

        // 重新渲染菜單
        await renderMenuCards();

        alert("種類刪除成功！");
    } catch (err) {
        console.error(err);
        alert(err.message || "種類刪除失敗");
    }
}

/* ====================== 新增品項 ====================== */
async function openAddMenuItemPanel() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    container.classList.add("active");
    updateOverlay();

    // 先載入最新的菜單資料
    try {
        await forceReloadMenus();
    } catch (error) {
        console.warn("載入最新菜單失敗，使用快取資料", error);
    }

    // 從 Category API 獲取種類
    const token = localStorage.getItem("token");
    let categories = [];

    try {
        const categoryRes = await fetch("http://localhost:5082/api/v1/Category", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (categoryRes.ok) {
            const categoryData = await categoryRes.json();
            categories = categoryData.data || categoryData;
        }
    } catch (error) {
        console.error("獲取種類失敗:", error);
    }

    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>種類：</strong></label>
            <select id="newMenuCategory" class="detail-input">
                <option value="">--請選擇種類--</option>
                ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
            </select>
            
        </div>
        <div class="detail-item">
            <label><strong>品項名稱：</strong></label>
            <input type="text" id="newMenuName" class="detail-input" placeholder="輸入品項名稱" />
        </div>
        <div class="detail-item">
            <label><strong>說明：</strong></label>
            <textarea id="newMenuDescription" class="detail-input" rows="3" placeholder="輸入品項說明（選填）"></textarea>
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

async function createMenuItem() {
    const categorySelect = document.getElementById("newMenuCategory");
    const nameEl = document.getElementById("newMenuName");
    const descriptionEl = document.getElementById("newMenuDescription");
    const priceEl = document.getElementById("newMenuPrice");
    const imgEl = document.getElementById("newMenuImage");
    const availableEl = document.getElementById("newMenuAvailable");

    const category = categorySelect.value.trim();
    const name = nameEl.value.trim();
    const description = descriptionEl.value.trim();
    const price = parseInt(priceEl.value, 10);
    const isAvailable = availableEl.checked;

    if (!category || !name || !price || price <= 0) {
        alert("請填寫所有必填欄位，價格需大於 0");
        return;
    }

    // 使用 FormData 上傳
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Description', description);
    formData.append('Price', price);
    formData.append('Category', category);
    formData.append('IsAvailable', isAvailable);

    // 如果有選擇圖片，加入 file
    if (imgEl.files && imgEl.files[0]) {
        formData.append('file', imgEl.files[0]);
    }

    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://localhost:5082/api/v1/Menu", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // 不要設定 Content-Type，讓瀏覽器自動處理
            },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || "新增品項失敗");
        }

        // 強制從 API 重新載入菜單資料
        await forceReloadMenus();

        // 重新渲染菜單
        await renderMenuCards();

        closeDetail();
        alert("品項新增成功！");
    } catch (err) {
        console.error(err);
        alert(err.message || "品項新增失敗");
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


