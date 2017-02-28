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

const nodeList = config_data.configs;
const out = new Table({
  head: ['Domain', 'Resolves', 'Delay'],
  colWidths: [20, 20, 15]
});
var curr_index = 0;

const ping = function(item) {
  return new Promise((resolve, reject) => {
    console.log("开始执行", Date.now());
    tcpp.ping({ address: item.server, port: item.server_port, timeout: 500, attempts: 5 }, (err, data) => {
      console.log(err, data);
      out.push([data.address, "0.0.0.0", data.avg ? data.avg.toFixed(3) : "无法连接"]);
      // console.log("chain: ", data.address, " : ", data.avg);
      resolve();
    });
  });
}

// const cb_ping = () => {
//   return ping(nodeList[curr_index]);
// };

// const executeTask = () => {
//
//   var promise = Promise.resolve();
//   // console.log(promise.constructor);
//   for (curr_index = 0; curr_index < nodeList.length; curr_index++) {
//     promise = promise.then(() => {
//       // return ping(nodeList[curr_index]);
//       return new Promise((res, rej) => {
//         console.log("开始执行", Date.now());
//         tcpp.ping({
//           address: nodeList[curr_index].server,
//           port: nodeList[curr_index].server_port,
//           attempts: 5
//         }, (err, data) => {
//           out.push([data.address, "0.0.0.0", data.avg]);
//           res();
//         });
//       });
//     });
//   }
//
//   // 循环结束表示全部测试完成
//   return promise.then(() => {
//     console.log("finished");
//     console.log(out.toString());
//   });
// };
//
// executeTask();

// function getURL(URL) {
//     return new Promise(function (resolve, reject) {
//         var req = new XMLHttpRequest();
//         req.open('GET', URL, true);
//         req.onload = function () {
//             if (req.status === 200) {
//                 resolve(req.responseText);
//             } else {
//                 reject(new Error(req.statusText));
//             }
//         };
//         req.onerror = function () {
//             reject(new Error(req.statusText));
//         };
//         req.send();
//     });
// }
var request = {
        comment: function getComment() {
            return ping(nodeList[0]).then();
        },
        people: function getPeople() {
            return ping(nodeList[1]).then();
        }
    };
function main() {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    // [] 用来保存初始化值
    var pushValue = recordValue.bind(null, []);
    // 返回promise对象的函数的数组
    var tasks = [];
    nodeList.forEach(function(item) {
      tasks.push(function() { return ping(item).then() });
    });
    // var tasks = [request.comment, request.people];
    var promise = Promise.resolve();
    // 开始的地方
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        promise = promise.then(task).then(pushValue);
    }
    return promise;
}
// 运行示例
main().then(function (value) {
    console.log(out.toString());
}).catch(function(error){
    console.error(error);
});
