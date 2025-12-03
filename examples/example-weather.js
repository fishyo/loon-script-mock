// ===========================
// 高级示例: 天气查询脚本
// ===========================

console.log("=== 天气查询脚本 ===");

const CITY = $argument || "Beijing";
const API_URL = `https://wttr.in/${CITY}?format=j1`;

console.log(`查询城市: ${CITY}`);

// 从存储中读取上次查询时间
const lastQuery = $persistentStore.read("last_weather_query");
if (lastQuery) {
  console.log(`上次查询时间: ${lastQuery}`);
}

// 发起天气查询请求
$httpClient.get(
  {
    url: API_URL,
    timeout: 10000,
    headers: {
      "User-Agent": "curl/7.64.1",
    },
  },
  function (error, response, data) {
    if (error) {
      console.error("查询失败:", error);
      $notification.post("天气查询失败", CITY, "网络错误,请稍后重试");
      $done();
      return;
    }

    try {
      const weather = JSON.parse(data);
      const current = weather.current_condition[0];
      const location = weather.nearest_area[0];

      const temp = current.temp_C;
      const feelsLike = current.FeelsLikeC;
      const humidity = current.humidity;
      const weatherDesc = current.weatherDesc[0].value;
      const areaName = location.areaName[0].value;
      const country = location.country[0].value;

      console.log("\n📍 位置:", `${areaName}, ${country}`);
      console.log("🌡️  温度:", `${temp}°C (体感 ${feelsLike}°C)`);
      console.log("💧 湿度:", `${humidity}%`);
      console.log("☁️  天气:", weatherDesc);

      // 保存查询记录
      const queryTime = new Date().toISOString();
      $persistentStore.write(queryTime, "last_weather_query");
      $persistentStore.write(
        JSON.stringify({
          city: areaName,
          temp: temp,
          weather: weatherDesc,
          time: queryTime,
        }),
        "last_weather_data"
      );

      // 发送通知
      $notification.post(
        `${areaName} 天气`,
        `${temp}°C ${weatherDesc}`,
        `湿度 ${humidity}% | 体感 ${feelsLike}°C`
      );

      console.log("\n✅ 天气数据已更新");
    } catch (parseError) {
      console.error("数据解析失败:", parseError);
      $notification.post("天气查询失败", CITY, "数据解析错误");
    }

    $done();
  }
);
