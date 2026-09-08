---

name: STM32 USB Mini Keyboard

title: STM32 USB小键盘

stack: STM32F103C8T6 / USB / OLED 

icon: cpu

image: /assets/images/project/stm32-usb-keyboard/stm32-usb-keyboard.webp

link: https://oshwhub.com/article/laboratory-stm32usb-keypad-hubei-university-of-arts-and-science-institute-of-technology?jspm=hub.zy.zp.wz3___hub.gc.zp&jlc_vid=FldYAVNURVdWBlZVQgRWXgZWQlENVgEAFgRaVgVSFAcxVlNeT1lbXlRWTlJYXztWKA4dDxMOAgNABAsL

---

本次项目是基于STM32F103C8T6所制作的一款USB小键盘，整个作品包含了7个普通按键，一个旋转编码器，一个1.3寸OLED(0.96可选)，同时每个按键下面都有一个RGB灯可以实现类似机械键盘的氛围灯特点。

## 具体电路

### 旋转编码器电路

这个电路并不是很复杂具体可以参考一下网上的一些优秀开源大佬的项目，如果没有，可以了解一下旋转编码器的工作原理一样能把电路图画出来(所以说数据手册很重要!!!)。
![旋转编码器电路](/assets/images/project/stm32-usb-keyboard/encoder_connect.png)

### 单片机滤波电路

不管在哪种类型的作品中IC的滤波处理是必不可少的，所以这里也需要对主控的供电引脚进行滤波处理。
![单片机滤波电路](/assets/images/project/stm32-usb-keyboard/filter_connect.png)

## PCB设计
![PCB设计](/assets/images/project/stm32-usb-keyboard/pcb_top.png)
![PCB设计](/assets/images/project/stm32-usb-keyboard/pcb_bottom.png)

## 原理图设计
![原理图设计](/assets/images/project/stm32-usb-keyboard/schematic_diagram.png)

## 实物展示
![实物展示](/assets/images/project/stm32-usb-keyboard/entity1.jpg)
![实物展示](/assets/images/project/stm32-usb-keyboard/entity2.jpg)
![实物展示](/assets/images/project/stm32-usb-keyboard/entity3.jpg)

## 项目总结

在本次制作的过程中我遇到了很多的问题，这些问题都对我有很大的帮助正所谓有困难解决困难才会进步，首先说一下出现硬件问题吧。

首先在最初原理图的设计过程中将出现了一个重大问题，在选用元件封装的时候我只关注元件封装大小跟功能从而忽略了其它细节问题，比如在对于RGB灯选型的时候我在原理图上选择的一款RGB灯与我手上现成的RGB灯有两个引脚并不匹配，导致在第一版中RGB灯一直不亮，当初一直以为是软件问题结果经过一段时间的排查发现是封装问题，导致我浪费了很多时间在PCB焊接跟检查上面，有时候细节决定成败这句话并不是空穴来风，因为一个小小的细节问题就会让你整个工程全部毁于一旦，所以这次失误发生后我就格外注意元件引脚之间的关系，同时我也发现嘉立创的BOM配单并不是百分百准确的所以在下单之前应该对芯片，或者功能元件的进行再三检查，这可是一个好习惯。

然后就是软件问题了，在编写RGB这部分程序的时候，起初我本来是想使用IIC通信去驱动RGB灯但是经过理论分析跟实践发现这条路很难行得通因为RGB灯对时序要求非常高达到了us级别所以想用IIC来驱动还是很困难的所以最后选择了SPI通信协议去驱动RGB灯。然后在对于USB通信协议编写的时候我采用了现成的CUBEMX里面的USB驱动库，正所谓一个优秀的工程师不会去重复造轮子的既然有现成的就没必要去浪费时间，但是此USB库只有一些常用的按键报文，而要实现类似于音量加减这些功能按键则需要修改报文，这就要去阅读USB通信协议，这也算是一个很困难的过程了。

以上就是我对于本次项目设计进行的总结，这算得上是我首次“半”设计的一个作品了，从中学到了很多东西受益匪浅，总结就是多多动手才能发现自己的问题不能只是纸上谈兵还得自己亲手实验才是最有效的。

---
