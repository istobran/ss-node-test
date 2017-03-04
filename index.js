/**
 * Created by BangZ on 2017/2/28.
 * E-mail i@bangz.me
 * @author BangZ
 */
import fs from "fs";
import path from "path";
import jsonfile from "jsonfile";
import Task from "./task.js";
import Progress from "./progress.js";

class Main {
  /**
   * 构造方法，初始化json数据
   */
  constructor() {
    this.helpMessage = `usage: node index.js [your_shadowsocks_config_file]`;   // 帮助信息
    // 判断是否输出帮助信息
    if (process.argv.length != 3 || process.argv[2] == "-h" || process.argv[2] == "--help") {
      console.log(helpMessage);
      process.exit();
    }
    const file_path = process.argv[2];
    this.config_data;
    // 判断文件是否可访问
    try {
      if (!fs.lstatSync(file_path).isFile()) {    // 如果不是文件
        throw new Error(`'${file_path}' is not a vaild file!`);
      } else if (path.extname(file_path) != ".json") {    // 如果不是 json 格式
        throw new Error(`'${file_path}' is not a json file!`);
      } else {    // 如果是 json 格式的文件
        this.config_data = jsonfile.readFileSync(file_path);
      }
    } catch (e) {   // 文件不存在
      throw new Error(`'${file_path}' no such file or directory!`);
    }
  }

  /**
   * 执行入口
   */
  execute() {
    this.progress = new Progress();
    this.task = new Task(this.config_data);
    this.task.run();
  }
}

// 运行主程序
new Main().execute();
