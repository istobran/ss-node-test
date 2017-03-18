import Gauge from "gauge";

export default class {
  /**
   * 构造方法，用于初始化进度条
   */
  constructor() {
    this.curr_index = 0;
    this.taskName = "";
    this.fullLength = 1;

    // 进度条部分
    this.gt = new Gauge(process.stderr, {    // 进度条对象
      updateInterval: 50,
      cleanupOnExit: true
    });
    this.progress = 0;   // 进度
    this.pulse = setInterval(() => {   // 说明信息更新器
      this.gt.pulse(`正在测试服务器 ${this.taskName} 的延迟 ${this.curr_index}/${this.fullLength}`)
    }, 110);
    this.prog = setInterval(() => {    // 进度条更新器
      this.progress = this.curr_index / this.fullLength;
      this.gt.show(Math.round(this.progress * 100)+"%", this.progress)
      if (this.progress >= 1) {
        clearInterval(this.prog)
        clearInterval(this.pulse)
        this.gt.disable()
      }
    }, 100);
  }

  /**
   * 显示进度条
   */
  show() {
    this.gt.show();
  }

  /**
   * 更新进度
   * @param {String} taskName 当前任务名
   */
  update(taskName) {
    this.taskName = taskName;
    this.curr_index++;
  }

  /**
   * 设置总任务量
   * @param {Number} length 总任务数
   */
  setFullLength(length) {
    this.fullLength = length;
  }
}
