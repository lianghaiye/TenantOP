# TenantOP · 租户管理平台

独立于业务系统（i-DOMS）的 SaaS **租户运营控制面**。

## 定位

| 系统 | 使用者 | 职责 |
|------|--------|------|
| **TenantOP**（本仓库） | 平台运营 / 实施 | 开户、产品包订阅、代管租户组织/角色/账号 |
| **i-DOMS** | 租户业务用户 | 销售/生产/库存等业务；按租户上下文鉴权 |

## 一期能力

- 租户列表：启用 / 停用、进入租户
- 开户向导：基本信息 → 产品包 → 管理员账号
- 产品包：定义可授权菜单范围
- 进入租户后：组织架构、角色权限、账号管理
- **安全规则**：角色可勾菜单 ⊆ 租户已购产品包菜单

> 当前为 **前端 Mock**（`localStorage`），便于独立演示；后续对接 Blade 系菜单/产品包/租户/角色 API。

## 技术栈

- Vue 3 + Vite
- Ant Design Vue 4
- Vue Router 4
- Axios / Day.js

与 i-DOMS 前端技术栈对齐，便于团队复用组件与规范。

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址（默认 `http://localhost:5180`）。

演示登录：

- 账号：`admin` 或 `implementer`
- 密码：任意

## 目录结构

```
src/
  layouts/          # 平台布局（含租户上下文）
  views/
    tenant/         # 租户中心
    package/        # 产品包
    tenant-ctx/     # 进入租户后：组织/角色/账号
  mock/             # 演示数据
  utils/auth.js     # 登录与租户上下文
```

## 与业务系统对接（后续）

1. 登录签发 token，携带 `tenantId`
2. 业务菜单 = 角色菜单 ∩ 租户产品包菜单
3. 租户 `disabled` / 过期 → 拒绝业务登录
4. 数据隔离：行级 `tenant_id`（与现网一致）

## 脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 本地开发 |
| `npm run build` | 生产构建 |
| `npm run preview` | 预览构建结果 |
