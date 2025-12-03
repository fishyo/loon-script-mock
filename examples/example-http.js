// ===========================
// 示例2: HTTP请求脚本
// ===========================

console.log('=== 示例2: HTTP请求测试 ===');

// 测试GET请求
$httpClient.get('https://api.github.com', function(error, response, data) {
  if (error) {
    console.error('请求失败:', error);
    $notification.post('请求失败', '', error);
    $done();
    return;
  }
  
  console.log('响应状态:', response.status);
  console.log('响应头:', JSON.stringify(response.headers, null, 2));
  
  if (response.status === 200) {
    $notification.post(
      '请求成功',
      'GitHub API',
      `状态码: ${response.status}`
    );
  }
  
  $done();
});
