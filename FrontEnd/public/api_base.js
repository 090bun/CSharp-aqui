// API 基礎路徑 - 全站使用 `window.API_BASE_URL`
// 使用方式範例：
//   fetch(`${window.API_BASE_URL}/menus`)
// 或：
//   fetch(window.api.getUrl('/menus'))

// 自動依據環境切換 API 路徑
window.API_BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:5082"
    : "https://csharp-aqui-production.up.railway.app/api/v1";

window.API_IMG_BASE =
  location.hostname === "localhost"
    ? "http://localhost:5082"
    : "https://csharp-aqui-production.up.railway.app";
// API 工具
window.api = {
  baseUrl: window.API_BASE_URL,
  getUrl(path) {
    if (!path) return this.baseUrl;
    if (!path.startsWith('/')) path = '/' + path;
    return `${this.baseUrl}${path}`;
  }
};

