/* ====================== 會員管理頁面專屬功能 ====================== */
let memberData = [];
let allMembers = [];
const API_BASE_URL = window.API_BASE_URL;

// 從後端 API 載入所有會員資料
async function loadMembers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("未找到 JWT token，無法載入會員資料");
            memberData = [...seedMembers];
            allMembers = [...memberData];
            return;
        }

        const response = await fetch(`${API_BASE_URL}/user/all`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 轉換後端資料格式為前端格式
        if (result.data && Array.isArray(result.data)) {
            memberData = result.data.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                registerDate: new Date(user.createdAt).toLocaleDateString('zh-TW'),
                orderCount: 0, // 需要另外計算或從訂單 API 取得
                totalAmount: 0, // 需要另外計算或從訂單 API 取得
                status: user.isAvailable ? '正常' : '停用'
            }));
            allMembers = [...memberData];
        } else {
            throw new Error('資料格式錯誤');
        }
    } catch (e) {
        console.error("載入會員資料失敗", e);
        alert('載入會員資料失敗: ' + e.message);
        // 使用種子資料作為備用
        memberData = [...seedMembers];
        allMembers = [...memberData];
    }
}

function persistMembers() {
    // 已改用後端 API，不再需要本地儲存
    // try { localStorage.setItem("members_cache", JSON.stringify(allMembers)); } catch (e) { console.warn("寫入會員快取失敗", e); }
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
async function showMemberDetail(memberId) {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");

    container.classList.add("active");
    updateOverlay();

    // 顯示載入中
    panel.innerHTML = '<div style="text-align:center;padding:40px;">載入中...</div>';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未找到授權 token');
        }

        // 從後端 API 獲取會員詳細資料
        const response = await fetch(`${API_BASE_URL}/user/${memberId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            window.location.href = '../aqui_B/aqui_main_B_member.html';
            alert('找不到該會員資料');
        }

        const result = await response.json();
        const member = result.data.user;

        if (!member) {
            throw new Error('找不到會員資料');
        }

        // 計算訂單統計
        const orderCount = member.orders ? member.orders.length : 0;
        const totalAmount = member.orders ? member.orders.reduce((sum, order) => sum + order.totalPrice, 0) : 0;

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
                <label><strong>註冊時間：</strong></label>
                <span>${new Date(member.createdAt).toLocaleString('zh-TW')}</span>
            </div>

            <div class="detail-item">
                <label><strong>訂單數量：</strong></label>
                <span>${orderCount}</span>
            </div>

            <div class="detail-item">
                <label><strong>總消費金額：</strong></label>
                <span>$${totalAmount.toLocaleString()}</span>
            </div>

            <div class="detail-item">
                <label><strong>會員狀態：</strong></label>
                <div style="margin-top:6px;display:flex;align-items:center;gap:10px;">
                    <label class="toggle-switch">
                        <input type="checkbox" id="memberStatusToggle-${member.id}" ${member.isAvailable ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            ${member.orders && member.orders.length > 0 ? `
            <div class="detail-item" style="margin-top: 20px;">
                <label><strong>訂單記錄：</strong></label>
                <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
                    ${member.orders.map(order => `
                        <div style="padding: 8px; border: 1px solid #ddd; margin-bottom: 8px; border-radius: 4px;">
                            <div>訂單 #${order.id} - ${order.statusName}</div>
                            <div style="font-size: 12px; color: #666;">
                                金額: $${order.totalPrice.toLocaleString()} | 
                                ${new Date(order.createdAt).toLocaleDateString('zh-TW')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

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
    } catch (error) {
        console.error('載入會員詳細資料失敗:', error);
        panel.innerHTML = `
            <div style="text-align:center;padding:40px;color:red;">
                載入失敗: ${error.message}
            </div>
            <button onclick="closeDetail()" style="
                width:100%;
                margin-top:20px;
                background: #6c757d;
                padding:10px 0;
                border-radius:6px;
                color:white;
                border:none;
                cursor:pointer;
                font-size: 16px;
            ">
                關閉
            </button>
        `;
    }
}

/* 保存會員修改 */
async function saveMemberChanges(memberId) {
    const name = document.getElementById(`memberName-${memberId}`).value.trim();
    const email = document.getElementById(`memberEmail-${memberId}`).value.trim();
    const status = document.getElementById(`memberStatusToggle-${memberId}`).checked;

    if (!name || !email) {
        alert('請填寫所有必填欄位');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未找到授權 token');
        }

        // 更新會員狀態 API
        const response = await fetch(`${API_BASE_URL}/user/update/${memberId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                isAvailable: status
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // 更新本地資料
        const memberIdx = memberData.findIndex(m => m.id === memberId);
        if (memberIdx !== -1) {
            memberData[memberIdx].name = name;
            memberData[memberIdx].email = email;
            memberData[memberIdx].status = status ? '正常' : '停用';
        }

        const allMemberIdx = allMembers.findIndex(m => m.id === memberId);
        if (allMemberIdx !== -1) {
            allMembers[allMemberIdx].name = name;
            allMembers[allMemberIdx].email = email;
            allMembers[allMemberIdx].status = status ? '正常' : '停用';
        }

        renderMembers();
        closeDetail();
        alert('會員資料已更新！');
    } catch (error) {
        console.error('保存會員資料失敗:', error);
        alert('保存失敗: ' + error.message);
    }
}

// 行內切換會員狀態（列表拉霸）
async function toggleMemberStatus(memberId, isActive) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('未找到授權 token');
        }

        const response = await fetch(`${API_BASE_URL}/user/register/${memberId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                isAvailable: isActive
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 更新本地資料
        const idx = allMembers.findIndex(m => m.id === memberId);
        if (idx !== -1) {
            allMembers[idx].status = isActive ? '正常' : '停用';
        }
        
        const curIdx = memberData.findIndex(m => m.id === memberId);
        if (curIdx !== -1) {
            memberData[curIdx].status = isActive ? '正常' : '停用';
        }

        renderMembers(memberData);
    } catch (error) {
        console.error('更新會員狀態失敗:', error);
        alert('更新狀態失敗: ' + error.message);
        // 重新載入以恢復狀態
        await loadMembers();
        renderMembers();
    }
}

/* 查詢會員 */
function searchMember() {
    const panel = document.getElementById("detail-content");
    const container = document.getElementById("detailPanel");
    container.classList.add("active");
    updateOverlay();
    panel.innerHTML = `
        <div class="detail-item">
            <label><strong>會員編號查詢：</strong></label>
            <input type="number" id="searchMemberId" class="detail-input" placeholder="輸入會員編號">
        </div>
        <button onclick="performSearch()" style="
            width:100%;margin-top:16px;background:#198754;padding:10px 0;border-radius:6px;color:#fff;border:none;cursor:pointer;font-size:16px;">
            查詢
        </button>
    `;
}

/* 執行查詢 */
async function performSearch() {
    const memberId = document.getElementById("searchMemberId").value.trim();

    // 如果輸入了會員編號，直接查詢該會員
    if (memberId) {
        try {
            closeDetail();
            await showMemberDetail(parseInt(memberId));
            return;
        } catch (error) {
            alert('查詢失敗: ' + error.message);
            return;
        }
    }

    // 否則按名稱篩選
    let filtered = allMembers;
    if (keyword) {
        filtered = filtered.filter(m => m.name.toLowerCase().includes(keyword));
    }
    memberData = filtered;
    renderMembers(filtered);
    closeDetail();
    if (filtered.length === 0) {
        alert('查無符合條件的會員');
    }
}

/* 重置搜尋 */
function resetSearch() {
    memberData = [...allMembers];
    renderMembers(memberData);
    closeDetail();
}

/* 初始化會員管理頁面 */
async function initMemberPage() {
    // 若未登入或非管理員，則不初始化會員資料（避免登出後仍呼叫 API）
    const token = localStorage.getItem('token');
    const isAdmin = !!(window.currentUser && (window.currentUser.role === "Admin" || window.currentUser.role === "0"));
    if (!token || !isAdmin) {
        console.warn('未登入或非管理員，略過載入會員資料');
        memberData = [...seedMembers];
        allMembers = [...memberData];
        renderMembers();
        return;
    }

    await loadMembers();
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
    initAuthUI(true);
    
    // 2. 初始化會員選單
    initUserMenu();
    
    // 3. 僅當確定為已登入的管理員時，再初始化會員管理頁面，避免登出後仍呼叫 API
    const isAdminNow = !!(window.currentUser && (window.currentUser.role === "Admin" || window.currentUser.role === "0"));
    if (isAdminNow) {
        initMemberPage();
    }
});
