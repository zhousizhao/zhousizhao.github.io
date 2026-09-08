---

name: ESP32 Portable Multifunction Tool

title: ESP32便携多功能工具

stack: ESP32-S3 / TP4056 / INA226 / MPU6050 / CH343P / ESP-NOW / TCP / PWM

icon: cpu

image: /assets/images/project/esp32-tool/esp32-tool.jpg

link: https://oshwhub.com/zhousizhao666/esp32-portable-multifunction-too?jspm=hub.zy.zp.gc1___hub.zy.zp&jlc_vid=FldYAVNURVdWBlZVQgRWXgZWQlENVgEAFgRaVgVSFAcxVlNeT1lbXlRWTlJYXztWKA4dDxMOAgNABAsL

---

本次项目使用了ESP32S3作为主控使用，屏幕则选择了1.69寸液晶屏(小巧可爱)，电源这边则使用TP4056，同时还附带INA226测量电压(0-36V)，MPU6050陀螺仪模块可以实现晃动切屏这种效果(目前没有写……)。

然后本项目主要的几个功能如下:

***1***：电压测量功能，利用引出的排针通过INA226测量外部电压，范围为0~36V。

***2***：投屏功能，利用TCP协议通过电脑上的图传软件将电脑画面传给ESP32显示从而实现投屏功能（参考的B站UP主:** super大大怪I **）。

**3***：PWM输出功能，可以配置任意占空比0-80kPWM输出。

***4***：无线遥控功能，通过ESP-NOW协议，烧写从机代码到ESP01S里面通过与主机连接就可以实现无线遥控功能。

***5***：舵机测试功能，可以通过外接的5V引脚和GND还有信号引脚可以实现操控舵机的效果。

## 具体电路

### 串口下载电路

使用***CH343P***芯片与ESP32S3进行串口通信下载代码
![串口下载电路](/assets/images/project/esp32-tool/uart_download.webp)

### 电池充电电路

利用**TP4056**对外部外接的锂电池进行充电
![电池充电电路](/assets/images/project/esp32-tool/battery_connect.webp)

### INA226电路

利用***INA226***可以作为一个简单的万用表使用(只有电压测量和电流测量功能)
![INA226电路](/assets/images/project/esp32-tool/ina226_connect.webp)

以上这三部分电路应该算得上是这个项目的关键电路了，特别是串口下载这部分因为我使用的是**CH343P**这个芯片不得不是有点难焊，而且就我以前使用跟焊接的经验来说这块特别容易出问题(具体原因没搞清楚)。

### PCB设计
![PCB设计](/assets/images/project/esp32-tool/pcb_design_top.webp)
![PCB设计](/assets/images/project/esp32-tool/pcb_design_bottom.webp)

### 原理图设计
![原理图设计](/assets/images/project/esp32-tool/schematic_diagram.webp)

### 实物展示
![实物展示](/assets/images/project/esp32-tool/entity1.webp)
![实物展示](/assets/images/project/esp32-tool/entity2.webp)

### 其它功能展示

***具体参考:***[esp32多功工具](https://oshwhub.com/zhousizhao666/esp32-portable-multifunction-too?jspm=hub.zy.zp.gc1___hub.zy.zp&jlc_vid=FldYAVNURVdWBlZVQgRWXgZWQlENVgEAFgRaVgVSFAcxVlNeT1lbXlRWTlJYXztWKA4dDxMOAgNABAsL)

## 项目总结

***本人小白，代码有很多地方写的不好，PCB设计也有很多问题，轻喷感谢。***

本次项目对于我来说是一个里程碑式的项目，也算是我第一次所有东西全部由自己制作的一个项目(PCB,原理图,代码,外壳),做了挺长时间了期间遇到过各种问题，比如再PCB上第一版我使用的是一款比较小的LDO降压给芯片还有其它外设提供3.3V供电，焊接好下载完代码后发现，芯片一直重启，查阅了很多资料发现是芯片低压复位了，也就是说这款LDO的载流能力不够，后面换了一款载流大的LDO后芯片正常工作了，这个项目从预想到实际做出前前后后大概花了我3个多月的时间(断断续续的做所以耗时较长),到现在代码还有很多BUG需要改，很多地方也需要优化，包括PCB这里也是如此，所以当你自己单独去设计一款项目的时候才发现自己还有多少地方没有学会，自己还有很多不足之处。

---
