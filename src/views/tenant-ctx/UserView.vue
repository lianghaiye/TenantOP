<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">账号管理 · {{ tenantName }}</h2>
      <a-button type="primary" @click="openCreate">新建账号</a-button>
    </div>

    <a-table row-key="id" size="middle" :columns="columns" :data-source="users" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'dept'">
          {{ deptName(record.deptId) }}
        </template>
        <template v-else-if="column.key === 'roles'">
          {{ roleNames(record.roleIds).join('、') || '—' }}
        </template>
        <template v-else-if="column.key === 'status'">
          <a-tag :color="record.status === 'active' ? 'green' : 'default'">
            {{ record.status === 'active' ? '启用' : '停用' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a @click="openEdit(record)">编辑</a>
            <a @click="toggle(record)">{{ record.status === 'active' ? '停用' : '启用' }}</a>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '编辑账号' : '新建账号'"
      @ok="save"
    >
      <a-form layout="vertical">
        <a-form-item label="账号" required>
          <a-input v-model:value="form.username" :disabled="!!editing" />
        </a-form-item>
        <a-form-item label="姓名" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="手机">
          <a-input v-model:value="form.phone" />
        </a-form-item>
        <a-form-item label="组织">
          <a-select
            v-model:value="form.deptId"
            allow-clear
            :options="deptOpts"
            placeholder="选择组织"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="form.roleIds"
            mode="multiple"
            :options="roleOpts"
            placeholder="选择角色"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getContextTenantId } from '@/utils/auth'
import { loadStore, saveStore } from '@/mock/data'

const tenantId = getContextTenantId()
const tick = ref(0)
const modalOpen = ref(false)
const editing = ref(null)
const form = reactive({
  username: '',
  name: '',
  phone: '',
  deptId: undefined,
  roleIds: [],
})

const tenantName = computed(() => {
  tick.value
  return loadStore().tenants.find((t) => t.id === tenantId)?.name || ''
})

const users = computed(() => {
  tick.value
  return loadStore().users[tenantId] || []
})

const deptOpts = computed(() => {
  tick.value
  return (loadStore().orgs[tenantId] || []).map((d) => ({ value: d.id, label: d.name }))
})

const roleOpts = computed(() => {
  tick.value
  return (loadStore().roles[tenantId] || []).map((r) => ({ value: r.id, label: r.name }))
})

const columns = [
  { title: '账号', dataIndex: 'username', width: 140 },
  { title: '姓名', dataIndex: 'name', width: 120 },
  { title: '手机', dataIndex: 'phone', width: 130 },
  { title: '组织', key: 'dept', width: 140 },
  { title: '角色', key: 'roles' },
  { title: '状态', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 140 },
]

function deptName(id) {
  return (loadStore().orgs[tenantId] || []).find((d) => d.id === id)?.name || '—'
}

function roleNames(ids = []) {
  const roles = loadStore().roles[tenantId] || []
  return ids.map((id) => roles.find((r) => r.id === id)?.name).filter(Boolean)
}

function openCreate() {
  editing.value = null
  Object.assign(form, { username: '', name: '', phone: '', deptId: undefined, roleIds: [] })
  modalOpen.value = true
}

function openEdit(record) {
  editing.value = record
  Object.assign(form, {
    username: record.username,
    name: record.name,
    phone: record.phone,
    deptId: record.deptId,
    roleIds: [...(record.roleIds || [])],
  })
  modalOpen.value = true
}

function save() {
  if (!form.username.trim() || !form.name.trim()) {
    message.warning('请填写账号与姓名')
    return
  }
  const store = loadStore()
  if (!store.users[tenantId]) store.users[tenantId] = []
  if (editing.value) {
    const row = store.users[tenantId].find((u) => u.id === editing.value.id)
    if (row) {
      row.name = form.name.trim()
      row.phone = form.phone
      row.deptId = form.deptId
      row.roleIds = [...form.roleIds]
    }
  } else {
    if (store.users[tenantId].some((u) => u.username === form.username.trim())) {
      message.error('账号已存在')
      return
    }
    store.users[tenantId].push({
      id: `u-${Date.now()}`,
      username: form.username.trim(),
      name: form.name.trim(),
      phone: form.phone,
      status: 'active',
      deptId: form.deptId,
      roleIds: [...form.roleIds],
    })
  }
  saveStore(store)
  modalOpen.value = false
  message.success('已保存')
  tick.value++
}

function toggle(record) {
  const store = loadStore()
  const row = store.users[tenantId].find((u) => u.id === record.id)
  if (!row) return
  row.status = row.status === 'active' ? 'disabled' : 'active'
  saveStore(store)
  message.success(row.status === 'active' ? '已启用' : '已停用')
  tick.value++
}
</script>
