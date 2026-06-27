---
name: api-crud-generator
description: 根据 Prisma 模型生成标准的 Next.js API Route + 前端管理页面
trigger:["生成CRUD","生成接口","生成管理页面"]
---

# API CRUD 生成器

## 功能说明
根据指定的 Prisma 模型，自动生成标准的管理后台 CRUD 代码:
1.API Routes (5个)：GET列表、GET详情、POST创建、PUT更新、DELETE删除
2.前端页面：数据列表页、创建/编辑表单

## 执行步骤

### 第1步：确认模型信息
询问用户:
- 要生成的模型名称（如Product、Category）
- API 路径（如 /api/admin/products）
- 页面路由（如 /admin/products）

### 第2步：生成 API Routes Handlers
按照标准模板生成以下文件：
1.`route.ts`： - GET列表、GET详情+ POST创建
2.`[id]/route.ts`： - GET 详情 +PUT更新 + DELETE删除

### 第3步：生成前端管理页面
生成一个包含以下功能的管理页面:
- 数据表格（列出所有字段）
- ”新增“按钮 + 表单
- 每行的”编辑“和”删除“按钮
- TailwindCSS样式

### 第4步:确认并验证
 - 列出所有生成的文件
 - 提醒用户执行 npx prisma generate （如果模型有变更）
 - 给出测试方法

## 使用示例
```plaintext
生成CRUD
```

## 注意事项
- 所有UI文案使用中文
- 使用 Next.js API Router 的 params 语法
- 创建和更新前做验证
- 密码字段永远不通过API返回