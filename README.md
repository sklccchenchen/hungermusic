## 菜鸟音乐
### 功能介绍：
本音乐项目实现了基本音乐播放器功能，通过ajax向后端请求数据在前端灵活切换，能够播放、暂停和切换音乐，并且html界面协同切换，当前歌曲播放时间、进度条、及歌词同步更新显示。
### 技术细节：
本项目的大致思路为首先ajax获取数据，将图文数据转换处理后展示展示到页面，音频数据在新建一个Audio对象之后可通过该对象来获取操作音频数据，对静态界面上的图标绑定事件实现基本的暂停/播放/下一曲等功能，界面的main和footer两个部分之间交互通过EventCenter实现，footer中album切换时main会通过事件中心监听到，进行歌曲和背景、歌手、歌词相应的切换。
### 技术栈关键字：JQuery/CSS3/js/ajax/event/eventCenter/适配/jQuery插件

