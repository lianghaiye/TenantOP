<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">产品包</h2>
    </div>
    <a-alert
      type="info"
      show-icon
      style="margin-bottom: 12px"
      message="产品包定义可授权菜单范围。一期演示为只读；正式环境由平台租户维护菜单字典后组包。"
    />
    <a-table row-key="id" size="middle" :columns="columns" :data-source="list" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'menus'">
          <a-space wrap :size="4">
            <a-tag v-for="mid in record.menuIds" :key="mid">{{ menuName(mid) }}</a-tag>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { listPackages, flattenMenus } from '@/mock/data'

const list = listPackages()
const menuMap = Object.fromEntries(flattenMenus().map((m) => [m.id, m.name]))

const columns = [
  { title: '产品包', dataIndex: 'name', width: 160 },
  { title: '说明', dataIndex: 'remark', width: 280 },
  { title: '包含菜单', key: 'menus' },
]

function menuName(id) {
  return menuMap[id] || id
}
</script>
