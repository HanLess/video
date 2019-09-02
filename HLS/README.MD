hls : http live streamimg

m3u8 文件格式如下

```
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:17
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:11.910889,
index0.ts  
#EXTINF:16.601022,
index1.ts  
#EXTINF:5.088756,
index2.ts  
#EXTINF:9.051311,
index3.ts  
#EXTINF:7.466289,
index4.ts  
#EXTINF:14.724022,
index5.ts  
```

请求 ts 资源会返回视频内容

在移动端可以直接播放 m3u8 格式文件，如下

```
<video width="300" height="200" 
       playsinline webkit-playsinline
       autoplay controls preload="auto"
       x-webkit-airplay="true" x5-video-player-fullscreen="true" x5-video-player-typ="h5">
    <source src="http://live.zzbtv.com:80/live/live123/800K/tzwj_video.m3u8" type="application/x-mpegURL">
</video>

```

在 pc 上需要把 m3u8 文件转码，目前成熟的转码工具有：

<a href="https://github.com/video-dev/hls.js">hls.js</a>


```
<video id="hls_player" width="600" height="400" controls></video>
<script src="//cdn.bootcss.com/hls.js/8.0.0-beta.3/hls.min.js"></script>
<script>
  const hlsVideo = document.getElementById('hls_player');
  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource('xxx.m3u8');
    hls.attachMedia(hlsVideo);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      hlsVideo.play();
    });
  }
</script>
```

<a href="https://github.com/videojs/videojs-contrib-hls">videojs-contrib-hls.js</a>


```
<video id="hls-video" width="300" height="200" class="video-js vjs-default-skin"
       playsinline webkit-playsinline
       autoplay controls preload="auto"
       x-webkit-airplay="true" x5-video-player-fullscreen="true" x5-video-player-typ="h5">
    <!-- 直播的视频源 -->
    <source src="http://live.zzbtv.com:80/live/live123/800K/tzwj_video.m3u8" type="application/x-mpegURL">
    <!-- 点播的视频源 -->
    <!--<source src="http://devstreaming.apple.com/videos/wwdc/2015/413eflf3lrh1tyo/413/hls_vod_mvp.m3u8" type="application/x-mpegURL">-->
</video>

<script src="http://cdn.bootcss.com/video.js/6.0.0-RC.5/video.js"></script>
<!-- PC 端浏览器不支持播放 hls 文件(m3u8), 需要 videojs-contrib-hls 来给我们解码 -->
<script src="http://cdn.bootcss.com/videojs-contrib-hls/5.3.3/videojs-contrib-hls.js"></script>
<script>
    // XMLHttpRequest cannot load http://xxx/video.m3u8. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://192.168.198.98:8000' is therefore not allowed access.
    // 由于 videojs-contrib-hls 需要通过 XHR 来获取解析 m3u8 文件, 因此会遭遇跨域问题, 请设置浏览器运行跨域
    var player = videojs('hls-video');
    player.play();
</script>
```

