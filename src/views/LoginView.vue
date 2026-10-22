<template>
  <div class="login-page">
    <div class="login-card">
      <h1>TenantOP</h1>
      <p class="sub">租户管理平台 · 运营 / 实施</p>
      <a-form layout="vertical" :model="form" @finish="onSubmit">
        <a-form-item label="账号" name="username" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="form.username" placeholder="admin / implementer" size="large" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password
            v-model:value="form.password"
            placeholder="任意密码（演示）"
            size="large"
          />
        </a-form-item>
        <a-button type="primary" html-type="submit" block size="large" :loading="loading">
          登录
        </a-button>
      </a-form>
      <p class="tip">演示：账号 admin 或 implementer，密码任意</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { login } from '@/utils/auth'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({ username: 'admin', password: '123456' })

function onSubmit() {
  loading.value = true
  try {
    login(form.username.trim())
    message.success('登录成功')
    router.replace(route.query.redirect || '/tenants')
  } finally {
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #e8f3ff 0%, #f5f6f8 45%, #f0f5ff 100%);
}

.login-card {
  width: 400px;
  padding: 32px 28px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8eef8;
  box-shadow: 0 8px 24px rgba(22, 119, 255, 0.08);

  h1 {
    margin: 0;
    font-size: 24px;
    color: #1677ff;
  }

  .sub {
    margin: 6px 0 24px;
    color: rgba(0, 0, 0, 0.45);
  }

  .tip {
    margin: 16px 0 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.35);
  }
}
</style>
