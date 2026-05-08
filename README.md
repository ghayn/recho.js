# Recho 🚀

**Recho** 是一个专门用于批量解析 cURL 命令脚本、执行请求并完整归档请求与响应的上下文。

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
生成的响应记录遵循：[STATUS_CODE]-[TIMESTAMP]-[ORIGINAL_FILE_NAME].txt
例如：200-1778289502-login_request.txt
