# A2UI v0.9 Renderer

一个可直接作为 GitHub 仓库起步的 **A2UI v0.9 渲染器**项目模板。它支持：

- 基础树结构渲染（`renderToString`）
- A2UI 协议包渲染（`renderProtocolToString`）
- 协议解析（`parseProtocol`）
- 按钮事件上行构建（`buildEventPayload`，支持 `sendDataModel: true`）
- 一键部署到 GitHub（`scripts/one-click-deploy.sh`）

## 快速开始

```bash
npm install
npm test
```

## 支持的 v0.9 协议形态（与示例一致）

```json
{
  "version": "v0.9",
  "datas": [
    { "createSurface": { "surfaceId": "s_bill", "sendDataModel": true } },
    { "updateComponents": { "surfaceId": "s_bill", "components": [] } },
    { "updateDataModel": { "surfaceId": "s_bill", "path": "/", "value": {} } }
  ]
}
```

## 生活缴费示例（渲染 + 上行）

```js
import { renderProtocolToString, buildEventPayload } from 'a2ui-v0.9-renderer';
import fs from 'node:fs';

const billSample = JSON.parse(fs.readFileSync(new URL('./examples/basic.json', import.meta.url), 'utf-8'));

const html = renderProtocolToString(billSample);
console.log(html); // 渲染客户端结构

const uplink = buildEventPayload(billSample, 'footer-btn', { '账单类型': ['电费'] });
console.log(uplink);
/*
{
  event: {
    name: 'submit_clarification',
    context: {
      intent_code: 'queryBill',
      '账单类型': ['电费'],
      source_agent: 'mcp'
    }
  },
  dataModel: { '账单类型': ['电费'] },
  metadata: { surfaceId: 's_bill' }
}
*/
```

## 一键部署到 GitHub

前置条件：

- 已安装 `git` 与 `gh`（GitHub CLI）
- 已执行 `gh auth login`

部署命令：

```bash
# public 仓库
./scripts/one-click-deploy.sh your-org/a2ui-v0.9-renderer public

# private 仓库
./scripts/one-click-deploy.sh your-org/a2ui-v0.9-renderer private
```

或使用 npm script：

```bash
npm run deploy:github -- your-org/a2ui-v0.9-renderer public
```

该脚本会自动执行：测试、lint、必要提交、创建远程仓库、推送 `main`。

## 目录结构

```text
a2ui-v0.9-renderer/
├── .github/workflows/ci.yml
├── examples/basic.json
├── scripts/
│   └── one-click-deploy.sh
├── src/
│   ├── a2ui09.js
│   ├── index.js
│   ├── renderer.js
│   └── schema.js
├── test/renderer.test.js
├── .gitignore
├── LICENSE
└── package.json
```
