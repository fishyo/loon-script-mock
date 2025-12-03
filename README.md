# LoonScriptMock

> 跨平台 Loon 脚本测试与模拟环境

在 Windows/Linux/macOS 上本地测试和开发 Loon 脚本,完整模拟 Loon API。

## ✨ 特性

- 🎯 **完整 API 模拟** - 实现了所有 Loon Script API
- 🔄 **跨平台支持** - Windows / Linux / macOS
- 📦 **零依赖使用** - 仅需 Node.js 和 node-fetch
- 🐛 **详细调试** - 支持 verbose 模式输出详细日志
- 💾 **持久化存储** - 自动保存数据到本地文件
- 📝 **丰富示例** - 9 个实用示例脚本

## 🚀 快速开始

### 安装

```bash
git clone https://github.com/fishyo/loon-script-mock.git
cd loon-script-mock
npm install
```

### 基本使用

```bash
# 查看帮助
node test-runner.js --help

# 运行单个脚本
node test-runner.js examples/example-cron.js

# 运行所有示例
npm test

# 详细模式 (输出调试日志)
node test-runner.js examples/example-checkin.js --verbose

# 带参数运行
node test-runner.js examples/example-weather.js --argument "Beijing"

# 自定义超时
node test-runner.js my-script.js --timeout 60000
```

## 📚 示例脚本

| 脚本                  | 说明               | 类型          |
| --------------------- | ------------------ | ------------- |
| `example-cron.js`     | 定时任务基础示例   | cron          |
| `example-http.js`     | HTTP 请求示例      | cron          |
| `example-storage.js`  | 持久化存储完整示例 | cron          |
| `example-request.js`  | 修改 HTTP 请求     | http-request  |
| `example-response.js` | 修改 HTTP 响应     | http-response |
| `example-checkin.js`  | 每日签到脚本       | cron          |
| `example-weather.js`  | 天气查询           | cron          |
| `example-cookie.js`   | Cookie 管理        | http-request  |
| `example-stats.js`    | 数据统计           | cron          |

## 🔧 支持的 API

### 基础

- `console.log()` - 日志输出
- `setTimeout()` - 定时器
- `$done()` - 完成回调

### 脚本信息

- `$loon` - 设备信息
- `$script` - 脚本信息 (name, startTime)
- `$argument` - 脚本参数

### 配置管理

- `$config.getConfig()` - 获取配置
- `$config.getSubPolicies()` - 获取子策略
- `$config.getSelectedPolicy()` - 获取选中策略
- `$config.setRunningModel()` - 设置运行模式

### 持久化存储

- `$persistentStore.write(value, key)` - 写入
- `$persistentStore.read(key)` - 读取
- `$persistentStore.remove()` - 清空

### 通知

- `$notification.post(title, subtitle, content, attach, delay)` - 发送通知

### HTTP 请求

- `$httpClient.get(params, callback)`
- `$httpClient.post(params, callback)`
- `$httpClient.put(params, callback)`
- `$httpClient.delete(params, callback)`
- `$httpClient.head(params, callback)`
- `$httpClient.options(params, callback)`
- `$httpClient.patch(params, callback)`

### 工具函数

- `$utils.geoip(ip)` - 查询 IP 的 GEOIP
- `$utils.ipasn(ip)` - 查询 IP 的 ASN
- `$utils.ipaso(ip)` - 查询 IP 的 ASO
- `$utils.ungzip(binary)` - 解压 gzip 数据

### HTTP 脚本专用

- `$request` - HTTP 请求对象
- `$response` - HTTP 响应对象
- `$environment` - 环境变量

## 📖 使用示例

### 1. 简单的定时脚本

```javascript
console.log("定时任务执行");

// 保存数据
$persistentStore.write(new Date().toISOString(), "last_run");

// 发送通知
$notification.post("定时任务", "执行成功", "任务已完成");

// 完成
$done();
```

### 2. HTTP 请求脚本

```javascript
$httpClient.get("https://api.github.com", function (error, response, data) {
  if (error) {
    console.error("请求失败:", error);
    $done();
    return;
  }

  console.log("状态码:", response.status);
  console.log("数据:", data);

  $notification.post("请求成功", "", `状态码: ${response.status}`);
  $done();
});
```

### 3. 修改 HTTP 请求

```javascript
// http-request 类型脚本
console.log("原始 URL:", $request.url);

// 添加自定义请求头
$done({
  headers: {
    ...$request.headers,
    "X-Custom-Header": "MyValue",
  },
});
```

### 4. 修改 HTTP 响应

```javascript
// http-response 类型脚本
const body = JSON.parse($response.body);

// 修改响应数据
body.isPremium = true;
body.vipLevel = 999;

$done({
  status: 200,
  body: JSON.stringify(body),
});
```

## 🔍 调试功能

### 详细日志模式

使用 `--verbose` 或 `-v` 参数启用详细调试日志:

```bash
node test-runner.js my-script.js --verbose
```

输出示例:

```
🔍 详细模式已启用
📋 运行参数: { scriptPath: 'my-script.js', options: {} }
[DEBUG] 脚本名称已设置: my-script
[DEBUG] 开始执行脚本, 超时时间: 30000 ms
[DEBUG] 读取脚本文件...
[DEBUG] 脚本代码长度: 256 字符
[DEBUG] 开始执行脚本代码...
[DEBUG] $done() 被调用, 结果: undefined
📝 收集的日志数量: 12
```

### 查看持久化数据

所有存储的数据保存在 `persistent-store.json`:

```bash
cat persistent-store.json
```

## 📁 项目结构

```
loon-script-mock/
├── loon-mock.js              # Loon API 模拟实现
├── test-runner.js            # 测试运行器
├── package.json              # 项目配置
├── examples/                 # 示例脚本目录
│   ├── example-cron.js       # 定时任务
│   ├── example-http.js       # HTTP 请求
│   ├── example-storage.js    # 持久化存储
│   ├── example-request.js    # 修改请求
│   ├── example-response.js   # 修改响应
│   ├── example-checkin.js    # 签到脚本
│   ├── example-weather.js    # 天气查询
│   ├── example-cookie.js     # Cookie 管理
│   └── example-stats.js      # 数据统计
└── persistent-store.json     # 持久化存储数据(自动生成)
```

## 🎯 开发自己的脚本

1. 创建脚本文件:

```javascript
// my-script.js
console.log("我的 Loon 脚本");

$httpClient.get(
  "https://api.example.com/data",
  function (error, response, data) {
    if (error) {
      console.error("错误:", error);
      $done();
      return;
    }

    // 处理数据
    console.log("数据:", data);

    // 保存结果
    $persistentStore.write(data, "my_data");

    // 发送通知
    $notification.post("完成", "数据已获取", "");

    $done();
  }
);
```

2. 测试脚本:

```bash
node test-runner.js my-script.js
```

3. 调试脚本:

```bash
node test-runner.js my-script.js --verbose
```

## ⚙️ 命令行选项

| 选项                 | 说明             | 示例                   |
| -------------------- | ---------------- | ---------------------- |
| `--argument <value>` | 设置脚本参数     | `--argument "Beijing"` |
| `--timeout <ms>`     | 设置超时时间     | `--timeout 60000`      |
| `--verbose, -v`      | 输出详细调试日志 | `--verbose`            |
| `--help, -h`         | 显示帮助信息     | `--help`               |

## 💡 技巧与建议

1. **异步操作必须调用 $done()**: 在所有回调完成后调用,否则脚本会超时
2. **使用 verbose 模式调试**: 遇到问题时使用 `--verbose` 查看详细执行过程

3. **查看存储数据**: 检查 `persistent-store.json` 了解数据保存情况

4. **错误处理**: 始终在 HTTP 请求中处理错误情况

5. **测试先行**: 在 Loon 中使用前,先在本地充分测试

## 🌐 跨平台使用

所有平台统一使用 `node` 命令:

```bash
# Windows / Linux / macOS 通用
node test-runner.js examples/example-cron.js
node test-runner.js examples/example-checkin.js --verbose
node test-runner.js examples/example-weather.js --argument "Shanghai"
```

## 📄 许可证

MIT License

## 🔗 参考资料

- [Loon 官方文档](https://nsloon.app/docs/intro)
- [Loon 脚本类型](https://nsloon.app/docs/Script/)
- [Loon Script API](https://nsloon.app/docs/Script/script_api)

---

**开始编写你的 Loon 脚本吧! 🚀**
