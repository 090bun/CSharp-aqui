/* ====================== 最新消息頁面專屬功能 ====================== */

// 儲存消息資料
let newsData = [];

/* 從 API 載入消息資料 */
async function loadNews() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(window.api.getUrl('/news'), {
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
        newsData = data.data || data;
        console.log('載入消息:', newsData);
        
        return newsData;
    } catch (error) {
        console.error("載入消息失敗:", error);
        throw error;
    }
}

/* 渲染消息卡片 */
async function renderNews() {
    const container = document.getElementById("newsContainer");
    if (!container) {
        console.warn("#newsContainer 不存在，略過 renderNews()");
        return;
    }
    
    try {
        await loadNews();
        
        if (newsData.length === 0) {
            container.innerHTML = '<div class="empty">目前沒有消息</div>';
            return;
        }
        
        container.innerHTML = newsData.map(n => `
            <div class="news-card" onclick="showNewsDetail(${n.id})">
                <h2>${n.title || '無標題'}</h2>
                <p>${n.content || ''}</p>
                <p class="news-time">${n.createdAt || n.created || ''}</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("渲染消息失敗:", error);
        container.innerHTML = '<div class="empty">載入消息時發生錯誤</div>';
    }
}

/* 顯示消息詳細資訊 */
async function showNewsDetail(newsId) {
    const token = localStorage.getItem("token");
    
    try {
        // 從 API 獲取單一消息詳情
        const response = await fetch(window.api.getUrl(`/news/${newsId}`), {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const newsItem = result.data || result;
        
        console.log('消息詳情:', newsItem);

        const panel = document.getElementById("detail-content");
        const container = document.getElementById("detailPanel");

        container.classList.add("active");
        updateOverlay();

        panel.innerHTML = `
            <div class="detail-item">
                <label><strong>標題：</strong></label>
                <input type="text" id="newsTitle-${newsItem.id}" value="${newsItem.title || ''}" class="detail-input">
            </div>

            <div class="detail-item">
                <label><strong>內容：</strong></label>
                <textarea id="newsContent-${newsItem.id}" class="detail-input" rows="6">${newsItem.content || ''}</textarea>
            </div>

            <div class="detail-item">
                <label><strong>發布時間：</strong></label>
                <span>${newsItem.createdAt || newsItem.created || '未設定'}</span>
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
    } catch (error) {
        console.error("獲取消息詳情失敗:", error);
        alert("獲取消息詳情失敗，請稍後再試");
    }
}

/* 保存消息修改 */
async function saveNewsChanges(newsId) {
    const title = document.getElementById(`newsTitle-${newsId}`).value.trim();
    const content = document.getElementById(`newsContent-${newsId}`).value.trim();

    if (!title || !content) {
        alert('請填寫標題和內容');
        return;
    }

    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(window.api.getUrl(`/news/${newsId}`), {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "修改消息失敗");
        }
        
        await renderNews();
        closeDetail();
        alert('修改已保存！');
    } catch (error) {
        console.error("保存消息修改失敗:", error);
        alert(error.message || "保存修改失敗，請稍後再試");
    }
}

/* 刪除消息 */
async function deleteNews(newsId) {
    if (!confirm('確定要刪除這則消息嗎？')) return;

    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(window.api.getUrl(`/news/${newsId}`), {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "刪除消息失敗");
        }
        
        await renderNews();
        closeDetail();
        alert('消息已刪除！');
    } catch (error) {
        console.error("刪除消息失敗:", error);
        alert(error.message || "刪除消息失敗，請稍後再試");
    }
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
async function createNews() {
    const titleEl = document.getElementById("newNewsTitle");
    const contentEl = document.getElementById("newNewsContent");
    
    const title = titleEl.value.trim();
    const content = contentEl.value.trim();
    
    if (!title || !content) {
        alert("請填寫標題和內容");
        return;
    }
    
    const token = localStorage.getItem("token");
    
    try {
        const response = await fetch(window.api.getUrl('/news'), {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: content
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "新增消息失敗");
        }
        
        await renderNews();
        closeDetail();
        alert("消息發布成功！");
    } catch (error) {
        console.error("發布消息失敗:", error);
        alert(error.message || "發布消息失敗，請稍後再試");
    }
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
    initAuthUI(true);
    
    // 2. 初始化會員選單
    initUserMenu();
    
    // 3. 初始化消息頁面
    initNewsPage();
});
