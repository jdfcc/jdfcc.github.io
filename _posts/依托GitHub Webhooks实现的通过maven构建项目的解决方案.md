# 依托GitHub Webhooks实现的通过maven构建项目的解决方案

## 起因 

前几天装了jekins想要学习相关知识，但由于本人是菜鸡在jekins构建时总是各种报错，但又有自动部署方面的需求，所以写了个脚本。

## 原理

Webhooks是github仓库所带的一个功能，在你对仓库进行某种操作时（例如push)，他就会自动向你指定的url发送一条事先定义好的post请求。基于此原理我们可以写一个服务器，当收到请求后就运行事先写好的脚本.。

## 代码



```java
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;

/**
 * @author Jdfcc
 */

@RestController
@RequestMapping("shell")
public class ListenController {

    @GetMapping
    public String listen(@RequestParam("shell") String shell) {
        // 脚本绝对路径 + 脚本名
        String path = "/app/" + shell + ".sh > /app/log.txt";
        ProcessBuilder builder = new ProcessBuilder("/bin/sh", "-c", path);

        builder.directory(new File("/home/"));
        int runningStatus = 0;
        try {
            Process pro = builder.start();
            System.out.println("the shell script running");
            try {
                runningStatus = pro.waitFor();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (runningStatus != 0) {
            System.out.println("脚本执行失败");
        } else {
            System.out.println("脚本执行成功");
        }
        return shell;
    }

}
```

请求方式为``Post``,请求路径为: ``ip``:``port``/shell/?shell=``{shellName}``

同时进入github仓库，依次点击``setting/Webhooks/Add webhook/``，之后，设置``Payload URL``为上面的请求路径。如图:

<img src="https://jdfcc.pro:8088/i/2023/10/07/6520f8ff20639.png" alt="示例配置" style="zoom: 67%;" />

## 脚本

```shell
#!/bin/bash

echo "================================="
echo "自动化部署脚本启动"
echo "================================="
r
echo "停止原来运行中的工程"

APP_NAME="项目名"
GIT_REMOTE="https://github.com/userName/Project.git"  # 指定要拉取代码的 Git 仓库 URL
GIT_BRANCH="main"    # 指定要拉取的分支

# 检查是否有同名进程正在运行，如果有则停止
tpid=$(ps -ef | grep "$APP_NAME" | grep -v grep | grep -v $$ | awk '{print $2}')
if [ -n "$tpid" ]; then
    echo "Stopping the process..."
    kill -15 "$tpid"
    sleep 5 # 等待5秒以确保进程完全终止
else
    echo "Process is not running."
fi

# 再次检查是否进程已经停止
tpid=$(ps -ef | grep "$APP_NAME" | grep -v grep | grep -v $$ | awk '{print $2}')
if [ -n "$tpid" ]; then
    echo "Killing the process!"
    kill -9 "$tpid"
else
    echo "Stop Success!"
fi

# 指定项目拉取下来的目录
PROJECT_DIR="/app/Project"

# 检查目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Project directory not found. Cloning the Git repository..."
    git clone "$GIT_REMOTE" "$PROJECT_DIR" -b "$GIT_BRANCH"
    
    # 等待克隆完成
    wait
    
else
    # 进入项目目录
    cd "$PROJECT_DIR"

    # 检查是否为有效的 Git 仓库
    if [ ! -d .git ]; then
        echo "Git repository not found in $PROJECT_DIR. Make sure it's a valid Git repository."
        exit 1
    fi

    # 从指定的 Git 仓库 URL 拉取最新代码
    echo "Preparing to pull the latest code from the Git repository (remote: $GIT_REMOTE, branch: $GIT_BRANCH)"
    git pull "$GIT_REMOTE" "$GIT_BRANCH"

    # 检查 git pull 命令的返回值，以确保拉取成功
    if [ $? -ne 0 ]; then
        echo "Error: Git pull failed. Please check Git credentials and repository configuration."
        exit 1
    fi

    echo "Code pull completed"
fi

# 添加等待，确保克隆和拉取完成后再执行编译
sleep 5

# 编译项目
echo "Starting the build"
output=$(mvn clean package -Dmaven.test.skip=true)

cd target

# 启动项目
echo "Starting the project"
nohup java -jar Count-0.0.1-SNAPSHOT.jar > /var/log/myapp.log 2>&1 &
echo "Project started"
```



