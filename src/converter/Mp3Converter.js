import lamejs from 'lamejs'

export default class Mp3Converter {
  constructor (channel) {
    this.channel = channel
  }

  convert() {
    const mp3Data = []
    const mp3encoder = new lamejs.Mp3Encoder(1, this.audioPlayer.ctx.sampleRate, 128)
    const supportChannel = new Int16Array(this.channel.length)
    let multipler = Math.pow(2,15)
    for(let i = 0; i < this.this.channel.length; i++) {
      supportChannel[i] = (this.channel[i]) * multipler
    }
    const samples = supportChannel //one second of silence (get your data from the source you have)
    const sampleBlockSize = 1152 //can be anything but make it a multiple of 576 to make encoders life easier
    while(mp3Data.length == 0){
      const mp3buf = mp3encoder.encodeBuffer(new Int16Array(1152))
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf)
      }
    }
    for (let i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize)
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf)
      }
    }
    let mp3buf = mp3encoder.flush()   //finish writing mp3
  
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf))
    }

    return mp3Data
  }
}