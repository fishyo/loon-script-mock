// ===========================
// 示例6: 综合应用脚本
// ===========================

console.log("=== 示例6: 综合应用 - 签到脚本 ===");

const CHECKIN_URL = "https://jsonplaceholder.typicode.com/posts/1";
const LAST_CHECKIN_KEY = "last_checkin_date";

// 读取上次签到日期
const lastCheckin = $persistentStore.read(LAST_CHECKIN_KEY);
const today = new Date().toISOString().split("T")[0];

console.log("上次签到:", lastCheckin);
console.log("今天日期:", today);

if (lastCheckin === today) {
  console.log("今天已经签到过了");
  $notification.post("签到提醒", "重复签到", "您今天已经签到过了!");
  $done();
} else {
  // 执行签到请求
  console.log("开始签到...");

  $httpClient.get(
    {
      url: CHECKIN_URL,
      headers: {
        "User-Agent": "Loon/3.0.0",
      },
      timeout: 10000,
    },
    function (error, response, data) {
      if (error) {
        console.error("签到失败:", error);
        $notification.post("签到失败", "网络错误", error);
        $done();
        return;
      }

      if (response.status === 200) {
        // 签到成功,保存日期
        $persistentStore.write(today, LAST_CHECKIN_KEY);

        // 更新签到次数
        let checkCount = parseInt($persistentStore.read("check_count") || "0");
        checkCount++;
        $persistentStore.write(checkCount.toString(), "check_count");

        console.log("签到成功!");
        console.log("累计签到次数:", checkCount);

        $notification.post(
          "签到成功 ✅",
          `第${checkCount}次签到`,
          `签到时间: ${new Date().toLocaleString("zh-CN")}`
        );
      } else {
        console.error("签到失败, 状态码:", response.status);
        $notification.post(
          "签到失败",
          `HTTP ${response.status}`,
          "请检查网络或稍后重试"
        );
      }

      $done();
    }
  );
}
