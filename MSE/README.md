<a href="https://blog.csdn.net/baozi520cc/article/details/27832019">MP4解析,包含moof</a>


MES技术需要使用 fmp4 格式的视频文件，与 mp4 的区别在于：文件 box 中新增了 segment index box 信息，可以根据字节位置来分片，前端视频中的分片下载播放也是基于这个


## http 相关报文

```
response：

Content-Range: bytes 6079549-6603773/20633151

Content-Length: 524225

request：

Range: bytes=645879-1478445
```

在请求时设置 Range 请求头报文，可以实现分片请求视频资源，收到的数据是 ArrayBuffer 类型

## ArrayBuffer

二进制数组，无法直接进行读写操作，通过视图来读写（TypedArray 视图和 DataView 视图），视图的作用是以指定格式解读二进制数据。

在 Javascript 中，Mp4 的所有 box 全部由通过 new Uint8Array() 实现。


## 方案

在初始化阶段，把视频信息 box（fype , moov）添加到 sourceBuffer 中，这里的关键是 mp4 box 剥离。<a href='https://github.com/HanLess/mp4-reader'>mp4-reader</a>

通过 timeUpdate 事件驱动加载视频数据片 <a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/MSE/%E4%BB%80%E4%B9%88%E6%97%B6%E5%80%99%E8%AF%B7%E6%B1%82%E4%B8%8B%E4%B8%80%E4%B8%AA%E6%95%B0%E6%8D%AE%E7%89%87.md">什么时候请求下一个数据片</a>

把 mp4 格式转为 fmp4 <a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/MSE/mp4%E8%BD%AC%E7%A0%81fmp4.md">mp4转码fmp4</a>

视频在分段加载播放的时候，快进可能导致 mediaSource.readyState 变为 end，sourceBuffers.video.timestampOffset = 0 可从新开启

但防止某些极端情况，还是要在 appendBuffer 时判断 mediaSource.readyState 状态，如果是 end，要通过栈结构暂存视频数据 buffer

切换清晰度，通过 video.currentTime 来记录当前播放时间，在切换前要清除旧的 buffer 数据。

