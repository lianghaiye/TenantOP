<template>
  <div class="page-card" v-if="tenant">
    <div class="page-header-row">
      <h2 class="page-title">{{ tenant.name }}</h2>
      <a-space>
        <a-button type="primary" @click="enter">进入租户</a-button>
        <a-button @click="$router.push('/tenants')">返回列表</a-button>
      </a-space>
    </div>

    <a-descriptions bordered size="small" :column="2">
      <a-descriptions-item label="租户编码">{{ tenant.tenantCode }}</a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag :color="statusColor(tenant.status)">{{ statusLabel(tenant.status) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="类型">{{ tenant.plan }}</a-descriptions-item>
      <a-descriptions-item label="到期日">{{ tenant.expireAt }}</a-descriptions-item>
      <a-descriptions-item label="联系人">{{ tenant.contactName || '—' }}</a-descriptions-item>
      <a-descriptions-item label="联系电话">{{ tenant.contactPhone || '—' }}</a-descriptions-item>
      <a-descriptions-item label="管理员账号">{{ tenant.adminUsername }}</a-descriptions-item>
      <a-descriptions-item label="创建日期">{{ tenant.createdAt }}</a-descriptions-item>
      <a-descriptions-item label="产品包" :span="2">
        <a-space wrap>
          <a-tag v-for="pid in tenant.packageIds" :key="pid" color="blue">{{
            getPackageName(pid)
          }}</a-tag>
        </a-space>
      </a-descriptions-item>
    </a-descriptions>

    <a-divider />
    <h3 class="section-title">订阅产品包</h3>
    <a-checkbox-group v-model:value="editingPackages" style="width: 100%">
      <a-row :gutter="[12, 12]">
        <a-col v-for="pkg in packages" :key="pkg.id" :span="8">
          <a-checkbox :value="pkg.id" :disabled="pkg.id === 'pkg-core'">
            {{ pkg.name }}
          </a-checkbox>
        </a-col>
      </a-row>
    </a-checkbox-group>
    <div style="margin-top: 12px">
      <a-button type="primary" @click="savePackages">保存订阅</a-button>
    </div>
  </div>
  <a-empty v-else description="租户不存在" />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { loadStore, saveStore, listPackages, getPackageName } from '@/mock/data'
import { setContextTenantId } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const packages = listPackages()
const tick = ref(0)
const editingPackages = ref([])

const tenant = computed(() => {
  tick.value
  return loadStore().tenants.find((t) => t.id === route.params.id)
})

watch(
  tenant,
  (t) => {
    editingPackages.value = t ? [...(t.packageIds || [])] : []
  },
  { immediate: true },
)

function statusLabel(s) {
  return { trial: '试用', active: '正式', disabled: '停用' }[s] || s
}
function statusColor(s) {
  return { trial: 'orange', active: 'green', disabled: 'default' }[s] || 'default'
}

function enter() {
  if (!tenant.value) return
  if (tenant.value.status === 'disabled') {
    message.warning('租户已停用')
    return
  }
  setContextTenantId(tenant.value.id)
  router.push('/ctx/org')
}

function savePackages() {
  const store = loadStore()
  const row = store.tenants.find((t) => t.id === route.params.id)
  if (!row) return
  const ids = [...editingPackages.value]
  if (!ids.includes('pkg-core')) ids.unshift('pkg-core')
  row.packageIds = ids
  saveStore(store)
  message.success('订阅已更新（角色可勾选菜单将受产品包范围限制）')
  tick.value++
}
</script>

<style scoped>
.section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}
</style>
