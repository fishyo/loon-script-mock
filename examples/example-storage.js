// ===========================
// 示例5: 持久化存储脚本
// ===========================

console.log("=== 示例5: 持久化存储测试 ===");

// 写入数据
$persistentStore.write("张三", "username");
$persistentStore.write("user@example.com", "email");
$persistentStore.write("premium", "account_type");

// 读取数据
const username = $persistentStore.read("username");
const email = $persistentStore.read("email");
const accountType = $persistentStore.read("account_type");

console.log("用户名:", username);
console.log("邮箱:", email);
console.log("账户类型:", accountType);

// 使用默认key(脚本名称)
$persistentStore.write(
  JSON.stringify({
    lastRun: new Date().toISOString(),
    runCount: 1,
  })
);

const scriptData = $persistentStore.read();
console.log("脚本数据:", scriptData);

$notification.post(
  "存储测试",
  "数据已保存",
  `用户: ${username}, 类型: ${accountType}`
);

$done();
