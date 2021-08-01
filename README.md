# PervertDetection

IBM 暑期實習期末Demo

## 啟動方式：

```bash
npm install
ng serve -o
```

## 啟用 Signal Server
Repo 連結: [PervertDetectionServer](https://github.com/jordanSu/PervertDetectionServer)

```bash
git clone git@github.com:jordanSu/PervertDetectionServer.git
cd PervertDetectionServer
npm install
node index.js
```
##  啟動串流
1. 開啟擷取Video頁面, [https://localhost:4200/monitoring](https://localhost:4200/monitoring)
2. 開啟播放Video頁面, [https://localhost:4200/dashboard](https://localhost:4200/dashboard)

## SSL/TLS憑證製作 (MacOS)

### CA製作
1. 開啟Keychain Access.app
2. 製作root CA: 點選 keychain Access -> Certificate Assistant -> Create A Certificate Authority -> User Certificate 選 SSL Server -> 點選Create 
3. 回到Keychain Access列表, 點選上述CA憑證, 右鍵選取get info -> 點選Trust頁籤 -> When using this certificate 切成 always trust
4. 右鍵點選CA -> 以Cer繪出該CA憑證
5. 利用AirDrop丟至iPhone, 並點選安裝
6. 於iPhone點選 Setting -> General -> About -> Certificate Trust Settings -> 啟動對應CA

### 憑證製作
1. 點選 keychain Access -> Certificate Assistant -> Request Certificate From a Certificate Authority
2. Common Name 改成網站IP or Domain name, 點選saved to disk, 存成CSR.certSigningRequest
3. 點選 keychain Access -> Certificate Assistant -> Create a Certificate For Someone Else as a Certificate Authority
4. 丟入CSR.certSigningRequest於上述對話
5. 回到Keychain Access列表, 點選上述憑證, 右鍵匯出.p12檔
6. 匯出server.crt檔
```bash
openssl pkcs12 -in Certificates.p12 -out server.crt -clcerts -nokeys
```

7. 匯出server.key檔
```bash
openssl pkcs12 -in Certificates.p12 -out server.key -nocerts -nodes
```

### This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.1.5.

