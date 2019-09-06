#### 事件驱动

- Hls extends Observer extends EventEmitter
- Hls constructor 中实例化各种控制器，且把此 Hls 实例传入

```
const abrController = this.abrController = new config.abrController(this); // eslint-disable-line new-cap
const bufferController = new config.bufferController(this); // eslint-disable-line new-cap
const capLevelController = this.capLevelController = new config.capLevelController(this); // eslint-disable-line new-cap
const fpsController = new config.fpsController(this); // eslint-disable-line new-cap
const playListLoader = new PlaylistLoader(this);
const fragmentLoader = new FragmentLoader(this);
const keyLoader = new KeyLoader(this);
const id3TrackController = new ID3TrackController(this);
```

- 控制器都会继承 EventHandler
- 控制器在实例化时，会执行 registerListeners，让 Hls 实例（传进来的）监听各种事件列表

```
registerListeners () {
  if (this.isEventHandler()) {
    this.handledEvents.forEach(function (event) {
      if (FORBIDDEN_EVENT_NAMES[event]) {
        throw new Error('Forbidden event-name: ' + event);
      }

      this.hls.on(event, this.onEvent);
    }, this);
  }
}
```

- 至此，Hls 实例完成了监听步骤
- 调用 hls API 的时候，会触发 this.trigger ，从而触发 emit，最后触发所监听的事件
- on , emit 都是继承 EventEmitter 的方法

#### hls 所有流程都是这个逻辑触发

流视频的处理思路与 MSE 一样，都是分片请求视频流，进行转码处理后播放

都是基于 MediaSource ，MSE 模式是自己决定每次请求多少数据（arrayBuffer），而 HLS 是根据 m3u8 来分片请求数据（arrayBuffer）

#### 请求 ts 资源后，拿到 arrayBuffer 数据，hls 会进行转码，MPEG-TS -> ISO-BMFF，由 demux + remux 两部分完成


