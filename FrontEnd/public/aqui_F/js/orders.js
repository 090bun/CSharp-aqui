window.orders = [
    {
        id: "A0001",
        created: "2025-01-23 11:30",
        total: 180,
        status: "pending",
        items: [
            { name: "雞腿飯", qty: 1, price: 120 },
            { name: "滷蛋", qty: 2, price: 30 }
        ]
    },
    {
        id: "A0002",
        created: "2025-01-23 11:55",
        total: 90,
        status: "confirmed",
        items: [
            { name: "滷肉飯", qty: 1, price: 60 },
            { name: "大冰紅", qty: 1, price: 30 }
        ]
    }
];

window.STATUS_LABEL = {
    pending:  "待確認",
    confirmed:"已確認",
    ready:    "可取餐",
    cancel:   "取消"
};
window.STATUS_CLASS = {
    pending: "bg-pending",
    confirmed:"bg-confirm",
    ready: "bg-ready",
    cancel: "bg-fail"
};

function renderOrders() {
    const wrap = document.getElementById("order-table");
    wrap.innerHTML = "";

    window.orders.forEach(order => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="order-id">${order.id}</td>
            <td class="order-id">${order.created}</td>
            <td class="order-id">${order.total} 元</td>
            <td class="order-id">
                <span class="badge ${window.STATUS_CLASS[order.status]}">
                    ${window.STATUS_LABEL[order.status]}
                </span>
            </td>
            <td class="order-id">
                <button type="button" onclick="event.stopPropagation(); showDetail('${order.id}')">查看</button>
            </td>
        `;
        wrap.appendChild(tr);
    });
}

function initOrderPage() {
    document.querySelector(".main").addEventListener("click", function (e) {
        if (e.target.classList.contains("main")) {
            closeDetail();
        }
    });

    document.getElementById("overlay").addEventListener("click", closeDetail);
}
