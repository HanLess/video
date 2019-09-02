import MSE from './controller'

var assetURL = 'http://localhost:8080/zhihu2018_sd.mp4';
var video = document.querySelector('video')
var mse = null
const isSafari = /^((?!chrome|android).)*safari/i.test(
    navigator.userAgent
  )

  var handleTimeUpdate = e => {
    mse.handleTimeUpdate()
  }

  var handleVideoSeeking = e => {
    const currentTime = video.currentTime
    const buffered = video.buffered
    if (isSafari) {
      if (currentTime - 0.1 > buffered.start(0)) {
        mse.seek(video.currentTime)
      } else if (currentTime < buffered.start(0)) {
        handleSafariBug()
        return
      }
    } else {
      mse.seek(video.currentTime)
    }
  }

  var handlePlay = e => {
    const {currentTime} = video
    if (currentTime === 0) {
      mse.seek(0)
    }

  }

  var handleVideoProgress = e => {
    const buffered = video.buffered
    const currentTime = video.currentTime
    if (isSafari && buffered.length > 0 && currentTime < buffered.start(0)) {
      handleVideoSeeking()
    }
  }

  // 如果当前时间为 0，safari 浏览器需要把 currentTime 设置成 buffered.start(0) 右边一点点的位置
  // 否则 MSE 无法正常播放，会卡在 loading 状态。
  var handleSafariBug = () => {
    const start = video.buffered.start(0)
    video.currentTime = start + 0.1
  }

export default function() {
    video.setAttribute('preload','metadata')
    video.setAttribute('sources',[{
      format: "mp4",
      quality: "sd",
      source: "http://localhost:8080/zhihu2018_sd.mp4"
    }])
    video.setAttribute('src', "http://localhost:8080/zhihu2018_sd.mp4")
    
    video.addEventListener('seeking',handleVideoSeeking)
    video.addEventListener('progress',handleVideoProgress)
    video.addEventListener('play',handlePlay)
    video.addEventListener('timeupdate',handleTimeUpdate)

    mse = new MSE(video, assetURL)

    mse.init().then(() => {
      handlePlay()
    })
}