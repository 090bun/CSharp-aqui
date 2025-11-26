function updateOverlay() {
    const overlay = document.getElementById("overlay");
    if (!overlay) return;

    const detailPanel = document.getElementById("detailPanel");
    const userMenu = document.getElementById("userMenu");

    const panelOpen = detailPanel ? detailPanel.classList.contains("active") : false;
    const menuOpen = userMenu ? userMenu.classList.contains("active") : false;

    if (panelOpen || menuOpen) {
        overlay.classList.add("active");
    } else {
        overlay.classList.remove("active");
    }
}

// 點擊 overlay 關閉所有面板
document.addEventListener("DOMContentLoaded", function() {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", function() {
            closeDetail();
        });
    }
});
