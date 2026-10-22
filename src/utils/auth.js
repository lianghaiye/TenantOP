const TOKEN_KEY = 'tenantop_token'
const USER_KEY = 'tenantop_user'
const CTX_TENANT_KEY = 'tenantop_ctx_tenant'

export function isLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function login(username) {
  const user = {
    id: 'u-platform-1',
    username,
    name: username === 'admin' ? '平台超管' : '实施顾问',
    role: username === 'admin' ? 'super_admin' : 'implementer',
  }
  localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(CTX_TENANT_KEY)
}

export function getContextTenantId() {
  return localStorage.getItem(CTX_TENANT_KEY) || ''
}

export function setContextTenantId(tenantId) {
  if (!tenantId) localStorage.removeItem(CTX_TENANT_KEY)
  else localStorage.setItem(CTX_TENANT_KEY, tenantId)
}
