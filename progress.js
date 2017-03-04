import Gauge from "gauge";

export default class {
  /**
   * 构造方法，用于初始化进度条
   */
  constructor() {
    this.curr_index = 1;
    this.curr_target = "";

    // 进度条部分
    this.gt = new Gauge(process.stderr, {    // 进度条对象
      updateInterval: 50,
      cleanupOnExit: true
    });
    this.progress = 0;   // 进度
    this.pulse = setInterval(function () {   // 说明信息更新器
      this.gt.pulse(`正在测试服务器 ${this.curr_target} 的延迟 ${this.curr_index}/${nodeList.length}`)
    }, 110);
    this.prog = setInterval(function () {    // 进度条更新器
      progress = curr_index / nodeList.length;
      this.gt.show(Math.round(progress * 100)+"%", progress)
      if (progress >= 1) {
        clearInterval(prog)
        clearInterval(pulse)
        gt.disable()
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
   */
  update() {

  }
}
