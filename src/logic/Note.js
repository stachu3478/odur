export default class Note {
  constructor (pitch, time, length, volume, instrument, vCurve) {
    this.pitch = pitch
    this.time = time
    this.length = parseInt(length) || 1
    this.volume = (volume || 100) / 100
    this.instrument = instrument || 0
    this.vCurve = vCurve || false
  }
}