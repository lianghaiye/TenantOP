/** 演示数据：一期前端可独立跑通，后续替换为真实 API */

export const PACKAGES = [
  {
    id: 'pkg-core',
    name: '基础包',
    remark: '登录、首页、基础配置、组织权限',
    menuIds: ['m-home', 'm-basic', 'm-system'],
  },
  {
    id: 'pkg-inv',
    name: '库存管理包',
    remark: '入库/出库/盘点/调拨',
    menuIds: ['m-inv', 'm-inv-in', 'm-inv-out', 'm-inv-stocktake', 'm-inv-transfer'],
  },
  {
    id: 'pkg-pur',
    name: '采购外协包',
    remark: '采购订单、外协订单、收货质检',
    menuIds: ['m-pur', 'm-outsource'],
  },
  {
    id: 'pkg-ai',
    name: '泵小智包',
    remark: 'MES 智能助手 AGENT',
    menuIds: ['m-ai'],
  },
]

/** 平台菜单字典（简化） */
export const MENU_TREE = [
  { id: 'm-home', name: '首页工作台', children: [] },
  { id: 'm-basic', name: '基础配置', children: [] },
  { id: 'm-system', name: '系统管理', children: [] },
  {
    id: 'm-inv',
    name: '库存管理',
    children: [
      { id: 'm-inv-in', name: '入库管理' },
      { id: 'm-inv-out', name: '出库管理' },
      { id: 'm-inv-stocktake', name: '盘点管理' },
      { id: 'm-inv-transfer', name: '调拨管理' },
    ],
  },
  { id: 'm-pur', name: '采购管理', children: [] },
  { id: 'm-outsource', name: '外协管理', children: [] },
  { id: 'm-ai', name: '泵小智', children: [] },
]

const STORAGE_KEY = 'tenantop_store_v1'

function defaultStore() {
  return {
    tenants: [
      {
        id: 't-zb',
        tenantCode: 'ZB001',
        name: '淄博泵业',
        status: 'active',
        plan: '正式',
        expireAt: '2027-12-31',
        contactName: '张工',
        contactPhone: '13800001111',
        packageIds: ['pkg-core', 'pkg-inv', 'pkg-pur'],
        adminUsername: 'zb_admin',
        createdAt: '2026-09-01',
      },
      {
        id: 't-demo',
        tenantCode: 'DEMO',
        name: '演示工厂',
        status: 'trial',
        plan: '试用',
        expireAt: '2026-11-30',
        contactName: '李工',
        contactPhone: '13900002222',
        packageIds: ['pkg-core', 'pkg-inv', 'pkg-ai'],
        adminUsername: 'demo_admin',
        createdAt: '2026-10-01',
      },
    ],
    orgs: {
      't-zb': [
        { id: 'd1', parentId: null, name: '淄博泵业', type: '公司' },
        { id: 'd2', parentId: 'd1', name: '生产部', type: '部门' },
        { id: 'd3', parentId: 'd1', name: '仓储部', type: '部门' },
        { id: 'd4', parentId: 'd2', name: '机加工车间', type: '车间' },
      ],
      't-demo': [
        { id: 'd1', parentId: null, name: '演示工厂', type: '公司' },
        { id: 'd2', parentId: 'd1', name: '计划部', type: '部门' },
      ],
    },
    roles: {
      't-zb': [
        {
          id: 'r-admin',
          name: '管理员',
          code: 'admin',
          menuIds: ['m-home', 'm-basic', 'm-system', 'm-inv', 'm-inv-in', 'm-inv-out', 'm-pur'],
          remark: '租户管理员',
        },
        {
          id: 'r-wh',
          name: '仓管',
          code: 'warehouse',
          menuIds: ['m-home', 'm-inv', 'm-inv-in', 'm-inv-out', 'm-inv-stocktake'],
          remark: '仓库作业',
        },
      ],
      't-demo': [
        {
          id: 'r-admin',
          name: '管理员',
          code: 'admin',
          menuIds: ['m-home', 'm-basic', 'm-system', 'm-inv', 'm-ai'],
          remark: '租户管理员',
        },
      ],
    },
    users: {
      't-zb': [
        {
          id: 'u1',
          username: 'zb_admin',
          name: '张管理',
          phone: '13800001111',
          status: 'active',
          deptId: 'd1',
          roleIds: ['r-admin'],
        },
        {
          id: 'u2',
          username: 'cangguan01',
          name: '王仓管',
          phone: '13800003333',
          status: 'active',
          deptId: 'd3',
          roleIds: ['r-wh'],
        },
      ],
      't-demo': [
        {
          id: 'u1',
          username: 'demo_admin',
          name: '演示管理员',
          phone: '13900002222',
          status: 'active',
          deptId: 'd1',
          roleIds: ['r-admin'],
        },
      ],
    },
  }
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  const store = defaultStore()
  saveStore(store)
  return store
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function listPackages() {
  return PACKAGES.map((p) => ({ ...p }))
}

export function getPackageName(id) {
  return PACKAGES.find((p) => p.id === id)?.name || id
}

/** 租户已购产品包下可授权的菜单 ID 集合 */
export function getTenantAllowedMenuIds(tenant) {
  const set = new Set()
  for (const pid of tenant.packageIds || []) {
    const pkg = PACKAGES.find((p) => p.id === pid)
    ;(pkg?.menuIds || []).forEach((id) => set.add(id))
  }
  return [...set]
}

export function flattenMenus(nodes = MENU_TREE, acc = []) {
  for (const n of nodes) {
    acc.push({ id: n.id, name: n.name })
    if (n.children?.length) flattenMenus(n.children, acc)
  }
  return acc
}
