 **一键脚本**，可以直接把 SMTP 服务器证书保存为 `server.crt` 文件：

------

## 📌 Linux Shell 脚本（保存为 `get_smtp_cert.sh`）

```bash
#!/bin/bash
SMTP_HOST="smtp.qq.com"
SMTP_PORT=465
OUTPUT="server.crt"
echo "Connecting to $SMTP_HOST:$SMTP_PORT to fetch certificate..."
openssl s_client -connect ${SMTP_HOST}:${SMTP_PORT} -showcerts </dev/null 2>/dev/null | sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > $OUTPUT
if [ -s "$OUTPUT" ]; then
  echo "Certificate saved to $OUTPUT"
else
  echo "Failed to fetch certificate. Please check host/port or firewall."
fi
```

------

## 📌 使用方法

1. 保存脚本：

   ```bash
   nano get_smtp_cert.sh
   ```

   粘贴进去。

2. 给执行权限：

   ```bash
   chmod +x get_smtp_cert.sh
   ```

3. 运行（替换成你自己的 SMTP 地址和端口）：

   ```bash
   ./get_smtp_cert.sh
   ```

4. 成功后会得到一个 `server.crt` 文件，用 `keytool` 导入：

   ```bash
   keytool -import -trustcacerts -alias smtp_example_com \
     -file server.crt \
     -keystore $JAVA_HOME/lib/security/cacerts
   ```

