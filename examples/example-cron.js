// ===========================
// 示例1: 简单的cron脚本
// ===========================

console.log('=== 示例1: Cron脚本测试 ===');
console.log('脚本名称:', $script.name);
console.log('开始时间:', $script.startTime);
console.log('设备信息:', $loon.deviceName, $loon.systemVersion);

// 发送通知
$notification.post(
  '定时任务通知',
  '测试副标题',
  '这是一个定时任务的测试内容'
);

// 存储数据
$persistentStore.write('2025-12-03', 'last_run_date');
console.log('上次运行日期:', $persistentStore.read('last_run_date'));

// 完成脚本
$done();
