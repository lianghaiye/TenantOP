<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">租户列表</h2>
      <a-button type="primary" @click="$router.push('/tenants/create')">
        <PlusOutlined />
        新建租户
      </a-button>
    </div>

    <a-form layout="inline" class="filter-row" :model="filters">
      <a-form-item label="关键词">
        <a-input
          v-model:value="filters.keyword"
          allow-clear
          placeholder="名称 / 编码"
          style="width: 200px"
        />
      </a-form-item>
      <a-form-item label="状态">
        <a-select
          v-model:value="filters.status"
          allow-clear
          placeholder="全部"
          style="width: 140px"
          :options="statusOpts"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="reload">查询</a-button>
      </a-form-item>
    </a-form>

    <a-table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="filtered"
      :pagination="{ pageSize: 10 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="statusColor(record.status)">{{ statusLabel(record.status) }}</a-tag>
        </template>
        <template v-else-if="column.key === 'packages'">
          <a-space wrap :size="4">
            <a-tag v-for="pid in record.packageIds" :key="pid">{{ getPackageName(pid) }}</a-tag>
          </a-space>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="$router.push(`/tenants/${record.id}`)">详情</a>
            <a @click="enterTenant(record)">进入租户</a>
            <a-popconfirm
              :title="record.status === 'disabled' ? '确认启用该租户？' : '确认停用该租户？'"
              @confirm="toggleStatus(record)"
            >
              <a>{{ record.status === 'disabled' ? '启用' : '停用' }}</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { loadStore, saveStore, getPackageName } from '@/mock/data'
import { setContextTenantId } from '@/utils/auth'

const router = useRouter()
const tick = ref(0)
const filters = reactive({ keyword: '', status: undefined })

const statusOpts = [
  { value: 'trial', label: '试用' },
  { value: 'active', label: '正式' },
  { value: 'disabled', label: '停用' },
]

const columns = [
  { title: '租户编码', dataIndex: 'tenantCode', width: 110 },
  { title: '租户名称', dataIndex: 'name', width: 160 },
  { title: '状态', key: 'status', width: 90 },
  { title: '到期日', dataIndex: 'expireAt', width: 120 },
  { title: '产品包', key: 'packages' },
  { title: '管理员', dataIndex: 'adminUsername', width: 120 },
  { title: '操作', key: 'action', width: 200, fixed: 'right' },
]

const filtered = computed(() => {
  tick.value
  let list = loadStore().tenants
  const kw = filters.keyword.trim()
  if (kw) {
    list = list.filter(
      (t) => t.name.includes(kw) || t.tenantCode.toLowerCase().includes(kw.toLowerCase()),
    )
  }
  if (filters.status) list = list.filter((t) => t.status === filters.status)
  return list
})

function reload() {
  tick.value++
}

function statusLabel(s) {
  return { trial: '试用', active: '正式', disabled: '停用' }[s] || s
}

function statusColor(s) {
  return { trial: 'orange', active: 'green', disabled: 'default' }[s] || 'default'
}

function enterTenant(record) {
  if (record.status === 'disabled') {
    message.warning('租户已停用，无法进入')
    return
  }
  setContextTenantId(record.id)
  message.success(`已进入租户：${record.name}`)
  router.push('/ctx/org')
}

function toggleStatus(record) {
  const store = loadStore()
  const row = store.tenants.find((t) => t.id === record.id)
  if (!row) return
  row.status = row.status === 'disabled' ? 'active' : 'disabled'
  saveStore(store)
  message.success(row.status === 'disabled' ? '已停用' : '已启用')
  reload()
}
</script>
