---
title: Magic Code Group
date: 2026-01-22
tags: [ VitePress, Component, Code Group ]
---

<script setup>
import CheckBox from '@theme/components/elements/CheckBox.vue'
</script>

# Magic Code Group

## 简介

Magic Code Group 是一个为 VitePress 博客定制的代码展示组件，它结合了代码分组和动画过渡效果，提供了优雅的代码展示体验。

## 核心功能

### 1. 自定义容器语法

通过 `markdown-it-container` 插件，扩展了 Markdown 语法，支持 `:::magic-code-group` 容器：

````markdown
:::magic-code-group

```ts [main.ts]
console.log('Hello World')
```

```js [utils.js]
function add(a, b) {
  return a + b
}
```
:::
````

### 2. 配置解析（config.mts）

在 [config.mts](https://github.com/Gu-ZT/gu-zt.github.io/docs/.vitepress/config.mts) 中实现了自定义容器的解析逻辑：

#### 代码块信息提取

- **语言识别**：从 fence info 中提取语言类型（如 `ts`、`js`）
- **文件名解析**：支持 `[filename]` 语法指定标签页名称
- **行号配置**：
  - `:line-numbers` - 显示行号
  - `:no-line-numbers` - 隐藏行号
  - `:line-numbers=10` - 从指定行号开始

#### 数据编码

解析后的代码块数据会被：
1. 序列化为 JSON
2. 转换为十六进制字符串
3. 作为 `files-data` 属性传递给组件

```typescript
const jsonStr = JSON.stringify(codeBlocks)
const base64Data = Buffer.from(jsonStr).toString('hex')
return `<MagicCodeGroup files-data="${base64Data}">`
```

### 3. Vue 组件实现（MagicCodeGroup.vue）

[MagicCodeGroup.vue](https://github.com/Gu-ZT/gu-zt.github.io/docs/.vitepress/theme/components/MagicCodeGroup.vue) 组件负责渲染和交互：

#### 核心特性

**数据解码**
```javascript
function decodeHex(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return new TextDecoder('utf-8').decode(bytes)
}
```

**动画高亮**
- 使用 `shiki` 进行语法高亮
- 使用 `shiki-magic-move` 实现切换动画
- 支持亮色/暗色主题自动切换

**行号显示**
- 支持自定义起始行号
- 左侧固定位置显示
- 与代码内容对齐

**交互功能**
- Tab 切换不同文件
- 一键复制代码
- 复制成功提示动画

#### 样式设计

- 遵循 VitePress 原生代码块样式
- 支持深色/浅色主题
- 复制按钮悬浮显示
- 流畅的过渡动画（600ms）

## 技术栈

- **markdown-it-container** - Markdown 容器扩展
- **Shiki** - 语法高亮引擎
- **shiki-magic-move** - 代码切换动画
- **Vue 3** - 组件框架
- **VitePress** - 文档框架

## 使用示例

### 基础用法

````markdown
:::magic-code-group

```typescript [config.ts]
export default {
  title: 'My App',
  version: '1.0.0'
}
```

```javascript [index.js]
import config from './config'

console.log(config.title)
```

:::
````

:::magic-code-group

```typescript [config.ts]
export default {
  title: 'My App',
  version: '1.0.0'
}
```

```javascript [index.js]
import config from './config'

console.log(config.title)
```

:::

````markdown
:::code-group

```typescript [config.ts]
export default {
  title: 'My App',
  version: '1.0.0'
}
```

```javascript [index.js]
import config from './config'

console.log(config.title)
```

:::
````

:::code-group

```typescript [config.ts]
export default {
  title: 'My App',
  version: '1.0.0'
}
```

```javascript [index.js]
import config from './config'

console.log(config.title)
```

:::

### 带行号

````markdown
:::magic-code-group

```ts:line-numbers=10 [utils.ts]
function calculate(x: number, y: number) {
  return x + y
}
```

```js:no-line-numbers [simple.js]
console.log('No line numbers')
```

:::
````

:::magic-code-group

```ts:line-numbers=10 [utils.ts]
function calculate(x: number, y: number) {
  return x + y
}
```

```js:no-line-numbers [simple.js]
console.log('No line numbers')
```

:::

````markdown
:::code-group

```ts:line-numbers=10 [utils.ts]
function calculate(x: number, y: number) {
  return x + y
}
```

```js:no-line-numbers [simple.js]
console.log('No line numbers')
```

:::
````

:::code-group

```ts:line-numbers=10 [utils.ts]
function calculate(x: number, y: number) {
  return x + y
}
```

```js:no-line-numbers [simple.js]
console.log('No line numbers')
```

:::

## 实现亮点

1. **无缝集成**：完全遵循 VitePress 原生代码块样式规范
2. **性能优化**：按需加载高亮器，仅初始化使用到的语言
3. **用户体验**：平滑的动画过渡，直观的交互反馈
4. **灵活配置**：支持行号、主题、语言等多维度定制
5. **数据安全**：采用十六进制编码避免特殊字符干扰

## 工作流程

```mermaid
graph LR
    A[Markdown 文件] --> B[markdown-it 解析]
    B --> C[提取代码块信息]
    C --> D[JSON 序列化]
    D --> E[十六进制编码]
    E --> F[MagicCodeGroup 组件]
    F --> G[解码数据]
    G --> H[Shiki 高亮]
    H --> I[渲染展示]
    I --> J[用户交互]
```

## 待实现

### <CheckBox/> 在代码块中实现行高亮
:::code-group
```js{4}
export default {
  data () {
    return {
      msg: 'Highlighted!'
    }
  }
}
```
:::
### <CheckBox/> 代码块中聚焦
:::code-group
```js
export default {
  data () {
    return {
      msg: 'Focused!' // [!code focus]
    }
  }
}
```
:::
### <CheckBox/> 代码块中的颜色差异
:::code-group
```js
export default {
  data () {
    return {
      msg: 'Removed' // [!code --]
      msg: 'Added' // [!code ++]
    }
  }
}
```
:::
### <CheckBox/> 高亮“错误”和“警告”
:::code-group
```js
export default {
  data () {
    return {
      msg: 'Error', // [!code error]
      msg: 'Warning' // [!code warning]
    }
  }
}
```
:::

## 总结

Magic Code Group 通过自定义 Markdown 容器和 Vue 组件的配合，实现了一个功能丰富、体验优雅的代码展示解决方案。它不仅保留了 VitePress
原生代码块的所有优点，还增加了多文件切换和动画效果，特别适合展示多个相关代码文件或代码演进过程。
