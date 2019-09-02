## mp4 文件格式

由多个box组成，主要包括：视频类型（ftyp）、视频数据（mdat）、视频信息（moov）；moof box 仅在流式 MP4中使用（FMP4）

在分析 box 内容的时候，需要读取字节，将会大量运用位运算

<a href="https://github.com/HanLess/experience/blob/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/%E4%BA%8C%E8%BF%9B%E5%88%B6%E6%93%8D%E4%BD%9C/%E4%BD%8D%E8%BF%90%E7%AE%97_%E6%8A%BD%E5%8F%96%E6%9F%90%E4%B8%AA%E5%AD%97%E8%8A%82.md">读取某几个字节</a>

## box

Box 由 header 和 body 组成，以 32 位的 4 字节整数存储方式存储到内存。

header 前4个字节（32位）为 box size，后面紧跟的 4 个字节为 box type（ftyp moov ...）。

body可以由数据组成，也可以由子box组成。

一个 box 的 size 只可能大于等于 8

如果从 readSize 中解析出来的 mdat size 为 1，则表明此视频比较大，需要 type 后的 8 个字节来计算实际大小

#### Mdat box

Mdat box数据格式单一，无子box。主要分为box header 和box body，box header中存放box size 和box type（mdat），box body中存放所有媒体数据，媒体数据以sample为数据单元。

这里使用时，视频数据中，每一个sample是一个视频帧，存放sample时，需要根据帧数据类型进行拼帧处理后存放。

### Mdat box中，可能会使用到box的large size，当数据足够大，无法用4个字节来描述时，便会使用到large size。在读取MP4文件时，当mdat box的size位为1时，真正的box size在large size中

```
if (this.size === 1) {
  this.size = stream.readByte(4) << 32
  this.size |= stream.readByte(4)
}
```

#### Moov box

只能有一个 Moov box，存放着媒体信息，Moov box 主要包含 mvhd、trak、mvex三种子box。

#### Mvhd box

Mvhd box定义了整个文件的特性，尺寸、类型、版本、生成时间等信息。

timescale：表示本文件的所有时间描述所采用的单位

duration：媒体可播放时长，这个数值的单位与实际时间的对应关系就要通过上面的timescale参数来计算。

duration / timescale = 可播放时长（s）。

#### trak box

一个Track box定义了movie中的一个track。一部movie可以包含一个或多个tracks，它们之间相互独立，各自有各自的时间和空间信息。每个track box 都有与之关联的 mdat box。

使用 mdia.hdlr.handlerType 来判断是音频还是视频 trak。

vide：视频

soun：音频

hint：这个特殊的track并不包含媒体数据，而是包含了一些将其他数据track打包成流媒体的指示信息。

#### sample & chunk

sample是媒体数据存储的单位，存储在media的chunk中，chunk和sample的长度均可互不相同，如下图所示。

<img src="https://raw.githubusercontent.com/HanLess/experience/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/img/chunk.webp" />

#### stsd（Sample Description Box）

“stbl”包含了关于track中sample所有时间和位置的信息，以及sample的编解码等信息。

利用这个表，可以解释sample的时序、类型、大小以及在各自存储容器中的位置。

“stbl”是一个container box，其子box包括：

sample description box（stsd）

time to sample box（stts）

sample size box（stsz或stz2）

sample to chunk box（stsc）

chunk offset box（stco或co64）

composition time to sample box（ctts）

sync sample box（stss）等。

#### Sample Description Box（stsd）

“stsd”必不可少，且至少包含一个条目，该box包含了data reference box进行sample数据检索的信息。没有“stsd”就无法计算media sample的存储位置。“stsd”包含了编码的信息，其存储的信息随媒体类型不同而不同。

box header和version字段后会有一个entry count字段，根据entry的个数，每个entry会有type信息，如“vide”、“sund”等，根据type不同sample description会提供不同的信息，例如对于video track，会有“VisualSampleEntry”类型信息，对于audio track会有“AudioSampleEntry”类型信息。

### 视频的编码类型、宽高、长度，音频的声道、采样等信息都会出现在这个box中。

#### Time To Sample Box（stts）

“stts”存储了sample的duration，描述了sample时序的映射方法，我们通过它可以找到任何时间的sample。“stts”可以包含一个压缩的表来映射时间和sample序号，用其他的表来提供每个sample的长度和指针。表中每个条目提供了在同一个时间偏移量里面连续的sample序号，以及samples的偏移量。递增这些偏移量，就可以建立一个完整的time to sample表。

#### Sample Size Box（stsz）

“stsz” 定义了每个sample的大小，包含了媒体中全部sample的数目和一张给出每个sample大小的表。这个box相对来说体积是比较大的。

#### Sample To Chunk Box（stsc）

用chunk组织sample可以方便优化数据获取，一个thunk包含一个或多个sample。“stsc”中用一个表描述了sample与chunk的映射关系，查看这张表就可以找到包含指定sample的thunk，从而找到这个sample。

#### Sync Sample Box（stss）

“stss”确定media中的关键帧。对于压缩媒体数据，关键帧是一系列压缩序列的开始帧，其解压缩时不依赖以前的帧，而后续帧的解压缩将依赖于这个关键帧。“stss”可以非常紧凑的标记媒体内的随机存取点，它包含一个sample序号表，表内的每一项严格按照sample的序号排列，说明了媒体中的哪一个sample是关键帧。如果此表不存在，说明每一个sample都是一个关键帧，是一个随机存取点。

#### Chunk Offset Box（stco）

“stco”定义了每个chunk在媒体流中的位置。位置有两种可能，32位的和64位的，后者对非常大的电影很有用。在一个表中只会有一种可能，这个位置是在整个文件中的，而不是在任何box中的，这样做就可以直接在文件中找到媒体数据，而不用解释box。需要注意的是一旦前面的box有了任何改变，这张表都要重新建立，因为位置信息已经改变了。

#### mp4 box 结构图

<img src="https://raw.githubusercontent.com/HanLess/experience/master/js/%E8%A7%86%E9%A2%91%E6%8A%80%E6%9C%AF/img/%E7%BB%93%E6%9E%84.jpg%40932w_1380h.webp" />

作者：小林家的垃圾王R
https://www.bilibili.com/read/cv980333/
出处： bilibili
