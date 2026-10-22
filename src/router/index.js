import { createRouter, createWebHistory } from 'vue-router'
import { isLoggedIn, getContextTenantId } from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true, title: '登录' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/tenants',
    children: [
      {
        path: 'tenants',
        name: 'tenants',
        component: () => import('@/views/tenant/TenantListView.vue'),
        meta: { title: '租户列表' },
      },
      {
        path: 'tenants/create',
        name: 'tenant-create',
        component: () => import('@/views/tenant/TenantCreateView.vue'),
        meta: { title: '新建租户' },
      },
      {
        path: 'tenants/:id',
        name: 'tenant-detail',
        component: () => import('@/views/tenant/TenantDetailView.vue'),
        meta: { title: '租户详情' },
      },
      {
        path: 'packages',
        name: 'packages',
        component: () => import('@/views/package/PackageListView.vue'),
        meta: { title: '产品包' },
      },
      {
        path: 'ctx/org',
        name: 'ctx-org',
        component: () => import('@/views/tenant-ctx/OrgView.vue'),
        meta: { title: '组织架构', needTenantCtx: true },
      },
      {
        path: 'ctx/roles',
        name: 'ctx-roles',
        component: () => import('@/views/tenant-ctx/RoleView.vue'),
        meta: { title: '角色权限', needTenantCtx: true },
      },
      {
        path: 'ctx/users',
        name: 'ctx-users',
        component: () => import('@/views/tenant-ctx/UserView.vue'),
        meta: { title: '账号管理', needTenantCtx: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || 'TenantOP'} · 租户管理平台`
  if (to.meta.public) return true
  if (!isLoggedIn()) return { path: '/login', query: { redirect: to.fullPath } }
  if (to.meta.needTenantCtx && !getContextTenantId()) {
    return { path: '/tenants' }
  }
  return true
})

export default router
