. 项目愿景
[项目概览](./README.md)
打造一个符合极简美学逻辑的、工业级稳健的 cURL 批处理 CLI 工具。
2. 核心功能逻辑
•	解析层：必须支持多行 cURL、各种 Body 类型（raw, binary, urlencode）以及完整的 Header 解析。统一使用 curlconverter 作为核心解析引擎。
•	执行层：使用 Node.js 异步模型处理请求，即使遇到 4xx/5xx 错误也必须完整记录响应，确保排查链路闭环。
•	归档层：输出文件必须严格包含“请求镜像”与“响应结果”两个完整部分。
3. 开发规范 (Development Constraints)
3.1 架构模式 (Architecture)
•	SOLID 原则：严格遵守职责单一原则，确保解析、执行、文件 IO 逻辑完全解耦。
•	Actions 模式：严禁使用传统的 Services 模式。所有业务逻辑必须封装在独立的 Action 类中，每一个 Action 只负责一个原子化的任务。
•	无状态设计：程序运行不应依赖任何中间缓存，确保每次任务执行的幂等性。
3.2 CLI 交互规范
•	指令命名：全局指令统一为 recho。
•	实时反馈：必须提供清晰的终端进度反馈。使用图标标识状态：
•	[○] Processing：处理中
•	[✓] Success：执行并归档成功
•	[✕] Failed：失败（需附带简短错误描述）
3.3 异常与安全处理
•	零崩溃原则：任何单个任务的失败（网络超时、解析错误）都不允许导致主进程中断。
•	文件安全：在将 URL 转换为文件名时，必须执行严格的清洗逻辑，过滤或替换 :/\\?%*|"<> 等操作系统保留字符。
•	自动初始化：程序必须具备“自愈”能力，若输出目录缺失，需在写入前自动静默创建。
4. 存储结构示例 (Required Snapshot Format)
（此处保持不变，定义请求与响应的文本展示格式...）
5. 文件组织结构约束 (Directory Structure)
项目必须遵循以下目录结构，严禁随意堆放源码文件：
recho/
├── bin/
│   └── recho.js            # CLI 入口文件（负责参数解析与 Action 调用）
├── src/
│   ├── actions/            # 核心业务逻辑 (Actions 模式)
│   │   ├── parse_curl.js   # 将文本解析为请求配置
│   │   ├── execute_req.js  # 执行网络请求并捕获上下文
│   │   └── archive_res.js  # 格式化并写入文件系统
│   ├── utils/              # 工具函数
│   │   ├── file_system.js  # 目录检查、文件名清洗
│   │   └── logger.js       # 终端美化输出
│   └── constants.js        # 默认路径、配置常量
├── requests/               # 默认 cURL 输入目录 (Git 忽略)
├── responses/              # 默认结果输出目录 (Git 忽略)
├── package.json            # 依赖与 bin 配置
├── README.md               # 用户手册
└── GEMINI.md               # 开发规范

5.1 目录职责细则：
•	bin/: 仅负责处理 process.argv，它是 Action 的指挥官，不包含具体的业务逻辑。
•	src/actions/: 这里是项目的“心脏”。每一个文件导出一个函数或类，例如 ExecuteReqAction 应该只关心如何发送请求并返回结果对象，而不关心 cURL 是如何解析的。
•	src/utils/: 存放纯函数（Pure Functions），例如正则替换 URL 字符的逻辑。
💡 提示：
这种结构将“做什么”（Actions）与“怎么运行”（bin）完全分离。当你需要增加“支持并发执行”或“支持导出为 HTML”的功能时，只需要在 src/actions/ 中增加对应的 Action，并在 bin/recho.js 中编排即可。