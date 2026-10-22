<template>
  <a-layout class="main-layout">
    <a-layout-sider v-model:collapsed="collapsed" collapsible theme="light" width="220">
      <div class="logo">
        <span v-if="!collapsed">TenantOP</span>
        <span v-else>TO</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        :items="menuItems"
        @click="onMenuClick"
      />
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <div class="header-left">
          <template v-if="ctxTenant">
            <a-tag color="blue">租户上下文</a-tag>
            <span class="ctx-name">{{ ctxTenant.name }}</span>
            <a-button type="link" size="small" @click="exitCtx">退出租户</a-button>
          </template>
          <span v-else class="hint">平台运营 · 租户管理</span>
        </div>
        <div class="header-right">
          <span class="user-name">{{ user?.name || user?.username }}</span>
          <a-button type="link" @click="onLogout">退出登录</a-button>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  TeamOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from '@ant-design/icons-vue'
import { h } from 'vue'
import { getUser, logout, getContextTenantId, setContextTenantId } from '@/utils/auth'
import { loadStore } from '@/mock/data'

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)
const user = ref(getUser())
const storeTick = ref(0)

const ctxTenantId = computed(() => {
  storeTick.value
  return getContextTenantId()
})

const ctxTenant = computed(() => {
  const id = ctxTenantId.value
  if (!id) return null
  return loadStore().tenants.find((t) => t.id === id) || null
})

const selectedKeys = ref([route.path])

watch(
  () => route.path,
  (p) => {
    selectedKeys.value = [p.startsWith('/tenants') && p !== '/tenants/create' ? '/tenants' : p]
    if (p.startsWith('/tenants/') && p !== '/tenants/create') {
      selectedKeys.value = ['/tenants']
    }
  },
  { immediate: true },
)

const menuItems = computed(() => {
  const base = [
    {
      key: '/tenants',
      icon: () => h(TeamOutlined),
      label: '租户中心',
    },
    {
      key: '/packages',
      icon: () => h(AppstoreOutlined),
      label: '产品包',
    },
  ]
  if (!ctxTenant.value) return base
  return [
    ...base,
    { type: 'divider' },
    {
      key: '/ctx/org',
      icon: () => h(ApartmentOutlined),
      label: '组织架构',
    },
    {
      key: '/ctx/roles',
      icon: () => h(SafetyCertificateOutlined),
      label: '角色权限',
    },
    {
      key: '/ctx/users',
      icon: () => h(UserOutlined),
      label: '账号管理',
    },
  ]
})

function onMenuClick({ key }) {
  if (key.startsWith('/')) router.push(key)
}

function exitCtx() {
  setContextTenantId('')
  storeTick.value++
  router.push('/tenants')
}

function onLogout() {
  logout()
  router.replace('/login')
}

// 供子页面触发刷新上下文展示
watch(
  () => route.fullPath,
  () => {
    storeTick.value++
  },
)
</script>

<style lang="less" scoped>
.main-layout {
  min-height: 100%;
}

.logo {
  height: 48px;
  margin: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: #1677ff;
  background: linear-gradient(180deg, #f0f5ff 0%, #fff 100%);
  border: 1px solid #e8eef8;
  border-radius: 8px;
}

.header {
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 56px;
  line-height: 56px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ctx-name {
  font-weight: 600;
}

.hint,
.user-name {
  color: rgba(0, 0, 0, 0.65);
  font-size: 13px;
}

.content {
  margin: 16px;
  min-height: calc(100vh - 88px);
}
</style>
