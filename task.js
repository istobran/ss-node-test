import tcpp from "tcp-ping";
import dns from "dns";
import Table from "cli-table2";

export default class {
  /**
   * 构造方法，用于初始化私有变量
   * @param {Object} config_data 配置文件数据
   */
  constructor(config_data) {
    // 表格数据部分
    this.nodeList = config_data.configs;
    this.pureData = new Array();
    this.out = new Table({
      head: ['Hostname', 'Resolve', 'Port', 'Delay'],
      colWidths: [20, 20, 10, 15]
    });
  }

  /**
   * 检查是否为IPv4
   * @param {String} ip 要判断的IP地址
   * @return {Boolean}
   */
  isIPv4(ip) {
    return /^(?=\d+\.\d+\.\d+\.\d+$)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])\.?){4}$/.test(ip);
  }

  /**
   * 调用DNS解析IP地址
   * @param {Object} item 服务器对象
   * @return {Promise}
   */
  resolveIP(item) {
    return new Promise((resolve, reject) => {
      if (this.isIPv4(item.server)) {
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

  /**
   * 使用tcp-ping测试延迟
   * @param {Object} item 服务器对象
   * @return {Promise}
   */
  ping(item) {
    return new Promise((resolve, reject) => {
      this.updateProgress(item.server);
      this.resolveIP(item).then(() => {
        if (item.ip == "无法解析") {      // 解析失败
          this.out.push([item.server, "无法解析", item.server_port, "无法连接"]);
          resolve();
        } else {    // 解析成功
          tcpp.ping({ address: item.ip, port: item.server_port, timeout: 500, attempts: 1 }, (err, data) => {
            this.out.push([item.server, item.ip, item.server_port, data.avg ? data.avg.toFixed(3) : "无法连接"]);
            this.pureData.push({
              hostname: item.server,
              ipaddr: item.ip,
              port: item.server_port,
              delay: data.avg ? data.avg.toFixed(3) : 999
            });
            resolve();
          });
        }
      })
    });
  }

  /**
   * 求出延迟最低节点
   * @param {Array} data 服务器延迟列表
   * @return {Object}
   */
  min(data) {
    var min = null;
    data.forEach((item, index) => {
      if (index === 0) {
        min = item;
      } else if (Number.parseFloat(item.delay) < Number.parseFloat(min.delay)) {
        min = item;
      }
    });
    return min;
  }

  /**
   * 注册进度条组件
   * @param {Progress} pgbar 进度条组件
   */
  register(pgbar) {
    this.pgbar = pgbar;
    this.pgbar.setFullLength(this.nodeList.length);
  }

  /**
   * 更新进度
   * @param {String} taskName 当前执行的任务名
   */
  updateProgress(taskName) {
    if (this.pgbar) {
      this.pgbar.update(taskName);
    }
  }

  /**
   * 执行测试任务
   */
  run() {
    // 返回promise对象的函数的数组
    var tasks = [];
    this.nodeList.forEach(item => {
      tasks.push(() => { return this.ping(item) });
    });
    var promise = Promise.resolve();
    // 开始的地方
    tasks.forEach(fn => {
      promise = promise.then(fn);
    });
    promise.then((value) => {
      console.log(this.out.toString());
      const fastest = this.min(this.pureData);
      console.log(`统计：共计 ${this.nodeList.length} 个节点，其中最快节点的是 ${fastest.hostname}(${fastest.delay})`);
    }).catch((error) => {
      console.error(error);
    });
  }
}
