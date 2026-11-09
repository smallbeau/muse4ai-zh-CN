# Muse4AI 简体中文汉化 · 翻译规则

你负责把**一批英文 UI 文案**翻译成简体中文。这是 Muse4AI（Windows/Electron 桌面应用）的界面文案，最终用户是中文使用者。

## 输入
`E:/Project/muse4ai/desktop/work/batches/batch-NN.json`（NN 见你的任务）
JSON 数组：`[{ "i": 数字, "key": "越南语原文", "en": "英文文案" }, ...]`
- `key` 是越南语源码文本：**不要翻译、不要修改、不要写进输出**。
- `en` 是你要翻译的英文。

## 输出
`E:/Project/muse4ai/desktop/work/out/batch-NN.json`（NN 与输入一致）
必须是**合法 JSON 数组**，UTF-8，不带 markdown 代码围栏、不带注释、不带任何解释：
`[{ "i": 数字, "zh": "简体中文译文" }, ...]`
- `i` 与输入一一对应：数量相同、顺序相同、不增不减、不改数字。
- 每一条都必须有 `zh` 且为字符串，不能缺项。
- 字符串里的双引号、反斜杠按 JSON 规则转义（不要写出破坏 JSON 的字符）。

## 硬性格式规则（脚本会逐条自动校验，违反会返工）
1. **占位符**：`en` 里出现的每个花括号占位符**名字**必须原样保留在 `zh` 里，拼写完全一致，一个都不能丢、不能改名、不能新增。中文语序可以调整。
   - 普通占位符 `{name}`：原样保留，例如 `{retryAfterS}` 就在中文里写 `{retryAfterS}`。
   - 复数标记 `{name|词A|词B}`：中文没有单复数，**直接改写成普通占位符 `{name}` + 中文量词/词**即可，例如 `{retryAfterS|second|seconds}` → `{retryAfterS} 秒`，`{API_KEY_MAX_ACTIVE|key|keys}` → `{API_KEY_MAX_ACTIVE} 个`。
   - 关键：改写后 `{name}` 仍要在译文里出现；若原文里同一名字已同时有普通 `{name}` 和复数标记，**只保留一个 `{name}`**，别写两遍（否则界面会出现两个重复数字）。
   - 完整示例：`en = "{running} {running|job is|jobs are} still generating"` → `zh = "还有 {running} 个任务正在生成"`（**不要**写成 `"还有 {running} {running} 个任务"`）。
   - 完整示例：`en = "Too many requests — retry after {retryAfterS} {retryAfterS|second|seconds}"` → `zh = "请求过于频繁 — 请于 {retryAfterS} 秒后重试"`。
3. **反引号**包起来的标识符（例如 `reference_ids`、`/v1/references`）原样保留，包括反引号本身。
4. 保留所有标点和符号：长破折号 —、间隔点 ·、乘号 ×、小于等于号 ≤、版权号 ©、百分号、冒号、斜杠、连字符、句点；**不要用竖线 `|` 当普通标点**。保留反斜杠转义序列（如换行转义）原样，不要改成真实换行。
5. 完全由占位符组成的句子（如 `{kind} {width}×{height}`）原样保留，无需翻译。
6. `zh` 里不要出现越南语带调字母。

## 术语表（全批保持一致）
- Account(s) → 账户
- Settings → 设置
- Queue → 队列
- Library → 素材库
- Studio → 创作台
- Batches → 批量
- Guide → 使用指南
- Notifications → 通知
- Proxy → 代理
- API key / key → 密钥
- job → 任务
- port → 端口
- generate → 生成
- retry → 重试
- cancel → 取消
- save → 保存
- delete → 删除
- error → 错误
- warning → 警告
- download → 下载
- upload → 上传
- sign in / login → 登录
- sign out → 退出登录
- disk → 磁盘
- folder → 文件夹
- file → 文件
- image → 图片
- video → 视频
- reference image → 参考图
- quota → 配额
- agent → 智能体
- paused → 已暂停
- running → 运行中
- pending → 等待中

## 保留英文（不要翻译）
Muse、Muse4AI、Vibes、VibesAI、MCP、OAuth、API、REST、JSON、base64、MP4、MiB、KB、MB、GB、Cloudflare、Tailscale、Caddy、LAN、DNS、IP、URL、Host、Origin、CORS、OPTIONS、token、ID、Hỏi đáp、Windows、Inno、beta，以及接口路径（`/v1/...`）等技术标识符。

## 文风
简洁、地道的桌面软件中文 UI 文案；不要机翻腔、不要堆"请"、不要敬语、不要解释、不要给整句加引号；按钮和标签用短词。

## 示例
- `Not signed in` → `未登录`
- `Too many requests — retry after {retryAfterS} {retryAfterS|second|seconds}` → `请求过于频繁 — 请于 {retryAfterS} 秒后重试`（复数标记改写成单个 `{retryAfterS}` + 中文量词，禁止 `|`）
- `Maximum {API_KEY_MAX_ACTIVE} active {API_KEY_MAX_ACTIVE|key|keys} — revoke some old keys` → `最多 {API_KEY_MAX_ACTIVE} 个有效密钥 — 请撤销部分旧密钥`
- `{min}–{max} running {max|job|jobs}` → `{min}–{max} 个运行中的任务`（同一名字只出现一次）
- `Base64 images via MCP are limited to 8 MB — upload larger images via POST /v1/references` → `通过 MCP 发送的 base64 图片上限为 8 MB — 更大的图片请通过 POST /v1/references 上传`
- `` `reference_ids` cannot be used with other reference image fields `` → `` `reference_ids` 不能与其他参考图字段同时使用 ``
- `Only requests from private networks are accepted (LAN, Tailscale)` → `仅接受来自私有网络的请求（LAN、Tailscale）`

## 执行
用 read 工具读输入文件，用 write 工具把结果写到输出文件。完成后**只**回复一行：`done: <条数>`，不要输出译文内容、不要输出解释。
