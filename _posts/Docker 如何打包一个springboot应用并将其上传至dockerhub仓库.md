# Docker 如何打包一个springboot应用并将其上传至dockerhub仓库

## 构建一个镜像

1. 创建`Dockerfile`文件。注意此处的`Dockerfile`的命名,docker对大小写敏感。

   ```shell
   # 使用一个基础镜像，可以根据您的需求选择不同的基础镜像
   FROM openjdk:8-jre-alpine
   
   # 设置工作目录
   WORKDIR /app
   
   # 复制编译好的Spring Boot应用程序JAR文件到容器中
   COPY target/Cang-1.0.jar app.jar
   
   # 暴露应用程序所需的端口（如果有的话）
   EXPOSE 8080
   
   # 启动应用程序
   CMD ["java","-jar","app.jar"]
   
   
   ```

   将上述示例中的 `your-application.jar` 替换为您实际的Spring Boot应用程序JAR文件的名称。

2. **构建Docker镜像：** 在命令行中，进入包含Dockerfile的目录，并执行以下命令以构建Docker镜像：

   ```shell
   docker build -t your-image-name:tag .
   ```

   请将 `your-image-name` 替换为您想要为Docker镜像指定的名称，将 `tag` 替换为您想要的标签。

3. **运行Docker容器：** 使用以下命令运行您的Spring Boot应用程序的Docker容器：

   ```shell
   #第一个端口代表宿主机端口，第二个8080代表spring应用的实际端口。使用此命令会将宿主机端口映射至容器端口
   docker run -p 8080:8080 your-image-name:tag
   ```

   这会将容器的8080端口映射到主机的8080端口。您可以根据您的Spring Boot应用程序的端口配置进行适当的调整。

   



## 上传此镜像


要将您的Docker镜像上传到Docker Hub或其他Docker容器注册表，您需要遵循以下步骤：

1. **登录到Docker Hub：** 如果您还没有Docker Hub帐户，请在[Docker Hub](https://hub.docker.com/)上创建一个。然后，使用以下命令登录到Docker Hub：

   ```shell
   docker login
   ```

   输入您的Docker Hub用户名和密码。

2. **重新标记镜像：** 您需要为您的镜像重新标记以包括您的Docker Hub用户名或组织名称。使用以下命令：

   ```shell
   docker tag your-image-name:tag your-dockerhub-username/your-image-name:tag
   ```

   将 `your-image-name:tag` 替换为您之前创建的镜像名称和标签，将 `your-dockerhub-username` 替换为您的Docker Hub用户名。

3. **上传镜像：** 使用以下命令将标记的镜像上传到Docker Hub：

   ```shell
   docker push your-dockerhub-username/your-image-name:tag
   ```

   这会将镜像上传到您的Docker Hub帐户中。请确保您已登录到正确的帐户。

4. **验证镜像：** 登录到[Docker Hub网站](https://hub.docker.com/)，导航到您的帐户，您应该能够在那里看到刚刚上传的镜像。

现在，您的Docker镜像已经上传到Docker Hub。其他用户可以使用以下命令来从Docker Hub拉取您的镜像：

```shell
docker pull your-dockerhub-username/your-image-name:tag
```

确保将 `your-dockerhub-username/your-image-name:tag` 替换为您实际的镜像名称和标签。

