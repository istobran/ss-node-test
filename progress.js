export default class {
  /**
   * 构造方法，用于初始化进度条
   */
  constructor() {
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
  }
}
