/* ====================== 最新消息頁面專屬功能 ====================== */

// 儲存消息資料（未串接後端前暫存）
let newsData = [
    { id: 1, title: "公告一", content: "這是第一則新聞內容。", created: "2025-01-08 10:20" },
    { id: 2, title: "公告二", content: "這是第二則新聞內容。", created: "2025-01-10 15:40" }
];

/* 渲染消息卡片 */
function renderNews() {
    const container = document.getElementById("newsContainer");
    if (!container) {
        console.warn("#newsContainer 不存在，略過 renderNews()");
        return;
    }
    container.innerHTML = newsData.map(n => `
        <div class="news-card" onclick="showNewsDetail(${n.id})">
            <h2>${n.title}</h2>
            <p>${n.content}</p>
            <p class="news-time">${n.created}</p>
        </div>
    `).join("");
}

/* 顯示消息詳細資訊 */
function showNewsDetail(newsId) {
    const newsItem = newsData.find(n => n.id === newsId);
    if (!newsItem) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>標題：</strong></label>
            <input type="text" id="newsTitle-${newsItem.id}" value="${newsItem.title}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>內容：</strong></label>
            <textarea id="newsContent-${newsItem.id}" class="detail-input" rows="6">${newsItem.content}</textarea>
        </div>

        <div class="detail-item">
            <label><strong>發布時間：</strong></label>
            <span>${newsItem.created}</span>
        </div>

        <button onclick="saveNewsChanges(${newsItem.id})" style="
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

        <button onclick="deleteNews(${newsItem.id})" style="
            width:100%;
            margin-top:12px;
            background: #dc3545;
            padding:10px 0;
            border-radius:6px;
            color:white;
            border:none;
            cursor:pointer;
            font-size: 16px;
        ">
            刪除消息
        </button>
    `;
}

/* 保存消息修改 */
function saveNewsChanges(newsId) {
    const newsItem = newsData.find(n => n.id === newsId);
    if (!newsItem) return;

    const title = document.getElementById(`newsTitle-${newsId}`).value;
    const content = document.getElementById(`newsContent-${newsId}`).value;

    if (!title || !content) {
        alert('請填寫標題和內容');
        return;
    }

    newsItem.title = title;
    newsItem.content = content;

    renderNews();
    closeDetail();
    alert('修改已保存！');
}

/* 刪除消息 */
function deleteNews(newsId) {
    if (!confirm('確定要刪除這則消息嗎？')) return;

    newsData = newsData.filter(n => n.id !== newsId);
    renderNews();
    closeDetail();
    alert('消息已刪除！');
}

/* 開啟新增消息面板 */
function openAddNewsPanel() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    
    container.classList.add("active");
    updateOverlay();
    
    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>標題：</strong></label>
            <input type="text" id="newNewsTitle" class="detail-input" placeholder="輸入消息標題">
        </div>
        
        <div class="detail-item">
            <label><strong>內容：</strong></label>
            <textarea id="newNewsContent" class="detail-input" rows="6" placeholder="輸入消息內容"></textarea>
        </div>
        
        <button id="saveNewNewsBtn" style="
            width:100%;
            margin-top:16px;
            background:#198754;
            padding:10px 0;
            border-radius:6px;
            color:#fff;
            border:none;
            cursor:pointer;
            font-size:16px;
        ">
            發布消息
        </button>
    `;
    
    document.getElementById("saveNewNewsBtn").addEventListener("click", createNews);
}

/* 新增消息 */
function createNews() {
    const titleEl = document.getElementById("newNewsTitle");
    const contentEl = document.getElementById("newNewsContent");
    
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    
    if (!title || !content) {
        alert("請填寫標題和內容");
        return;
    }
    
    const newId = newsData.length > 0 ? Math.max(...newsData.map(n => n.id)) + 1 : 1;
    const now = new Date();
    const created = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    newsData.push({
        id: newId,
        title,
        content,
        created
    });
    
    renderNews();
    closeDetail();
    alert("消息發布成功！");
}

/* 初始化消息頁面 */
function initNewsPage() {
    renderNews();
    
    // 新增消息按鈕
    const addNewsBtn = document.getElementById("addCategoryBtn");
    if (addNewsBtn) {
        addNewsBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            openAddNewsPanel();
        });
    }
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI
    initAuthUI();
    
    // 2. 初始化會員選單
    initUserMenu();
    
    // 3. 初始化消息頁面
    initNewsPage();
});
