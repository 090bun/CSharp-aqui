/* ====================== 會員管理頁面專屬功能 ====================== */

// 初始種子資料（首次無快取時使用）
const seedMembers = [
    { id: 1, name: "王小明", email: "wang@example.com", phone: "0912-345-678", registerDate: "2024-01-15", orderCount: 12, totalAmount: 15600, status: "正常" },
    { id: 2, name: "李大華", email: "lee@example.com", phone: "0923-456-789", registerDate: "2024-03-20", orderCount: 8, totalAmount: 9800, status: "正常" },
    { id: 3, name: "張美玲", email: "chang@example.com", phone: "0934-567-890", registerDate: "2024-05-10", orderCount: 15, totalAmount: 22400, status: "正常" },
    { id: 4, name: "陳建宏", email: "chen@example.com", phone: "0945-678-901", registerDate: "2024-07-05", orderCount: 5, totalAmount: 6200, status: "停用" },
    { id: 5, name: "林雅婷", email: "lin@example.com", phone: "0956-789-012", registerDate: "2024-09-18", orderCount: 20, totalAmount: 31500, status: "正常" }
];

let memberData = [];
let allMembers = [];

function loadMembers() {
    try {
        const cache = localStorage.getItem("members_cache");
        if (cache) {
            memberData = JSON.parse(cache);
        } else {
            memberData = [...seedMembers];
            localStorage.setItem("members_cache", JSON.stringify(memberData));
        }
        allMembers = [...memberData];
    } catch (e) {
        console.warn("讀取會員快取失敗，使用種子資料", e);
        memberData = [...seedMembers];
        allMembers = [...memberData];
    }
}

function persistMembers() {
    try { localStorage.setItem("members_cache", JSON.stringify(allMembers)); } catch (e) { console.warn("寫入會員快取失敗", e); }
}

/* 渲染會員列表 */
function renderMembers(members = memberData) {
    const tbody = document.getElementById("member-table");
    if (!tbody) {
        console.warn("#member-table 不存在，略過 renderMembers()");
        return;
    }
    
    if (members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">查無會員資料</td></tr>';
        return;
    }
    
    tbody.innerHTML = members.map(m => `
        <tr>
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td>${m.registerDate}</td>
            <td>${m.orderCount}</td>
            <td>$${m.totalAmount.toLocaleString()}</td>
            <td>
                <div style="display:flex;align-items:center;justify-content:center;" onclick="event.stopPropagation();">
                    <label class="toggle-switch" style="margin:0;">
                        <input type="checkbox" ${m.status === '正常' ? 'checked' : ''} onchange="event.stopPropagation(); toggleMemberStatus(${m.id}, this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </td>
        </tr>
    `).join("");
}

/* 顯示會員詳細資訊 */
function showMemberDetail(memberId) {
    const member = memberData.find(m => m.id === memberId);
    if (!member) return;

    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>會員編號：</strong></label>
            <span>${member.id}</span>
        </div>

        <div class="detail-item">
            <label><strong>會員名稱：</strong></label>
            <input type="text" id="memberName-${member.id}" value="${member.name}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>Email：</strong></label>
            <input type="email" id="memberEmail-${member.id}" value="${member.email}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>電話：</strong></label>
            <input type="text" id="memberPhone-${member.id}" value="${member.phone}" class="detail-input">
        </div>

        <div class="detail-item">
            <label><strong>註冊時間：</strong></label>
            <span>${member.registerDate}</span>
        </div>

        <div class="detail-item">
            <label><strong>訂單數量：</strong></label>
            <span>${member.orderCount}</span>
        </div>

        <div class="detail-item">
            <label><strong>總消費金額：</strong></label>
            <span>$${member.totalAmount.toLocaleString()}</span>
        </div>

        <div class="detail-item">
            <label><strong>會員狀態：</strong></label>
            <div style="margin-top:6px;display:flex;align-items:center;gap:10px;">
                <label class="toggle-switch">
                    <input type="checkbox" id="memberStatusToggle-${member.id}" ${member.status === '正常' ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>

        <button onclick="saveMemberChanges(${member.id})" style="
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

/* 保存會員修改 */
function saveMemberChanges(memberId) {
    const member = memberData.find(m => m.id === memberId);
    if (!member) return;

    const name = document.getElementById(`memberName-${memberId}`).value.trim();
    const email = document.getElementById(`memberEmail-${memberId}`).value.trim();
    const phone = document.getElementById(`memberPhone-${memberId}`).value.trim();
    const status = document.getElementById(`memberStatusToggle-${memberId}`).checked ? '正常' : '停用';

    if (!name || !email || !phone) {
        alert('請填寫所有必填欄位');
        return;
    }

    member.name = name;
    member.email = email;
    member.phone = phone;
    member.status = status;

    // 同步更新到 allMembers
    const allMemberIndex = allMembers.findIndex(m => m.id === memberId);
    if (allMemberIndex !== -1) {
        allMembers[allMemberIndex] = { ...member };
    }

    renderMembers();
    persistMembers();
    closeDetail();
    alert('會員資料已更新！');
}

// 行內切換會員狀態（列表拉霸）
function toggleMemberStatus(memberId, isActive) {
    const idx = allMembers.findIndex(m => m.id === memberId);
    if (idx === -1) return;
    allMembers[idx].status = isActive ? '正常' : '停用';
    // 同步目前顯示陣列
    const curIdx = memberData.findIndex(m => m.id === memberId);
    if (curIdx !== -1) memberData[curIdx].status = allMembers[idx].status;
    persistMembers();
    renderMembers(memberData); // 重新渲染保持狀態文字更新
}

/* 查詢會員 */
function searchMember() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    container.classList.add("active");
    updateOverlay();
    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>會員名稱查詢：</strong></label>
            <input type="text" id="searchKeyword" class="detail-input" placeholder="輸入會員名稱或編號">
        </div>
        <button onclick="performSearch()" style="
            width:100%;margin-top:16px;background:#198754;padding:10px 0;border-radius:6px;color:#fff;border:none;cursor:pointer;font-size:16px;">
            查詢
        </button>
    `;
}

/* 執行查詢 */
function performSearch() {
    const keyword = document.getElementById("searchKeyword").value.trim().toLowerCase();
    let filtered = allMembers;
    if (keyword) {
        filtered = filtered.filter(m => m.name.toLowerCase().includes(keyword));
    }
    memberData = filtered;
    renderMembers(filtered);
    closeDetail();
    if (filtered.length === 0) alert('查無符合條件的會員');
}

/* 重置搜尋 */
function resetSearch() {
    memberData = [...allMembers];
    renderMembers(memberData);
    closeDetail();
}

/* 初始化會員管理頁面 */
function initMemberPage() {
    loadMembers();
    renderMembers();
    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            searchMember();
        });
    }
}

// 關閉右側詳情面板（會員頁面未引入 orderDetail.js 需自行定義）
function closeDetail() {
    const panel = document.getElementById("detailPanel");
    if (panel) panel.classList.remove("active");
    updateOverlay();
}

/* 頁面載入完成後初始化 */
document.addEventListener("DOMContentLoaded", function () {
    // 1. 先初始化驗證 UI
    initAuthUI();
    
    // 2. 初始化會員選單
    initUserMenu();
    
    // 3. 初始化會員管理頁面
    initMemberPage();
});
