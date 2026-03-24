---
layout:     post
title:      兰空图床（docker版本）安装以及PicGo与Typora整合教程：
date:       2026-03-24
author:     jdfcc
catalog:    true
tags:
    - Blog
---

# 兰空图床（docker版本）安装以及PicGo与Typora整合教程：

# 安装图床

项目地址： [halcyonazure/lsky-pro-docker - Docker Image | Docker Hub](https://hub.docker.com/r/halcyonazure/lsky-pro-docker)

## 1.拉取镜像命令：

```shell
docker pull halcyonazure/lsky-pro-docker
```

## 2.安装环境要求: 

本地mysql版本5.7及以上。防火墙以及安全组开放8089端口

## 3.运行：

```shell
docker run -d \
    --name lsky-pro \
    --restart unless-stopped \
    -p 8089:8089 \
    -v $PWD/lsky/web:/var/www/html \
    -e WEB_PORT=8089 \
    halcyonazure/lsky-pro-docker:latest
```

## 4.进入图床:

GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'admin' WITH GRANT OPTION;

使用 ip+8080方式进入图床。如 http://120.55.80.133:8089。至此图床安装完成。

<img src="https://jdfcc.pro:8088/i/2023/05/19/646705022c839.png" alt="image-20230519131128620" style="zoom: 50%;" />

## 5.使用https进入（非必须）：

由于本人有强迫症，使用ip+端口的方式访问看着不是很美观，故决定使用https访问。

### Nginx配置反向代理：

```
server {
    listen 8088 ssl;
    server_name lsky;

     ssl_certificate    /www/server/panel/vhost/cert/jdfcc.pro/fullchain.pem;
    ssl_certificate_key    /www/server/panel/vhost/cert/jdfcc.pro/privkey.pem;

    location / {
      proxy_pass http://127.0.0.1:8089;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-Port 8088;
    }
}

```

将此代码添加至你的``nginx.conf``文件中，需要注意的是，``ssl_certificate``和``ssl_certificate_key``为你的ssl证书和sslkey储存目录（若没有ssl证书可向``Let's Encrypt``申请，这里不再赘述。），一定要根据自己的实际情况修改。同时，还需在``防火墙``以及对应的服务器提供商的``安全组``中开发8088端口以让Nginx正常监听到。

### 访问方式：

域名加8088端口方式访问。如 https://jdfcc.pro:8088。设置好后若图床能正常访问，则需要在``储存策略/访问网址中修改访问网址。如图``

<img src="https://jdfcc.pro:8088/i/2023/05/19/646709a72d3f6.png" alt="image-20230519133117777" style="zoom:67%;" />

将其中的``jdfcc.pro``修改为自己的域名即可。

# Typora整合PicGo：



## 获取token：

接口url为 ``https://你的域名:8088/api/v1`` 

使用[postman](https://www.postman.com/)或者[ApiFox](https://apifox.com/)发送请求即可。
链接请求体为``email`` 和 ``password`` 。其中email为你安装图床时设置的邮箱，password为你安装图床时设置的密码。请求方法为post

![image-20230519133917206](https://jdfcc.pro:8088/i/2023/05/19/64670b869fa1c.png)



请求成功后服务器会返回给你这样一段json：

![image-20230519134017545](https://jdfcc.pro:8088/i/2023/05/19/64670bc2e6eca.png)

将token里面的数据复制下来，不要带双引号。形如 ``1|dsasdjsahjdsauhdahusdhaihdsah`` 。

## 配置PicGo

进入PicGo。点击图床设置，选择``lankong`` 

<img src="https://jdfcc.pro:8088/i/2023/05/19/64670c5466279.png" alt="image-20230519134242973" style="zoom:67%;" />

``server`` 根据自己情况填写，注意，``Auth token`` 填写刚刚获得的token时，要在前面添加单词``Bearer`` 并于自己的token隔一个空格。

形如： ``Bearer 1|asddssasaddfdfds`` 。至此PicGo设置完成。

## 整合Typora：

进入Typora，选择``文件/偏好设置/图像``。设置如图

![image-20230519134817854](https://jdfcc.pro:8088/i/2023/05/19/64670da353f42.png)

至此整合完成。







