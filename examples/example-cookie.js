// ===========================
// 高级示例: Cookie管理脚本
// ===========================

console.log('=== Cookie管理脚本 ===');

// 这是一个http-request类型的脚本示例
// 用于自动提取和保存Cookie

const url = $request.url;
const headers = $request.headers;

console.log('请求URL:', url);

// 检查是否是登录请求
if (url.includes('/login') || url.includes('/auth')) {
  console.log('✅ 检测到登录请求');
  
  // 提取请求中的Cookie
  const cookie = headers.Cookie || headers.cookie;
  
  if (cookie) {
    console.log('📝 提取到Cookie');
    
    // 保存Cookie
    $persistentStore.write(cookie, 'saved_cookie');
    $persistentStore.write(new Date().toISOString(), 'cookie_save_time');
    
    $notification.post(
      'Cookie已保存',
      '登录信息已记录',
      '可以在其他脚本中使用此Cookie'
    );
    
    console.log('✅ Cookie已保存到持久化存储');
  }
}

// 检查是否需要注入Cookie
if (url.includes('/api/') || url.includes('/user/')) {
  const savedCookie = $persistentStore.read('saved_cookie');
  
  if (savedCookie) {
    console.log('🔧 注入已保存的Cookie');
    
    // 修改请求头,添加Cookie
    const modifiedHeaders = {
      ...headers,
      'Cookie': savedCookie
    };
    
    $done({
      headers: modifiedHeaders
    });
    
    console.log('✅ 已注入Cookie到请求');
    return;
  }
}

// 默认:不修改请求
$done({});
