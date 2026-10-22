<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">组织架构 · {{ tenantName }}</h2>
      <a-button type="primary" @click="openAdd()">新增节点</a-button>
    </div>

    <a-table
      row-key="id"
      size="middle"
      :columns="columns"
      :data-source="treeData"
      :pagination="false"
      default-expand-all-rows
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-space>
            <a @click="openAdd(record.id)">加子级</a>
            <a-popconfirm
              v-if="record.parentId"
              title="确认删除该节点？"
              @confirm="removeNode(record.id)"
            >
              <a class="danger">删除</a>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <a-modal v-model:open="modalOpen" title="新增组织节点" @ok="saveNode">
      <a-form layout="vertical">
        <a-form-item label="名称" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="类型">
          <a-select
            v-model:value="form.type"
            :options="[
              { value: '公司', label: '公司' },
              { value: '部门', label: '部门' },
              { value: '车间', label: '车间' },
              { value: '仓库', label: '仓库' },
            ]"
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
const form = reactive({ name: '', type: '部门', parentId: null })

const tenantName = computed(() => {
  tick.value
  return loadStore().tenants.find((t) => t.id === tenantId)?.name || ''
})

const flat = computed(() => {
  tick.value
  return loadStore().orgs[tenantId] || []
})

const treeData = computed(() => buildTree(flat.value))

const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '类型', dataIndex: 'type', width: 100 },
  { title: '操作', key: 'action', width: 160 },
]

function buildTree(list, parentId = null) {
  return list
    .filter((n) => n.parentId === parentId)
    .map((n) => {
      const children = buildTree(list, n.id)
      return children.length ? { ...n, children } : { ...n }
    })
}

function openAdd(parentId = null) {
  form.name = ''
  form.type = parentId ? '部门' : '公司'
  form.parentId = parentId
  modalOpen.value = true
}

function saveNode() {
  if (!form.name.trim()) {
    message.warning('请填写名称')
    return
  }
  const store = loadStore()
  if (!store.orgs[tenantId]) store.orgs[tenantId] = []
  store.orgs[tenantId].push({
    id: `d-${Date.now()}`,
    parentId: form.parentId,
    name: form.name.trim(),
    type: form.type,
  })
  saveStore(store)
  modalOpen.value = false
  message.success('已添加')
  tick.value++
}

function removeNode(id) {
  const store = loadStore()
  const list = store.orgs[tenantId] || []
  if (list.some((n) => n.parentId === id)) {
    message.warning('请先删除子节点')
    return
  }
  store.orgs[tenantId] = list.filter((n) => n.id !== id)
  saveStore(store)
  message.success('已删除')
  tick.value++
}
</script>

<style scoped>
.danger {
  color: #ff4d4f;
}
</style>
