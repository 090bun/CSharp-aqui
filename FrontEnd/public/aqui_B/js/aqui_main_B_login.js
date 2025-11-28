document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');

    if (!loginBtn) return;

    loginBtn.addEventListener('click', async function() {
        const email = (document.getElementById('loginEmail') || {}).value || '';
        const pwd = (document.getElementById('loginPassword') || {}).value || '';

        if (!email || !pwd) {
            alert('請輸入 Email 與密碼');
            return;
        }

        try {
            const res = await fetch('http://localhost:5082/api/v1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Email: email, Password: pwd })
            });

            if (!res.ok) {
                alert('登入失敗，請檢查帳號密碼');
                return;
            }

            const data = await res.json();
            const token = data.token || data.Token;
            if (!token) {
                alert('伺服器未回傳 token');
                return;
            }

            localStorage.setItem('token', token);

            const payload = JSON.parse(atob(token.split('.')[1]));
            const tokenRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.Role || payload.role;

            if (tokenRole !== 'Admin' && tokenRole !== '0') {
                alert('非管理員帳號無法登入後台');
                localStorage.removeItem('token');
                return;
            }

            window.currentUser = { 
                id: payload.Id || payload.id,
                name: payload.Name || payload.name,
                email: payload.Email || payload.email,
                role: tokenRole
            };

            localStorage.setItem('adminData', JSON.stringify(window.currentUser));

            // 導向後台主畫面（菜單管理）
            window.location.href = 'aqui_main_B_menu.html';

        } catch (err) {
            console.error('login error', err);
            alert('登入發生錯誤，請稍後再試');
        }
    });
});
