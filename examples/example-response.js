// ===========================
// 示例4: HTTP响应修改脚本
// ===========================

console.log("=== 示例4: HTTP响应修改 ===");
console.log("原始响应状态:", $response.status);
console.log("原始响应体:", $response.body);

try {
  // 解析原始响应
  const originalData = JSON.parse($response.body);
  console.log("原始数据:", originalData);

  // 修改响应数据
  const modifiedData = {
    ...originalData,
    modified: true,
    modifyTime: new Date().toISOString(),
    customField: "This is added by Loon script",
  };

  // 返回修改后的响应
  $done({
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modifiedData),
  });

  console.log("响应已修改");
} catch (error) {
  console.error("解析响应失败:", error);
  // 如果解析失败,返回原始响应
  $done({});
}
