<a href="https://github.com/HanLess/fmp4Conversor">fmp4Conversor</a>

MSE 要求视频格式是 fmp4，但大部分用户上传的视频是 mp4 格式，这就需要我们的播放器提供在线转码的功能

分两步：

（1）封装 fype moov box

（2）封装 moof mdat box

#### 整体过程

第一步相对简单，第二步需要通过 moov trak 中的 sample 信息，把视频数据分片，封装到相应的 moof mdat 中，可以理解为：用 moof 代替了 trak 中的 sample 定位信息

然后 mdat 从一个整块数据，分成数个 segment。

在 MSE 中，MediaSource.addSourceBuffer 可以添加音频和视频

```
video: 'video/mp4; codecs="avc1.42E01E"',
audio: 'audio/mp4; codecs="mp4a.40.2"'
```

得到两个 sourceBuffer，在之后的转码、添加数据过程过，分别针对 音频/视频 trak 提取出相应的 moof mdat box，并通过 sourceBuffer.appendBuffer 
添加到 MediaSource 中，音频和视频轨道分开处理、转码、添加，<video> 会自动完成合成


#### 相关细节

通过 arraybuffer 格式分片请求数据，根据 moov trak 中的 sample 定位信息来处理这个数据片，注意每次请求的都是原 mp4 文件中的 mdat 中的 数据片

fmp4Conversor 工具生成的 fmp4 文件不稳定，主要因为本人对 mp4 格式了解不深，转码过程比较复杂且不懂原理，只能根据大概思路扒 griffith 中的有效代码，但效果不好，可以用于1分钟以下的小文件
