import Encoder from './Encoder'

export default class TimeEncoder {
  constructor (encoder = Encoder) {
    this._currentTones = []
    this._currentToneTime = 0
    this._tuneString = ''
    this._encodedString = ''
    this.encoder = encoder
  }

  get code() {
    return this._encodedString + this.encoder.int11(this._tuneString.length / 3) + this._tuneString
  }

  encode(tones) {
    if (!this._matchTone(tones)) {
      this._flush(tones, this._currentToneTime)
    }
    this._currentToneTime++
  }

  addString(str) {
    this._encodedString += this.encoder.int5(str.length) + str
  }

  addChar(num) {
    this._encodedString += this.encoder.int5(num)
  }

  flush() {
    this._flush([], this._currentToneTime)
  }

  _flush(tones, time, simultaneusNotes = 2) {
    if (time > 0) {
      const toneString = new Array(simultaneusNotes).fill(0).map((_, i) => this.encoder.int5(this._currentTones[i] || 0)).join('')
      this._tuneString += toneString + this.encoder.int5(time)
    }
    this._currentToneTime = 0
    this._currentTones = tones
  }

  _matchTone(tones) {
    return tones.length === this._currentTones.length && this._currentTones.every((tone, i) => tone === tones[i])
  }
}