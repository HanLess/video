## ftyp box buffer

这里的内容被固定，是 Uint8Array 类型

```
const content = new Uint8Array([
  0x69, 0x73, 0x6F, 0x6D, // major_brand: isom
  0x00, 0x00, 0x00, 0x01, // minor_version: 0x01
  0x69, 0x73, 0x6F, 0x6D, // isom
  0x61, 0x76, 0x63, 0x31, // avc1
])
```

然后再拼上 8 个字节，分别是 size 和 type

```
function generateBox(type, content) {
  return concatTypedArray(
    num2FourBytes(content.length + 8),
    str2TypedArray(type),
    content
  )
}
```

<a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/%E4%BD%8D%E8%BF%90%E7%AE%97_%E6%95%B0%E5%AD%97%E8%BD%AC%E5%9B%9B%E4%B8%AA%E5%AD%97%E8%8A%82%E4%BA%8C%E8%BF%9B%E5%88%B6.md">num2FourBytes</a>

<a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/%E5%AD%97%E7%AC%A6%E4%B8%B2%E8%BD%AC%20Uint8Array.md">str2TypedArray</a>

<a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/%E6%8B%BC%E6%8E%A5%20Uint8Array.md">concatTypedArray</a>

至此，ftype box 就拼好了

## MP4Probe 

这里封装了 mp4 文件的一些基本信息

```
{
  duration,                                   // mvhd box 中的 duration
  timescale,                                  // mvhd box 中的 timescale
  channelCount,                               // audio track 中 stsd box mp4a 中的内容，音频的一些信息 
  sampleRate,                                 // audio track 中 stsd box mp4a 中的内容，音频的一些信息
  audioConfig,                                // audio track 中 stsd box mp4a 中的内容，音频的一些信息
  audioDuration,                              // audio track Mdhd box 中的 duration
  audioTimescale,                             // audio track Mdhd box 中的 timescale
  width,                                      // video track tkhd 中的 width
  height,                                     // video track tkhd 中的 height
  SPS,                                        // 视频编码相关的参数，不是很懂
  PPS,                                        // 视频编码相关的参数，不是很懂
  videoDuration,                              // video track Mdhd box 中的 duration
  videoTimescale,                             // video track Mdhd box 中的 timescale
  videoSamplesLength: samples.length,         // samples 的数量，samples数组存在 Stsz 中
}
```

生成代码

```
const {duration, timescale} = findBox(this.mp4BoxTree, 'mvhd')
const {width, height} = findBox(this.mp4BoxTree, 'videoTkhd')
const {samples} = findBox(this.mp4BoxTree, 'videoStsz')
const {SPS, PPS} = findBox(this.mp4BoxTree, 'avcC')
const {channelCount, sampleRate} = findBox(this.mp4BoxTree, 'mp4a')
const {timescale: audioTimescale, duration: audioDuration} = findBox(
  this.mp4BoxTree,
  'audioMdhd'
)
const {timescale: videoTimescale, duration: videoDuration} = findBox(
  this.mp4BoxTree,
  'videoMdhd'
)
const {
  ESDescrTag: {
    DecSpecificDescrTag: {audioConfig},
  },
} = findBox(this.mp4BoxTree, 'esds')

this.mp4Data = {
  duration,
  timescale,
  width,
  height,
  SPS,
  PPS,
  channelCount,
  sampleRate,
  audioConfig,
  audioDuration,
  videoDuration,
  audioTimescale,
  videoTimescale,
  videoSamplesLength: samples.length,
}
```

## moov box buffer

video 和 audio 的 moov 会分开组装，最后通过各自的 sourceBuffer.appendBuffer ，加入各自的 sourceBuffer 中

```
const content = concatTypedArray(
  mvhd(data),
  trak({...data, type}),
  mvex(data)
)
return generateBox('moov', content)
```

mvex 是转为 fmp4 格式的关键内容之一



