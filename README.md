📄 README.md
# Recho 🚀

**Recho** 是一个极致极简、功能强大的命令行工具（CLI），专门用于批量解析 cURL 命令脚本、执行请求并完整归档请求与响应的上下文。

## 🌟 核心理念
- **极简主义**：输入短促有力，输出清晰直观。
- **排查友好**：每一个响应都附带完整的请求镜像，拒绝“无头公案”。
- **工业级可靠**：覆盖 cURL 的各种复杂参数与变体。

## 🛠️ 安装

```bash
# 克隆项目
git clone [https://github.com/your-username/recho.git](https://github.com/your-username/recho.git)
cd recho

# 安装依赖并链接到全局
npm install
npm link

📖 使用指南
1. 在项目目录下创建 requests 文件夹。
2. 将包含 cURL 命令的 .txt 文件放入其中（支持多行 \ 格式）。
3. 运行指令：
recho

或者指定自定义路径：
recho --input ./my-tests --output ./my-logs

📂 文件命名规范
生成的响应记录遵循：[METHOD]-[CLEAN_URL]-[TIMESTAMP].txt
例如：POST-api_example_com_v1_login-1715151234567.txt
