# 小米手机安装面具教程（Xiaomi手机获取root权限）

理论上安卓设备都能刷，只要能解锁BL就可以（如果不能解锁，推荐[光速虚拟机](https://magiskcn.com/gsxnj)）
大致思路：设备解锁 – 系统包提取boot – 面具修补boot – fastboot刷入修补文件

**骁龙8Gen2**处理器手机请看这个教程：[init-boot-magisk](https://magiskcn.com/init-boot-magisk)

**天玑9200+**处理器手机请看这个教程：[init-boot-ab-magisk](https://magiskcn.com/init-boot-ab-magisk)

演示环境：

手机机型：**小米 10 Pro**
手机系统：MIUI13（安卓12）
电脑系统：Windows11

演示步骤：

一、**Bootloader**解锁：[Xiaomi-unlock](https://magiskcn.com/xiaomi-unlock)
*如果你的手机不能解锁BL，推荐 **[光速虚拟机](https://magiskcn.com/gsxnj)**（不用解锁BL也可以刷面具）*

二、下载**系统包**：[Get-miui](https://magiskcn.com/get-miui)

三、解包提取boot：[Payload-dumper-go-boot](https://magiskcn.com/payload-dumper-go-boot)（如果系统包有 **boot.img**，可以跳过此步骤）

四、手机插电脑，文件传输模式，复制 **boot.img** 和 **系统包** 到手机 **Download** 目录

五、1.连击LOGO（开启系统更新扩展功能）- 2.手动选择安装包 – 3.选择系统包升级
*（这里是保证 **系统包版本** 和 **手机系统版本** 一致，如果版本一致可以跳过）*

![小米手机安装面具教程（Xiaomi手机获取root权限）插图](./assets/65211665635f0.jpg)

六、手机下载安装**Magisk** app：[Magisk-download](https://magiskcn.com/magisk-download)

七、1.安装 – 2.选项 **都不勾**（勾了会卡米，部分手机没有选项）- 3.选择并修补一个文件

![小米手机安装面具教程（Xiaomi手机获取root权限）插图1](./assets/6521166664038.jpg)

八、4.选择**boot.img** – 5.开始 – 6.修补成功

![小米手机安装面具教程（Xiaomi手机获取root权限）插图2](./assets/6521166633fb8.jpg)

九、修补成功，会在 **Download** 目录生成（**magisk_patched-版本_随机.img**）文件，每次生成的随机字符都不一样，使用的时候请输入生成的名字。

![小米手机安装面具教程（Xiaomi手机获取root权限）插图3](./assets/652116654f2ea.jpg)

十、电脑下载 **adb-fastboot**：[lanzoub.com/b02plghuh](https://mrzzoxo.lanzoub.com/b02plghuh)（解压出来）

十一、手机插电脑，文件传输模式，把 **boot.img** 和 **magisk_patched-版本_随机.img** 两个文件复制到 **adb-fastboot** 目录

![小米手机安装面具教程（Xiaomi手机获取root权限）插图4](./assets/652116657b434.png)

十二、手机重启到 **fastboot** 模式（按电源键重启 马上按住 音量键 –）插上电脑

十三、打开“**打开CMD命令行.bat**”，输入下面的命令

```
fastboot flash boot 面具文件
```

![小米手机安装面具教程（Xiaomi手机获取root权限）插图5](./assets/652116654efc8.png)

十四、出现下面这三行代码，就是成功刷入了。

```
Sending 'boot' (131072 KB) OKAY [ 3.311s]
Writing 'boot' OKAY [ 0.441s]
Finished. Total time: 3.794s
```

十五、重启手机（开机有震动基本没问题了）耐心等手机开机。（显示Magisk的版本，就是刷好了的）

![一加手机安装面具教程（一加手机获取root权限）插图6](./assets/652116679194b.jpg)

**温馨提示**
如果刷模块不兼容或者其他骚操作导致不能开机，可以把我们前面提取的**boot.img**通过**fastboot**刷回去，恢复原系统，一般都能正常开机！
**boot.img**保留一份在电脑，避免出问题了可以自救下！还原boot指令

```
fastboot flash boot boot.img
```

后期系统更新，直接下载全量完整包升级，然后重复上面的步骤就可以继续愉快的使用**Magisk**了！