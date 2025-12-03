import { 
  setDoneCallback, 
  setRequest, 
  setResponse, 
  setArgument, 
  setScriptName,
  getLogs,
  clearLogs 
} from './loon-mock.js';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';

/**
 * Loon脚本测试运行器
 */

class LoonScriptRunner {
  constructor(options = {}) {
    this.testResults = [];
    this.verbose = options.verbose || false;
  }
  
  log(message, ...args) {
    if (this.verbose) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  /**
   * 运行单个脚本
   * @param {string} scriptPath - 脚本文件路径
   * @param {object} options - 运行选项
   */
  async runScript(scriptPath, options = {}) {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 运行脚本: ${scriptPath}`);
    console.log('='.repeat(60) + '\n');

    clearLogs();
    
    // 设置脚本名称
    const scriptName = scriptPath.split(/[\\/]/).pop().replace('.js', '');
    setScriptName(scriptName);
    this.log('脚本名称已设置:', scriptName);

    // 设置选项
    if (options.request) {
      setRequest(options.request);
      this.log('请求对象已设置:', JSON.stringify(options.request, null, 2));
    }
    if (options.response) {
      setResponse(options.response);
      this.log('响应对象已设置:', JSON.stringify(options.response, null, 2));
    }
    if (options.argument) {
      setArgument(options.argument);
      this.log('脚本参数已设置:', options.argument);
    }

    // 设置done回调
    let doneResult = null;
    let donePromise = new Promise((resolve) => {
      setDoneCallback((result) => {
        doneResult = result;
        this.log('$done() 被调用, 结果:', JSON.stringify(result));
        resolve();
      });
    });

    const startTime = Date.now();
    this.log('开始执行脚本, 超时时间:', options.timeout || 30000, 'ms');
    
    try {
      // 读取并执行脚本
      this.log('读取脚本文件...');
      const scriptCode = await readFile(scriptPath, 'utf8');
      this.log('脚本代码长度:', scriptCode.length, '字符');
      
      // 使用动态import执行脚本
      // 为了执行脚本代码,我们需要创建一个临时模块
      this.log('开始执行脚本代码...');
      const evalScript = new Function(scriptCode);
      evalScript();

      // 等待done被调用或超时
      const timeout = options.timeout || 30000;
      this.log('等待脚本完成或超时...');
      await Promise.race([
        donePromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('脚本执行超时')), timeout)
        )
      ]);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('\n' + '-'.repeat(60));
      console.log(`✅ 脚本执行完成 (耗时: ${duration}ms)`);
      console.log('-'.repeat(60) + '\n');
      
      if (this.verbose) {
        const collectedLogs = getLogs();
        console.log('📝 收集的日志数量:', collectedLogs.length);
        if (doneResult) {
          console.log('📤 返回结果:', JSON.stringify(doneResult, null, 2));
        }
      }

      this.testResults.push({
        script: scriptPath,
        success: true,
        duration,
        result: doneResult,
        logs: getLogs()
      });

      return {
        success: true,
        duration,
        result: doneResult
      };

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.error('\n' + '-'.repeat(60));
      console.error(`❌ 脚本执行失败: ${error.message}`);
      console.error('-'.repeat(60) + '\n');
      
      if (this.verbose) {
        console.error('❌ 错误堆栈:\n', error.stack);
        const collectedLogs = getLogs();
        console.error('📝 执行前收集的日志:', collectedLogs);
      }

      this.testResults.push({
        script: scriptPath,
        success: false,
        duration,
        error: error.message,
        stack: error.stack,
        logs: getLogs()
      });

      return {
        success: false,
        error: error.message,
        duration
      };
    }
  }

  /**
   * 打印测试摘要
   */
  printSummary() {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 测试摘要');
    console.log('='.repeat(60) + '\n');

    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.success).length;
    const failed = total - passed;

    console.log(`总计: ${total} | ✅ 成功: ${passed} | ❌ 失败: ${failed}\n`);

    this.testResults.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      const status = result.success ? '成功' : '失败';
      console.log(`${icon} [${index + 1}] ${result.script} - ${status} (${result.duration}ms)`);
      if (!result.success) {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// ===========================
// 主函数 - 运行所有示例
// ===========================
async function main() {
  const runner = new LoonScriptRunner();

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║       Loon Script Test Environment                       ║
║       Loon脚本测试环境                                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // 运行所有示例脚本
  const examples = [
    './examples/example-cron.js',
    './examples/example-http.js',
    './examples/example-storage.js',
    './examples/example-request.js',
    './examples/example-response.js',
    './examples/example-checkin.js'
  ];

  for (const example of examples) {
    await runner.runScript(example);
    // 等待一下,避免输出混乱
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 打印摘要
  runner.printSummary();
}

// 检查命令行参数
const args = process.argv.slice(2);

// 首先检查是否是帮助命令
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
使用方法: node test-runner.js <script-path> [options]

选项:
  --argument <value>   设置脚本参数 ($argument)
  --timeout <ms>       设置超时时间 (默认: 30000ms)
  --verbose, -v        输出详细调试日志
  --help, -h           显示帮助信息

示例:
  node test-runner.js examples/example-cron.js
  node test-runner.js examples/example-weather.js --argument "Beijing"
  node test-runner.js my-script.js --timeout 60000 --verbose
    `);
    process.exit(0);
  }
  // 运行所有示例
  main().catch(console.error);
} else {
  // 运行指定的脚本
  const scriptPath = args[0];
  const options = {};
  let verbose = false;
  
  // 解析参数
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--argument' && i + 1 < args.length) {
      options.argument = args[i + 1];
      i++;
    } else if (args[i] === '--timeout' && i + 1 < args.length) {
      options.timeout = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === '--verbose' || args[i] === '-v') {
      verbose = true;
    }
  }
  
  const runner = new LoonScriptRunner({ verbose });
  
  if (verbose) {
    console.log('🔍 详细模式已启用');
    console.log('📋 运行参数:', { scriptPath, options });
  }
  
  runner.runScript(scriptPath, options).then(() => {
    runner.printSummary();
  });
}

export { LoonScriptRunner };
