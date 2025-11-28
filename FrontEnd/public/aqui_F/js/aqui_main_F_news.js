const newsContainer = document.getElementById("newsContainer");

let news = [];

/* 從 API 載入消息資料 */
async function loadNews() {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch("http://localhost:5082/api/v1/news", {
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
        news = data.data || data;
        console.log('載入消息:', news);
        
        return news;
    } catch (error) {
        console.error("載入消息失敗:", error);
        throw error;
    }
}

async function renderNews() {
    if (!newsContainer) {
        console.warn("#newsContainer 不存在");
        return;
    }
    
    try {
        await loadNews();
        
        if (news.length === 0) {
            newsContainer.innerHTML = '<div class="empty">目前沒有消息</div>';
            return;
        }
        
        newsContainer.innerHTML = news.map((n, idx) => {
            // 使用兩位數編號作為 anchor（例如 01, 02, 03）以對應 index.html 的連結
            const anchor = ("0" + (idx + 1)).slice(-2);
            return `
            <div class="news-card" id="news-${anchor}">
                <h2>${n.title || '無標題'}</h2>
                <p>${n.content || ''}</p>
                <p class="news-time">${n.createdAt || n.created || ''}</p>
            </div>
        `;
        }).join("");

        // 如果 URL 帶有 hash（例如 #01），嘗試滾動到對應的 news 卡片並短暫高亮
        try {
            const h = window.location.hash;
            if (h && h.length > 1) {
                const raw = h.slice(1); // 去掉 '#'
                const targetId = `news-${raw}`;
                const el = document.getElementById(targetId);
                if (el) {
                    // 使用平滑滾動
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // 短暫高亮
                    const origBg = el.style.backgroundColor;
                    el.style.transition = 'background-color 0.4s ease';
                    el.style.backgroundColor = '#fff5c3ff';
                    setTimeout(() => {
                        el.style.backgroundColor = origBg || '';
                    }, 300);
                }
            }
        } catch (err) {
            console.error('處理 hash 滾動時發生錯誤:', err);
        }
    } catch (error) {
        console.error("渲染消息失敗:", error);
        newsContainer.innerHTML = '<div class="empty">載入消息時發生錯誤</div>';
    }
}

renderNews();

