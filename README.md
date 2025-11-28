# Aqui - 餐廳點餐管理系統

一個使用 ASP.NET Core 9.0 和 MySQL 構建的全端餐廳點餐管理系統，提供前台點餐和後台管理功能。

## 功能特色

### 前台功能 (顧客端)
- 🍽️ 線上瀏覽菜單
- 🛒 購物車管理
- 📝 訂單建立與追蹤
- 👤 會員註冊與登入
- 📰 最新消息瀏覽

### 後台功能 (管理員)
- 📊 訂單管理與狀態追蹤
- 🍔 菜單品項管理 (新增/編輯/刪除)
- 🏷️ 分類管理
- 📢 最新消息發布
- 👥 會員管理
- 💰 營收報表

## 技術堆疊

### 後端
- **框架**: ASP.NET Core 9.0 Web API
- **資料庫**: MySQL 8.0
- **ORM**: Entity Framework Core 9.0
- **認證**: JWT Bearer Token
- **密碼加密**: BCrypt.Net

### 前端
- **基礎**: HTML5, CSS3, JavaScript (Vanilla)
- **架構**: SPA (Single Page Application)
- **樣式**: 自訂 CSS

### 主要套件
- `Pomelo.EntityFrameworkCore.MySql` - MySQL EF Core 提供者
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT 認證
- `BCrypt.Net-Next` - 密碼雜湊

## 專案結構

```
aqui/
├── aqui/                          # 後端 API 專案
│   ├── Controller/                # API 控制器
│   │   ├── CartController.cs      # 購物車
│   │   ├── CategoryController.cs  # 分類
│   │   ├── LoginController.cs     # 登入認證
│   │   ├── MenuController.cs      # 菜單
│   │   ├── NewsController.cs      # 最新消息
│   │   ├── OrderController.cs     # 訂單
│   │   └── UserController.cs      # 使用者
│   ├── Data/                      # 資料庫相關
│   │   ├── AquiContext.cs         # EF Core DbContext
│   │   └── SeedData.cs            # 種子資料
│   ├── Dtos/                      # 資料傳輸物件
│   ├── Models/                    # 資料模型
│   │   ├── Cart.cs
│   │   ├── Category.cs
│   │   ├── Menu.cs
│   │   ├── Order.cs
│   │   ├── User.cs
│   │   └── ...
│   ├── Services/                  # 業務邏輯服務
│   │   ├── JwtService.cs          # JWT 產生與驗證
│   │   ├── OrderService.cs        # 訂單服務
│   │   ├── PasswordHash.cs        # 密碼雜湊
│   │   └── Validator/             # 驗證器
│   ├── Migrations/                # 資料庫遷移檔
│   ├── wwwroot/                   # 靜態檔案 (上傳的圖片)
│   └── Program.cs                 # 應用程式入口
│
└── FrontEnd/                      # 前端專案
    ├── index.html                 # 首頁 (主要入口)
    ├── partials/                  # 頁面片段
    │   ├── aqui_F/                # 前台頁面
    │   └── aqui_B/                # 後台頁面
    └── public/                    # 公共資源
        ├── api_base.js            # API 基礎設定
        ├── aqui_index.js          # 首頁 JS
        ├── aqui_index.css         # 首頁樣式
        ├── aqui_F/                # 前台 JS/CSS
        ├── aqui_B/                # 後台 JS/CSS
        └── pictuer/               # 圖片資源
```

## 開始使用

### 環境需求

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [MySQL Server 8.0+](https://dev.mysql.com/downloads/)
- 任意現代瀏覽器 (Chrome, Firefox, Edge 等)

### 安裝步驟

1. **複製專案**
   ```bash
   git clone https://github.com/090bun/CSharp-aqui.git
   cd aqui
   ```

2. **設定資料庫連線**
   
   編輯 `aqui/appsettings.json` 或 `aqui/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "server=localhost;port=3306;database=aqui;user=your_user;password=your_password"
     },
     "Jwt": {
       "Key": "your-secret-key-at-least-32-characters-long",
       "Issuer": "aqui-api",
       "Audience": "aqui-client"
     }
   }
   ```

3. **還原套件**
   ```bash
   cd aqui
   dotnet restore
   ```

4. **執行資料庫遷移**
   ```bash
   dotnet ef database update
   ```
   
   或者直接執行應用程式，系統會自動執行遷移和種子資料。

5. **啟動後端 API**
   ```bash
   dotnet run
   ```
   
   預設會在 `https://localhost:5082` 啟動 (端口可能依據 `launchSettings.json` 有所不同)

6. **啟動前端**
   
   在瀏覽器中開啟 `FrontEnd/partials/aqui_index.html`
   
   或使用 Live Server 等工具啟動前端伺服器。

## API 端點

> 所有 API 端點基礎路徑為 `/api/v1`

### 認證
- `POST /api/v1/login` - 使用者登入

### 使用者管理
- `GET /api/v1/user` - 取得當前登入使用者資訊 🔐
- `GET /api/v1/user/all` - 取得所有會員列表 (可排序) 👑
- `GET /api/v1/user/{id}` - 取得指定使用者詳細資料 (含訂單) 👑
- `PATCH /api/v1/user` - 修改當前使用者資料 (名稱) 🔐
- `PATCH /api/v1/user/update/{id}` - 修改會員資料 (名稱、Email) 👑
- `PATCH /api/v1/user/password` - 修改密碼 🔐
- `PATCH /api/v1/user/register/{id}` - 用戶註銷/恢復 👑

### 菜單管理
- `GET /api/v1/menu/with-categories` - 取得上架菜單及其分類
- `GET /api/v1/menu/active-with-categories` - 取得所有菜單及其分類 (含下架) 👑
- `POST /api/v1/menu` - 新增菜單項目 (支援圖片上傳) 👑
- `PATCH /api/v1/menu` - 更新菜單項目 (支援圖片上傳) 👑
- `PATCH /api/v1/menu/close` - 批次關閉/開啟菜單 👑

### 分類管理
- `GET /api/v1/category` - 取得所有分類 👑
- `POST /api/v1/category` - 新增分類 (若已存在已刪除的分類會自動恢復) 👑
- `DELETE /api/v1/category/delete/{id}` - 軟刪除分類 👑

### 購物車
- `POST /api/v1/cart` - 新增品項到購物車 (支援批次) 🔐
- `POST /api/v1/cart/checkout` - 結帳 (建立訂單並清空購物車) 🔐

### 訂單管理
- `GET /api/v1/order` - 取得使用者訂單 (可依狀態、時間篩選) 🔐
- `GET /api/v1/order/all` - 取得所有訂單 (可依狀態、時間篩選) 👑
- `GET /api/v1/order/{orderGuid}` - 取得單一訂單詳情 🔐
- `GET /api/v1/order/sold` - 取得營收報表 (可依狀態、時間篩選) 👑
- `PATCH /api/v1/order` - 更新訂單狀態 (使用者僅能取消訂單) 🔐👑

### 最新消息
- `GET /api/v1/news` - 取得所有消息
- `GET /api/v1/news/{id}` - 取得單一消息 👑
- `POST /api/v1/news` - 新增消息 👑
- `PATCH /api/v1/news/{id}` - 更新消息 👑

---

**圖示說明:**
- 🔐 需要登入 (Admin 或 User)
- 👑 僅限管理員 (Admin)

**查詢參數說明:**
- **訂單查詢** 支援以下參數:
  - `status` - 訂單狀態篩選 (Pending/Processing/Completed/Cancelled 等)
  - `start` - 開始日期
  - `end` - 結束日期
  - `by` - 時間排序依據 (CreatedAt/PickupTime/UpdatedAt)
  
- **會員列表** 支援以下參數:
  - `sortBy` - 排序欄位 (id/status)
  - `order` - 排序方向 (asc/desc)

## 資料模型

### 主要實體

- **User** - 使用者資料 (包含管理員與一般使用者)
- **Category** - 菜單分類
- **Menu** - 菜單品項
- **Cart** - 購物車
- **CartItem** - 購物車品項
- **Order** - 訂單
- **OrderItem** - 訂單品項
- **News** - 最新消息

## 安全性

- 使用 JWT Bearer Token 進行身份驗證
- 密碼使用 BCrypt 加密存儲
- CORS 政策設定
- 管理員權限控制
- SQL Injection 防護 (透過 EF Core)

## 開發工具

### 資料庫遷移常用指令

```bash
# 新增遷移
dotnet ef migrations add MigrationName

# 套用遷移
dotnet ef database update

# 移除最後一次遷移
dotnet ef migrations remove

# 查看遷移歷史
dotnet ef migrations list
```

### 測試 API

可使用內建的 `aqui.http` 檔案進行 API 測試 (需要 REST Client 擴充功能)。

## 部署建議

### 生產環境設定

1. 更新 `appsettings.Production.json` 設定
2. 設定強固的 JWT 金鑰
3. 啟用 HTTPS
4. 設定資料庫備份策略
5. 檢查 CORS 政策

### 發佈應用程式

```bash
dotnet publish -c Release -o ./publish
```

## 授權

本專案採用 MIT 授權條款。

## 作者

[090bun](https://github.com/090bun)

## 版本歷史

- v1.0.0 (2025-11-28) - 初始版本發布

## 貢獻

歡迎提交 Issue 或 Pull Request！

## 聯絡方式

如有問題或建議，請透過 GitHub Issues 與我聯絡。
