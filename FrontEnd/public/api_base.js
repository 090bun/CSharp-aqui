// API 基礎路徑 - 全站使用 `window.API_BASE_URL`
// 使用方式範例：
//   fetch(`${window.API_BASE_URL}/menus`)
// 或：
//   fetch(window.api.getUrl('/menus'))

window.API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:5082';

window.api = {
  baseUrl: window.API_BASE_URL,
  getUrl(path) {
    if (!path) return this.baseUrl;
    if (!path.startsWith('/')) path = '/' + path;
    return `${this.baseUrl}${path}`;
  }
};
