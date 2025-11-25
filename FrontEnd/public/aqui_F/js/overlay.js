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
