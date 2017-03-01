# ss-node-test
用于快速批量测试 ss 各节点延迟的工具，基于tcpping

### 安装

    git clone https://github.com/istobran/ss-node-test.git
    cd ss-node-test
    npm install

### 使用方法
将ss的配置文件`gui-config.json`放入当前项目目录下，接着运行

	npm start

### 配置文件格式：
```json
{
    "configs":[
        {
            "server":"www.example.com",
            "server_port":"8388",
            "local_port":"1080",
            "password":"abcd",
            "method":"aes-256-cfg",
            "remarks":"example"
        }
        ...
    ],
    ...
}
```

### 使用建议
- node 版本建议在 v6 以上
