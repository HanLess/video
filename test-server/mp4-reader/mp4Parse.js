import Stream from './stream'
import Box from './mp4Box'

export default class MP4Parse {
  constructor(buffer) {
    this.buffer = buffer
    this.stream = new Stream(buffer)
    this.mp4BoxTreeArray = []
    this.mp4BoxTreeObject = {}
    this.init()
  }

  init() {
    this.parse()
  }

  parse() {
    while (this.stream.position < this.buffer.length) {
      const MP4Box = new Box()
      MP4Box.readSize(this.stream)
      MP4Box.readType(this.stream)
      MP4Box.readBody(this.stream)

      MP4Box.box.size = MP4Box.size
      MP4Box.box.type = MP4Box.type

      this.mp4BoxTreeArray.push(MP4Box.box)
      this.mp4BoxTreeObject[MP4Box.type] = MP4Box.box
      this.mp4BoxTreeObject[MP4Box.type].size = MP4Box.size
    }
  }
}
