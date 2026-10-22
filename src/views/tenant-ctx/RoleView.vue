<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">角色权限 · {{ tenantName }}</h2>
      <a-button type="primary" @click="openCreate">新建角色</a-button>
    </div>

    <a-alert
      type="warning"
      show-icon
      style="margin-bottom: 12px"
      message="租户管理员可调整角色菜单，但仅限本租户已购产品包范围内的菜单。"
    />

    <a-table row-key="id" size="middle" :columns="columns" :data-source="roles" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'menus'">
          <span>{{ (record.menuIds || []).length }} 项</span>
        </template>
        <template v-else-if="column.key === 'action'">
          <a @click="openEdit(record)">配置权限</a>
        </template>
      </template>
    </a-table>

    <a-modal
      v-model:open="modalOpen"
      :title="editing ? '配置角色权限' : '新建角色'"
      width="640px"
      @ok="save"
    >
      <a-form layout="vertical">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="form.name" :disabled="!!editing" />
        </a-form-item>
        <a-form-item label="角色编码" required>
          <a-input v-model:value="form.code" :disabled="!!editing" />
        </a-form-item>
        <a-form-item label="可授权菜单（已购范围内）">
          <a-checkbox-group v-model:value="form.menuIds" style="width: 100%">
            <a-row>
              <a-col v-for="m in allowedMenus" :key="m.id" :span="12" style="margin-bottom: 8px">
                <a-checkbox :value="m.id">{{ m.name }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getContextTenantId } from '@/utils/auth'
import {
  loadStore,
  saveStore,
  getTenantAllowedMenuIds,
  flattenMenus,
} from '@/mock/data'

const tenantId = getContextTenantId()
const tick = ref(0)
const modalOpen = ref(false)
const editing = ref(null)
const form = reactive({ name: '', code: '', menuIds: [] })

const tenant = computed(() => {
  tick.value
  return loadStore().tenants.find((t) => t.id === tenantId)
})

const tenantName = computed(() => tenant.value?.name || '')

const roles = computed(() => {
  tick.value
  return loadStore().roles[tenantId] || []
})

const allowedMenus = computed(() => {
  if (!tenant.value) return []
  const allow = new Set(getTenantAllowedMenuIds(tenant.value))
  return flattenMenus().filter((m) => allow.has(m.id))
})

const columns = [
  { title: '角色名称', dataIndex: 'name', width: 140 },
  { title: '编码', dataIndex: 'code', width: 120 },
  { title: '菜单数', key: 'menus', width: 100 },
  { title: '备注', dataIndex: 'remark' },
  { title: '操作', key: 'action', width: 120 },
]

function openCreate() {
  editing.value = null
  form.name = ''
  form.code = ''
  form.menuIds = []
  modalOpen.value = true
}

function openEdit(record) {
  editing.value = record
  form.name = record.name
  form.code = record.code
  const allow = new Set(allowedMenus.value.map((m) => m.id))
  form.menuIds = (record.menuIds || []).filter((id) => allow.has(id))
  modalOpen.value = true
}

function save() {
  if (!form.name.trim() || !form.code.trim()) {
    message.warning('请填写名称与编码')
    return
  }
  const allow = new Set(allowedMenus.value.map((m) => m.id))
  const menuIds = form.menuIds.filter((id) => allow.has(id))
  const store = loadStore()
  if (!store.roles[tenantId]) store.roles[tenantId] = []

  if (editing.value) {
    const row = store.roles[tenantId].find((r) => r.id === editing.value.id)
    if (row) row.menuIds = menuIds
  } else {
    if (store.roles[tenantId].some((r) => r.code === form.code.trim())) {
      message.error('角色编码已存在')
      return
    }
    store.roles[tenantId].push({
      id: `r-${Date.now()}`,
      name: form.name.trim(),
      code: form.code.trim(),
      menuIds,
      remark: '',
    })
  }
  saveStore(store)
  modalOpen.value = false
  message.success('已保存')
  tick.value++
}
</script>
