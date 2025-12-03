// ===========================
// 高级示例: 数据统计脚本
// ===========================

console.log('=== 数据统计脚本 ===');

// 从持久化存储中读取统计数据
function getStats() {
  const statsJson = $persistentStore.read('script_stats');
  if (statsJson) {
    try {
      return JSON.parse(statsJson);
    } catch (e) {
      console.error('解析统计数据失败:', e);
    }
  }
  
  return {
    totalRuns: 0,
    successCount: 0,
    failCount: 0,
    lastRun: null,
    firstRun: null
  };
}

// 保存统计数据
function saveStats(stats) {
  const statsJson = JSON.stringify(stats);
  $persistentStore.write(statsJson, 'script_stats');
}

// 获取当前统计
const stats = getStats();
stats.totalRuns++;
stats.lastRun = new Date().toISOString();

if (!stats.firstRun) {
  stats.firstRun = stats.lastRun;
}

console.log('\n📊 脚本运行统计');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('总运行次数:', stats.totalRuns);
console.log('成功次数:', stats.successCount);
console.log('失败次数:', stats.failCount);
console.log('首次运行:', stats.firstRun);
console.log('最后运行:', stats.lastRun);

// 计算运行时长
if (stats.firstRun) {
  const firstTime = new Date(stats.firstRun);
  const lastTime = new Date(stats.lastRun);
  const days = Math.floor((lastTime - firstTime) / (1000 * 60 * 60 * 24));
  console.log('运行天数:', days);
  
  if (stats.totalRuns > 1) {
    const avgPerDay = (stats.totalRuns / Math.max(days, 1)).toFixed(2);
    console.log('平均每天运行:', avgPerDay, '次');
  }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 模拟执行一些任务
console.log('执行任务中...');

// 随机成功或失败(仅用于演示)
const isSuccess = Math.random() > 0.2; // 80%成功率

setTimeout(function() {
  if (isSuccess) {
    stats.successCount++;
    console.log('✅ 任务执行成功');
    
    $notification.post(
      '任务完成',
      `第 ${stats.totalRuns} 次运行`,
      `成功率: ${((stats.successCount / stats.totalRuns) * 100).toFixed(1)}%`
    );
  } else {
    stats.failCount++;
    console.error('❌ 任务执行失败');
    
    $notification.post(
      '任务失败',
      `第 ${stats.totalRuns} 次运行`,
      '请检查日志'
    );
  }
  
  // 保存更新后的统计数据
  saveStats(stats);
  
  console.log('\n📈 统计数据已更新');
  $done();
}, 1000);
