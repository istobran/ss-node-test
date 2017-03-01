/**
 * Created by BangZ on 2017/2/28.
 * E-mail i@bangz.me
 * @author BangZ
 */

const fs = require("fs");
const path = require("path");
const jsonfile = require("jsonfile");
const tcpp = require('tcp-ping');
const dns = require('dns');
const Table = require('cli-table2');
const Gauge = require("gauge");

// 帮助信息
const helpMessage = `
  usage: node index.js [your_shadowsocks_config_file]
`;

// 判断是否输出帮助信息
if (process.argv.length != 3 || process.argv[2] == "-h" || process.argv[2] == "--help") {
  console.log(helpMessage);
  process.exit();
}
const file_path = process.argv[2];
var config_data;
// 判断文件是否可访问
try {
  if (!fs.lstatSync(file_path).isFile()) {    // 如果不是文件
    throw new Error(`'${file_path}' is not a vaild file!`);
  } else if (path.extname(file_path) != ".json") {    // 如果不是 json 格式
    throw new Error(`'${file_path}' is not a json file!`);
  } else {    // 如果是 json 格式的文件
    config_data = jsonfile.readFileSync(file_path);
  }
} catch (e) {   // 文件不存在
  throw new Error(`'${file_path}' no such file or directory!`);
}

// 表格数据部分
const nodeList = config_data.configs;
const out = new Table({
  head: ['Hostname', 'Resolve', 'Port', 'Delay'],
  colWidths: [20, 20, 15]
});
var curr_index = 1;
var curr_target = "";

// 进度条部分
const gt = new Gauge(process.stderr, {    // 进度条对象
  updateInterval: 50,
  cleanupOnExit: true
});
var progress = 0;   // 进度
var pulse = setInterval(function () {   // 说明信息更新器
  gt.pulse(`正在测试服务器 ${curr_target} 的延迟 ${curr_index}/${nodeList.length}`)
}, 110);
var prog = setInterval(function () {    // 进度条更新器
  progress = curr_index / nodeList.length;
  gt.show(Math.round(progress * 100)+"%", progress)
  if (progress >= 1) {
    clearInterval(prog)
    clearInterval(pulse)
    gt.disable()
  }
}, 100);

// 检查是否为IPv4
const isIPv4 = (ip) => {
  return /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(ip);
}

// 调用DNS解析IP地址
const resolveIP = (item) => {
  return new Promise((resolve, reject) => {
    if (isIPv4(item.server)) {
      item.ip = item.server;
      resolve();
    } else {
      dns.lookup(item.server, (err, addresses, family) => {
        if (typeof addresses === 'undefined') {
          item.ip = "无法解析";
          // reject("无法解析");
        } else {
          item.ip = addresses;
        }
        resolve();
      });
    }
  });
}

// 获取延迟
const ping = (item) => {
  return new Promise((resolve, reject) => {
    curr_target = item.server;
    resolveIP(item).then(() => {
      if (item.ip == "无法解析") {      // 解析失败
        out.push([item.server, "无法解析", item.server_port, "无法连接"]);
        resolve();
      } else {    // 解析成功
        tcpp.ping({ address: item.ip, port: item.server_port, timeout: 500, attempts: 1 }, (err, data) => {
          out.push([item.server, item.ip, item.server_port, data.avg ? data.avg.toFixed(3) : "无法连接"]);
          resolve();
        });
      }
    })
  });
}

// 主入口
const main = () => {
    // 返回promise对象的函数的数组
    var tasks = [];
    nodeList.forEach((item) => {
      tasks.push(() => { return ping(item).then(() => {curr_index++}) });
    });
    var promise = Promise.resolve();
    // 开始的地方
    tasks.forEach(fn => {
      promise = promise.then(fn);
    });
    gt.show();
    return promise;
}

// 运行主程序
main().then(function (value) {
  console.log(out.toString());
}).catch(function(error){
    console.error(error);
});
