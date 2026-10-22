<template>
  <div class="page-card">
    <div class="page-header-row">
      <h2 class="page-title">新建租户</h2>
      <a-button @click="$router.back()">返回</a-button>
    </div>

    <a-steps :current="step" :items="stepItems" style="margin-bottom: 24px; max-width: 720px" />

    <a-form
      v-show="step === 0"
      ref="formRef"
      :model="form"
      :label-col="{ style: { width: '110px' } }"
      style="max-width: 640px"
    >
      <a-form-item label="租户编码" name="tenantCode" :rules="[{ required: true, message: '必填' }]">
        <a-input v-model:value="form.tenantCode" placeholder="如 ZB002" />
      </a-form-item>
      <a-form-item label="租户名称" name="name" :rules="[{ required: true, message: '必填' }]">
        <a-input v-model:value="form.name" placeholder="公司/工厂名称" />
      </a-form-item>
      <a-form-item label="类型" name="plan" :rules="[{ required: true }]">
        <a-radio-group v-model:value="form.plan">
          <a-radio-button value="试用">试用</a-radio-button>
          <a-radio-button value="正式">正式</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="到期日" name="expireAt" :rules="[{ required: true, message: '必填' }]">
        <a-date-picker v-model:value="form.expireAt" value-format="YYYY-MM-DD" style="width: 100%" />
      </a-form-item>
      <a-form-item label="联系人" name="contactName">
        <a-input v-model:value="form.contactName" />
      </a-form-item>
      <a-form-item label="联系电话" name="contactPhone">
        <a-input v-model:value="form.contactPhone" />
      </a-form-item>
    </a-form>

    <div v-show="step === 1" style="max-width: 640px">
      <a-alert
        type="info"
        show-icon
        style="margin-bottom: 12px"
        message="选择产品包后，租户管理员只能在已购菜单范围内配置角色权限"
      />
      <a-checkbox-group v-model:value="form.packageIds" style="width: 100%">
        <a-row :gutter="[12, 12]">
          <a-col v-for="pkg in packages" :key="pkg.id" :span="12">
            <a-card size="small" :title="pkg.name">
              <a-checkbox :value="pkg.id">{{ pkg.remark }}</a-checkbox>
            </a-card>
          </a-col>
        </a-row>
      </a-checkbox-group>
    </div>

    <a-form
      v-show="step === 2"
      :model="form"
      :label-col="{ style: { width: '110px' } }"
      style="max-width: 640px"
    >
      <a-form-item label="管理员账号" required>
        <a-input v-model:value="form.adminUsername" placeholder="租户管理员登录账号" />
      </a-form-item>
      <a-form-item label="初始密码" required>
        <a-input-password v-model:value="form.adminPassword" placeholder="建议首次登录后修改" />
      </a-form-item>
      <a-form-item label="管理员姓名">
        <a-input v-model:value="form.adminName" />
      </a-form-item>
    </a-form>

    <div style="margin-top: 24px">
      <a-space>
        <a-button v-if="step > 0" @click="step--">上一步</a-button>
        <a-button v-if="step < 2" type="primary" @click="next">下一步</a-button>
        <a-button v-else type="primary" :loading="saving" @click="submit">创建租户</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { listPackages, loadStore, saveStore, getTenantAllowedMenuIds } from '@/mock/data'

const router = useRouter()
const step = ref(0)
const saving = ref(false)
const formRef = ref()
const packages = listPackages()

const stepItems = [
  { title: '基本信息' },
  { title: '产品包' },
  { title: '管理员' },
]

const form = reactive({
  tenantCode: '',
  name: '',
  plan: '试用',
  expireAt: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  contactName: '',
  contactPhone: '',
  packageIds: ['pkg-core'],
  adminUsername: '',
  adminPassword: '123456',
  adminName: '',
})

async function next() {
  if (step.value === 0) {
    await formRef.value?.validate()
    step.value = 1
    return
  }
  if (step.value === 1) {
    if (!form.packageIds.length) {
      message.warning('请至少选择一个产品包')
      return
    }
    if (!form.packageIds.includes('pkg-core')) {
      form.packageIds = ['pkg-core', ...form.packageIds]
      message.info('已自动勾选基础包')
    }
    step.value = 2
  }
}

function submit() {
  if (!form.adminUsername.trim()) {
    message.warning('请填写管理员账号')
    return
  }
  saving.value = true
  try {
    const store = loadStore()
    if (store.tenants.some((t) => t.tenantCode === form.tenantCode.trim())) {
      message.error('租户编码已存在')
      return
    }
    const id = `t-${Date.now()}`
    const tenant = {
      id,
      tenantCode: form.tenantCode.trim(),
      name: form.name.trim(),
      status: form.plan === '正式' ? 'active' : 'trial',
      plan: form.plan,
      expireAt: form.expireAt,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      packageIds: [...form.packageIds],
      adminUsername: form.adminUsername.trim(),
      createdAt: dayjs().format('YYYY-MM-DD'),
    }
    store.tenants.unshift(tenant)
    store.orgs[id] = [
      { id: 'd1', parentId: null, name: tenant.name, type: '公司' },
    ]
    store.roles[id] = [
      {
        id: 'r-admin',
        name: '管理员',
        code: 'admin',
        menuIds: getTenantAllowedMenuIds(tenant),
        remark: '租户管理员（默认拥有已购全部菜单，可再调整）',
      },
    ]
    store.users[id] = [
      {
        id: 'u1',
        username: form.adminUsername.trim(),
        name: form.adminName.trim() || form.adminUsername.trim(),
        phone: form.contactPhone,
        status: 'active',
        deptId: 'd1',
        roleIds: ['r-admin'],
      },
    ]
    saveStore(store)
    message.success('租户创建成功')
    router.replace(`/tenants/${id}`)
  } finally {
    saving.value = false
  }
}
</script>
