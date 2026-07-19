# 精确控制响应头移除规则的实现说明

## 背景
原始的 `rules.json` 文件对所有子框架（sub_frame）请求都移除 X-Frame-Options 和 Content-Security-Policy 头部，这可能导致不必要的性能开销和潜在的安全风险。

## 新的实现方案
我们重构了 `rules.json` 文件，使其更加精确地控制头部移除：

### 1. 分离规则
- 将 X-Frame-Options 和 Content-Security-Policy 头部的移除与其他头部分开
- 使用不同的优先级和条件

### 2. 限制作用域
- 使用 `requestDomains` 字段明确指定哪些域名需要移除这些头部
- 只对预定义的 AI 网站列表执行头部移除操作
- 保持 `resourceTypes` 为 `sub_frame`，仅影响嵌入的 iframe

### 3. 保持特殊处理
- 为 copilot.microsoft.com 保留了高优先级规则（ID 9, 21, 22）
- 继续使用更全面的头部移除规则来处理 Microsoft 服务的严格安全策略

## 具体变化

### 原始规则特点：
- 对所有子框架请求移除所有安全头部
- 没有域名限制

### 新规则特点：
- 仅对预定义的 AI 服务域名移除安全头部
- 将头部移除按类型分组到不同规则中
- 保持了对特殊网站（copilot.microsoft.com）的特殊处理

## 效果
- 仅在需要时移除 X-Frame-Options 和 Content-Security-Policy 头部
- 减少不必要的头部修改
- 保持对目标网站的功能完整性
- 提高扩展的安全性和性能

## 验证
要验证此更改，请确保 Edge 扩展仍能正常加载所有支持的 AI 网站，特别是 copilot.microsoft.com（虽然我们已添加特殊处理，但该网站仍会触发降级到新标签页的逻辑）。