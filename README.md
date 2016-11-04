# zepto.pin.js

Ever wanted to pin something to the side of a text? Ever needed a subtle sticky element to quietly hang around as you scroll down?
Zepto.Pin is here to help! Pin any element to the top of a container. Easily disable it for smaller screen-sizes where there's no room for that kind of shenanigans.

##Usage

Include zepto and zepto pin at the bottom of your html. Then pin any element you want like this:
```javascript
$(".pinned").pin();
```
To make a pinned element stay within an outer container, use the containerSelector option:
```
$(".pinned").pin({containerSelector: ".container"});
```
Padding can also be added around the pinned element while scrolling:
```javascript
$(".pinned").pin({padding: {top: 10, bottom: 10}});
```
That's it - go pin all the things!

##用法

钉住指定元素在body容器
```javascript
$(".pinned").pin();
```
钉住指定元素在指定父元素容器
```javascript 
 $(".pinned").pin({containerSelector: ".container"})
```
设置被钉住元素的在容器内的偏移量
```javascript
$(".pinned").pin({padding: {top: 10, bottom: 10}});
```
钉住效果产生时可以动态添加样式
```javascript
$(".pinned").pin({activeClass: "className"}});
```

