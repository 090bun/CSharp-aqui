const newsContainer = document.getElementById("newsContainer");

const news = [
    { title: "公告一", content: "這是第一則新聞內容。", created: "2025-01-08 10:20" },
    { title: "公告二", content: "這是第二則新聞內容。", created: "2025-01-10 15:40" }
];

function renderNews() {
    newsContainer.innerHTML = news.map(n => `
        <div class="news-card">
            <h2>${n.title}</h2>
            <p>${n.content}</p>
            <p class="news-time">${n.created}</p>
        </div>
    `).join("");
}

renderNews();
