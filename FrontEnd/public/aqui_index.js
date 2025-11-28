
document.addEventListener("DOMContentLoaded", function () {
    // 載入最新三筆新聞
    loadTop3News();

    // 購物車相關元素（可能不存在於首頁）
    const cartSidebar = document.getElementById("cartSidebar");
    const cartItemsContainer = document.getElementById("cartItems");
    const clearCartBtn = document.getElementById("clearCart");
    const checkoutBtn = document.getElementById("checkout");
    const cartTotalElement = document.getElementById("cartTotal");
    const cartToggleBtn = document.getElementById("cartToggleBtn");
    let cartAutoHideTimer = null; // 全域控制 timer
    let cart = [];
    
    // 如果購物車元素不存在，提前返回
    const hasCart = cartSidebar && cartItemsContainer && cartTotalElement;

    // 載入前三筆新聞的函數
    async function loadTop3News() {
        try {
            const response = await fetch(`${window.API_BASE_URL}/News`);
            if (!response.ok) {
                throw new Error('無法載入新聞');
            }
            
            const result = await response.json();
            const newsData = result.data || [];
            
            // 按建立時間排序並取前三筆
            const top3News = newsData
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3);
            
            // 更新輪播內容
            const carouselInner = document.getElementById('newsCarousel');
            if (top3News.length > 0) {
                carouselInner.innerHTML = top3News.map((news, index) => `
                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                        <p class="mb-0 news_item text-nowrap">
                            <a href="partials/aqui_F/aqui_main_F_news.html#${String(news.id).padStart(2, '0')}">${news.title}</a>
                        </p>
                    </div>
                `).join('');
            } else {
                carouselInner.innerHTML = `
                    <div class="carousel-item active">
                        <p class="mb-0 news_item text-nowrap">目前沒有最新消息</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('載入新聞失敗:', error);
            const carouselInner = document.getElementById('newsCarousel');
            carouselInner.innerHTML = `
                <div class="carousel-item active">
                    <p class="mb-0 news_item text-nowrap">載入失敗</p>
                </div>
            `;
        }
    }

    // 更新購物車畫面
    function renderCart() {
        if (!hasCart) return;
        
        cartItemsContainer.innerHTML = "";

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = "<p>尚未加入任何商品。</p>";
            cartTotalElement.textContent = "總金額：$0";
            cartSidebar.style.display = "block";
            return;
        }

        let total = 0;
        cart.forEach((item, index) => {
            total += item.price;

            const div = document.createElement("div");
            div.className = "cart-item mb-2";
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <span>${item.name}</span>
                    <div>
                        <span class="me-3">$${item.price}</span>
                        <button class="btn btn-sm btn-danger btn-remove-item" data-id="${item.id}">❌</button>
                    </div>
                </div>
                `;
            cartItemsContainer.appendChild(div);
        });

        cartTotalElement.textContent = `總金額：$${total}`;

        // 加入刪除功能
        document.querySelectorAll(".btn-remove-item").forEach(btn => {
            btn.addEventListener("click", function (event) {
                event.preventDefault(); // <--- 防止頁面跳轉
                const index = parseInt(this.dataset.index);
                cart.splice(index, 1);
                renderCart();
            });
        });
        

    }


    // // 監聽「加入購物車」按鈕
    // document.querySelectorAll(".add-to-cart").forEach(btn => {
        
    //     btn.addEventListener("click", function () {
    //         //開啟SM的購物車
    //         document.querySelector(".btn-sm-cart").style.display = "block";

    //         const name = this.dataset.name;
    //         const price = parseFloat(this.dataset.price);

    //         cart.push({ name, price });

    //         cartSidebar.style.display = "block";
    //         // 重新計時：小螢幕自動收起
    //         if (window.innerWidth < 768) {
    //             clearTimeout(cartAutoHideTimer);
    //             cartAutoHideTimer = setTimeout(() => {
    //                 cartSidebar.style.display = "none";
    //             }, 2000);
    //         }
    //         renderCart();
    //     });
    // });

    // 新增購物車開關按鈕功能
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener("click", function () {
            const isVisible = window.getComputedStyle(cartSidebar).display !== "none";
            cartSidebar.style.display = isVisible ? "none" : "block";


            // 若顯示後是小螢幕,再自動收起
            if (!isVisible && window.innerWidth < 768) {
                clearTimeout(cartAutoHideTimer);
                cartAutoHideTimer = setTimeout(() => {
                    cartSidebar.style.display = "none";
                }, 3000);
            }
        });
    }


    // 清空購物車
    // clearCartBtn.addEventListener("click", function () {
    //     cart = [];
    //     renderCart();
    // });

    // 前往結帳
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", async function () {
            if (cart.length === 0) {
                alert("購物車是空的！");
                return;
            }

            try {
                const response = await fetch('https://jsonplaceholder.typicode.com/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cart })
                });

                if (!response.ok) {
                    throw new Error("提交失敗");
                }

                // 成功導向結帳頁（你可以依實際情況改）
                window.location.href = "/checkout.html";
            } catch (error) {
                alert("發送結帳資料時發生錯誤：" + error.message);
            }
        });
    }

    // 點擊 body 關閉空的購物車
    if (hasCart) {
        let wasClickInsideCartOrButton = false;

        // 先記錄點擊是否在 cartSidebar 或 .add-to-cart 裡
        document.addEventListener("mousedown", function (e) {
            wasClickInsideCartOrButton =
                e.target.closest("#cartSidebar") || e.target.closest(".add-to-cart");
        });

        // 點擊結束後再處理是否關閉購物車
        document.addEventListener("click", function () {
            const isCartVisible = window.getComputedStyle(cartSidebar).display !== "none";
            const isCartEmpty = cart.length === 0;

            if (isCartVisible && isCartEmpty && !wasClickInsideCartOrButton) {
                cartSidebar.style.display = "none";
                //關閉SM的購物車
                const btnSmCart = document.querySelector(".btn-sm-cart");
                if (btnSmCart) {
                    btnSmCart.style.display = "none";
                }
            }

            // 重置記錄
            wasClickInsideCartOrButton = false;
        });
    }


});
