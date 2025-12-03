// ===========================
// 示例3: HTTP请求修改脚本
// ===========================

console.log("=== 示例3: HTTP请求修改 ===");
console.log("原始请求URL:", $request.url);
console.log("请求方法:", $request.method);
console.log("请求头:", JSON.stringify($request.headers, null, 2));

// 修改请求头
const modifiedHeaders = {
  ...$request.headers,
  "X-Custom-Header": "Loon-Test",
  "User-Agent": "CustomUserAgent/1.0",
};

// 返回修改后的请求
$done({
  headers: modifiedHeaders,
  url: $request.url,
});

console.log("请求已修改");
