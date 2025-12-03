import fs from "fs";
import fetch from "node-fetch";

/**
 * Loon脚本环境模拟器
 * 提供Loon所有API的模拟实现,用于在Windows/Node.js环境中测试Loon脚本
 */

// ===========================
// 存储文件路径
// ===========================
const STORE_FILE = "./persistent-store.json";

// ===========================
// 持久化存储加载和保存
// ===========================
function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("加载存储数据失败:", error);
  }
  return {};
}

function saveStore(store) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), "utf8");
  } catch (error) {
    console.error("保存存储数据失败:", error);
  }
}

let persistentStore = loadStore();

// ===========================
// 日志收集
// ===========================
const logs = [];
const originalConsoleLog = console.log;
console.log = function (...args) {
  logs.push(args.join(" "));
  originalConsoleLog.apply(console, args);
};

// ===========================
// $loon - 设备和应用信息
// ===========================
globalThis.$loon = {
  deviceName: "Windows Simulator",
  systemVersion: "1.0.0",
  appVersion: "3.0.0",
  buildVersion: "1000",
};

// ===========================
// $script - 脚本信息
// ===========================
globalThis.$script = {
  name: "test-script",
  startTime: new Date().toISOString(),
};

// ===========================
// $config - 配置信息
// ===========================
const mockConfig = {
  running_model: 1,
  all_buildin_nodes: ["DIRECT", "REJECT"],
  global_proxy: "节点选择",
  all_policy_groups: ["节点选择", "全球直连", "广告拦截"],
  ssid: "test-wifi",
  final: "节点选择",
  policy_select: {
    节点选择: "DIRECT",
    全球直连: "DIRECT",
    广告拦截: "REJECT",
  },
};

globalThis.$config = {
  getConfig: function (policyName, selectName) {
    if (policyName && selectName) {
      mockConfig.policy_select[policyName] = selectName;
      return true;
    }
    return JSON.stringify(mockConfig);
  },

  getSubPolicies: function (policyName, callback) {
    const subPolicies = ["策略1", "策略2", "DIRECT", "REJECT"];
    if (typeof callback === "function") {
      callback(subPolicies);
    }
  },

  getSelectedPolicy: function (policyName) {
    return mockConfig.policy_select[policyName] || "DIRECT";
  },

  setRunningModel: function (model) {
    if (model >= 0 && model <= 2) {
      mockConfig.running_model = model;
      return true;
    }
    return false;
  },
};

// ===========================
// $persistentStore - 持久化存储
// ===========================
globalThis.$persistentStore = {
  write: function (value, key) {
    try {
      const storageKey = key || $script.name;
      persistentStore[storageKey] = value;
      saveStore(persistentStore);
      console.log(`[存储] 写入: ${storageKey} = ${value}`);
      return true;
    } catch (error) {
      console.error("[存储] 写入失败:", error);
      return false;
    }
  },

  read: function (key) {
    const storageKey = key || $script.name;
    const value = persistentStore[storageKey];
    console.log(`[存储] 读取: ${storageKey} = ${value}`);
    return value;
  },

  remove: function () {
    persistentStore = {};
    saveStore(persistentStore);
    console.log("[存储] 已清空所有数据");
  },
};

// ===========================
// $notification - 通知
// ===========================
globalThis.$notification = {
  post: function (title, subtitle, content, attach = null, delay = 0) {
    setTimeout(() => {
      console.log("\n━━━━━━━━━━ 通知 ━━━━━━━━━━");
      console.log(`标题: ${title}`);
      console.log(`副标题: ${subtitle}`);
      console.log(`内容: ${content}`);
      if (attach) {
        console.log(`附件: ${JSON.stringify(attach)}`);
      }
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━\n");
    }, delay);
  },
};

// ===========================
// $httpClient - HTTP请求
// ===========================
globalThis.$httpClient = {
  get: function (params, callback) {
    this._request("GET", params, callback);
  },

  post: function (params, callback) {
    this._request("POST", params, callback);
  },

  put: function (params, callback) {
    this._request("PUT", params, callback);
  },

  delete: function (params, callback) {
    this._request("DELETE", params, callback);
  },

  head: function (params, callback) {
    this._request("HEAD", params, callback);
  },

  options: function (params, callback) {
    this._request("OPTIONS", params, callback);
  },

  patch: function (params, callback) {
    this._request("PATCH", params, callback);
  },

  _request: async function (method, params, callback) {
    const url = typeof params === "string" ? params : params.url;
    const options = {
      method: method,
      headers: params.headers || {},
      timeout: params.timeout || 5000,
    };

    if (
      params.body &&
      (method === "POST" || method === "PUT" || method === "PATCH")
    ) {
      options.body = params.body;
    }

    console.log(`[HTTP] ${method} ${url}`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const headers = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let data;
      if (params["binary-mode"]) {
        const buffer = await response.arrayBuffer();
        data = new Uint8Array(buffer);
      } else {
        data = await response.text();
      }

      const responseObj = {
        status: response.status,
        headers: headers,
      };

      console.log(`[HTTP] 响应: ${response.status}`);
      callback(null, responseObj, data);
    } catch (error) {
      console.error(`[HTTP] 请求失败: ${error.message}`);
      callback(error.message, null, null);
    }
  },
};

// ===========================
// $utils - 工具函数
// ===========================
globalThis.$utils = {
  geoip: function (ipStr) {
    console.log(`[工具] 查询IP地址 ${ipStr} 的GEOIP`);
    return "CN"; // 模拟返回中国
  },

  ipasn: function (ipStr) {
    console.log(`[工具] 查询IP地址 ${ipStr} 的ASN`);
    return "AS4134"; // 模拟返回
  },

  ipaso: function (ipStr) {
    console.log(`[工具] 查询IP地址 ${ipStr} 的ASO`);
    return "China Telecom"; // 模拟返回
  },

  ungzip: function (binary) {
    console.log("[工具] 解压gzip数据");
    // 简化实现,实际应该使用zlib
    return binary;
  },
};

// ===========================
// $done - 脚本完成回调
// ===========================
let doneCallback = null;
globalThis.$done = function (response) {
  console.log("\n[完成] 脚本执行完成");
  if (response) {
    console.log("[完成] 返回数据:", JSON.stringify(response, null, 2));
  }
  if (doneCallback) {
    doneCallback(response);
  }
};

// ===========================
// $request - HTTP请求对象 (用于http-request和http-response类型脚本)
// ===========================
globalThis.$request = {
  url: "https://example.com/test",
  method: "GET",
  headers: {
    "User-Agent": "Loon/3.0.0",
    "Content-Type": "application/json",
  },
  body: "",
};

// ===========================
// $response - HTTP响应对象 (用于http-response类型脚本)
// ===========================
globalThis.$response = {
  status: 200,
  headers: {
    "Content-Type": "application/json",
  },
  body: '{"message": "test response"}',
};

// ===========================
// $environment - 环境变量 (用于generic类型脚本)
// ===========================
globalThis.$environment = {
  params: {
    node: "HK Node",
    nodeInfo: {
      name: "HK Node",
      type: "shadowsocks",
    },
  },
};

// ===========================
// $argument - 脚本参数
// ===========================
globalThis.$argument = "";

// ===========================
// setTimeout 覆盖
// ===========================
const originalSetTimeout = globalThis.setTimeout;
globalThis.setTimeout = function (callback, delay, ...args) {
  console.log(`[定时器] 设置 ${delay}ms 延迟执行`);
  return originalSetTimeout(callback, delay, ...args);
};

// ===========================
// 导出模拟环境API
// ===========================
export function setDoneCallback(callback) {
  doneCallback = callback;
}

export function setRequest(request) {
  globalThis.$request = { ...globalThis.$request, ...request };
}

export function setResponse(response) {
  globalThis.$response = { ...globalThis.$response, ...response };
}

export function setArgument(argument) {
  globalThis.$argument = argument;
}

export function setScriptName(name) {
  globalThis.$script.name = name;
  globalThis.$script.startTime = new Date().toISOString();
}

export function getLogs() {
  return logs;
}

export function clearLogs() {
  logs.length = 0;
}

export function getStore() {
  return { ...persistentStore };
}

console.log("\n✅ Loon脚本模拟环境已加载\n");
