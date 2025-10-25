# API 文档

欢迎使用史诗AI项目的API文档。本文档描述了所有可用的API接口、使用方法和最佳实践。

## 📋 目录

- [API概览](#api概览)
- [认证授权](#认证授权)
- [请求格式](#请求格式)
- [响应格式](#响应格式)
- [错误处理](#错误处理)
- [接口列表](#接口列表)
- [SDK和工具](#sdk和工具)
- [最佳实践](#最佳实践)

## 🌐 API概览

### 基本信息

- **Base URL**: `https://api.epic-ai.com/v1`
- **开发环境**: `http://localhost:3000/api/v1`
- **协议**: HTTPS (生产环境) / HTTP (开发环境)
- **数据格式**: JSON
- **字符编码**: UTF-8

### 核心功能模块

| 模块     | 描述                     | 端点前缀          |
| -------- | ------------------------ | ----------------- |
| 用户管理 | 用户注册、登录、资料管理 | `/auth`, `/users` |
| 职业分析 | 技能评估、职业推荐       | `/career`         |
| AI咨询   | 智能对话、职业建议       | `/ai`             |
| 数据统计 | 用户数据、分析报告       | `/analytics`      |
| 系统管理 | 健康检查、系统状态       | `/system`         |

## 🔐 认证授权

### 认证方式

史诗AI API使用JWT (JSON Web Token) 进行身份认证。

#### 1. 获取访问令牌

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "张三"
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIs...",
      "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
      "expires_in": 3600
    }
  }
}
```

#### 2. 使用访问令牌

在请求头中包含JWT令牌：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
```

#### 3. 令牌刷新

**POST** `/auth/refresh`

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 权限范围

| 权限            | 描述         | 适用接口           |
| --------------- | ------------ | ------------------ |
| `read:profile`  | 读取用户资料 | `/users/me`        |
| `write:profile` | 修改用户资料 | `/users/me`        |
| `read:career`   | 获取职业分析 | `/career/*`        |
| `write:career`  | 创建职业分析 | `/career/analysis` |
| `use:ai`        | 使用AI服务   | `/ai/*`            |

## 📤 请求格式

### HTTP方法

| 方法   | 描述     | 示例                     |
| ------ | -------- | ------------------------ |
| GET    | 获取资源 | `GET /users/me`          |
| POST   | 创建资源 | `POST /career/analysis`  |
| PUT    | 更新资源 | `PUT /users/me`          |
| PATCH  | 部分更新 | `PATCH /users/me`        |
| DELETE | 删除资源 | `DELETE /users/sessions` |

### 请求头

```http
Content-Type: application/json
Authorization: Bearer <token>
X-API-Version: v1
X-Request-ID: <unique-request-id>
```

### 查询参数

```http
GET /career/analysis?page=1&limit=20&sort=created_at
```

常用参数：

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `sort`: 排序字段
- `order`: 排序方向 (asc/desc)
- `fields`: 返回字段过滤

### 请求体

POST/PUT/PATCH请求使用JSON格式：

```json
{
  "field1": "value1",
  "field2": {
    "nested": "value2"
  },
  "array_field": ["item1", "item2"]
}
```

## 📥 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789",
    "version": "v1"
  }
}
```

### 分页响应

```json
{
  "success": true,
  "data": [
    // 数据项
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

## ❌ 错误处理

### 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数验证失败",
    "details": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789"
  }
}
```

### 常见错误码

| HTTP状态码 | 错误码              | 描述             |
| ---------- | ------------------- | ---------------- |
| 400        | VALIDATION_ERROR    | 请求参数验证失败 |
| 401        | UNAUTHORIZED        | 未授权访问       |
| 403        | FORBIDDEN           | 权限不足         |
| 404        | NOT_FOUND           | 资源不存在       |
| 429        | RATE_LIMIT_EXCEEDED | 请求频率超限     |
| 500        | INTERNAL_ERROR      | 服务器内部错误   |
| 503        | SERVICE_UNAVAILABLE | 服务暂时不可用   |

### API限流

- **用户级限流**: 每分钟100次请求
- **IP级限流**: 每分钟200次请求
- **AI服务限流**: 每分钟10次请求

限流响应头：

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

## 🔗 接口列表

### 用户管理

#### 用户注册

```http
POST /auth/register
```

#### 用户登录

```http
POST /auth/login
```

#### 获取用户信息

```http
GET /users/me
```

#### 更新用户信息

```http
PUT /users/me
```

### 职业分析

#### 创建职业分析

```http
POST /career/analysis
```

#### 获取分析历史

```http
GET /career/analysis/history
```

#### 获取职业推荐

```http
GET /career/recommendations
```

### AI咨询

#### 发送AI咨询

```http
POST /ai/consultation
```

#### 获取咨询历史

```http
GET /ai/consultation/history
```

#### AI技能评估

```http
POST /ai/skill-assessment
```

### 数据统计

#### 获取用户统计

```http
GET /analytics/user/stats
```

#### 获取使用报告

```http
GET /analytics/usage/reports
```

详细的接口文档请参考：

- [用户API](user.md)
- [职业分析API](career-analysis.md)
- [AI咨询API](ai-consultation.md)

## 🛠️ SDK和工具

### JavaScript/TypeScript SDK

```bash
npm install @epic-ai/sdk
# 或
pnpm add @epic-ai/sdk
```

```typescript
import { EpicAIClient } from '@epic-ai/sdk';

const client = new EpicAIClient({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'your-api-key',
});

// 获取用户信息
const user = await client.users.getMe();

// 创建职业分析
const analysis = await client.career.createAnalysis({
  skills: ['JavaScript', 'React'],
  experience: 2,
  goals: ['前端开发'],
});
```

### Postman集合

我们提供了完整的Postman集合，包含所有API接口的示例请求。

[下载Postman集合](./assets/epic-ai-api-postman-collection.json)

### OpenAPI规范

完整的OpenAPI 3.0规范文档：

[查看OpenAPI规范](./openapi.yaml)

## 💡 最佳实践

### 1. 错误处理

```typescript
try {
  const response = await api.career.createAnalysis(data);
  console.log('分析结果:', response.data);
} catch (error) {
  if (error.response?.status === 429) {
    // 处理限流
    console.log('请求过于频繁，请稍后再试');
  } else if (error.response?.status === 401) {
    // 处理认证失败
    console.log('需要重新登录');
  } else {
    console.error('API请求失败:', error.message);
  }
}
```

### 2. 请求重试

```typescript
import axios from 'axios';
import { retry } from 'axios-retry';

// 配置重试策略
retry(axios, {
  retries: 3,
  retryDelay: retryCount => retryCount * 1000,
  retryCondition: error => {
    return error.response?.status === 429 || error.response?.status >= 500;
  },
});
```

### 3. 缓存策略

```typescript
// 使用localStorage缓存API响应
function cacheApiResponse(key: string, data: any, ttl: number = 3600000) {
  const item = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getCachedResponse(key: string) {
  const item = JSON.parse(localStorage.getItem(key) || '{}');
  if (item.timestamp && Date.now() - item.timestamp < item.ttl) {
    return item.data;
  }
  return null;
}
```

### 4. 批量请求

```typescript
// 使用Promise.all处理并发请求
const [user, analysis, recommendations] = await Promise.all([
  api.users.getMe(),
  api.career.getLatestAnalysis(),
  api.career.getRecommendations(),
]);
```

## 📞 技术支持

如果您在使用API时遇到问题：

1. 查看[常见问题](../development/faq.md)
2. 检查[API状态页面](https://status.epic-ai.com)
3. 联系技术支持: api-support@epic-ai.com
4. 在GitHub上提交Issue

---

📖 **更多信息**: 查看我们的[开发者文档](../development/README.md)和[SDK文档](../sdk/README.md)。
