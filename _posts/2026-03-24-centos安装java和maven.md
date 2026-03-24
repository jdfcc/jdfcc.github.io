---
layout:     post
title:      centos安装java和maven
date:       2026-03-24
author:     jdfcc
catalog:    true
tags:
    - Blog
---

### 下载java

```xml
yum search java|grep jdk
```

### 下载maven

```shell
mkdir /opt/maven && cd /opt/maven
wget https://dlcdn.apache.org/maven/maven-3/3.9.5/binaries/apache-maven-3.9.5-bin.tar.gz
```



### 解压

```
tar xzvf apache-maven-3.9.5-bin.tar.gz
```


路径是：/opt/maven/apache-maven-3.9.5
#### 配置 PATH

```shell
vim /etc/profile
-----------在/etc/profile文件中添加下面的内容。一般添加在最后面。-----------
MAVEN_HOME=/opt/maven/apache-maven-3.9.5
PATH=$PATH:$MAVEN_HOME/bin
export PATH MAVEN_HOME
```

配置修改完成后，有立即生效的需求时，使用命令：``source /etc/profile``
上面是针对使用ssh的配置。如果是使用gui，在vi /etc/bashrc文件中重复上面的配置。

检查mvn是否配置完成

```
 mvn -v
```

#### 修改localRepository

创建仓库

```shell
mkdir /opt/maven/apache-maven-3.9.5/maven_repo
```



```shell
vim /opt/maven/apache-maven-3.9.5/conf/settings.xml
```

在settings.xml文件localRepository节点添加/修改

```xml
 <localRepository>/opt/maven/apache-maven-3.9.5/maven_repo</localRepository>
```

默认情况下，localRepository配置项未配置。此时，使用默认的路径（${user.home}/.m2/repository）。
上面的配置中，我将localRepository改为/opt/maven/apache-maven-3.9.5/maven_repo。

#### 添加aliyun镜像

```xml
 vim /opt/maven/apache-maven-3.9.5/conf/settings.xml
```

在settings.xml文件的mirrors节点下添加/修改

```xml
<mirror>
  <mirrorOf>central</mirrorOf>
  <id>aliyun-public</id>
  <name>aliyun maven public repository</name>
  <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

参考
http://maven.apache.org/install.html
http://maven.apache.org/settings.html