export default class PiezoConverter {
  convert(sortedNotes, tempo) {
    this._currentNotes = []
    this._currentTime = 0
    this._currentTones = []
    this._currentToneTime = 0
    const id = parseInt(prompt('Please type song id (0)')) || 0
    const title = prompt('Please type song title ("song")') || 'song'
    const encodedString = this._encodeChar(id) + this._encodeChar(Math.round(tempo / 60)) + this._encodeChar(title.length) + title
    this._tuneString = ''
    
    sortedNotes.forEach((note) => {
      this._encodeTime(note.time)
      this._filterFinishedNotes(note)
      if (!this._canBePlayedSimultaneusly(note)) {
        console.log(`Note ${note.time} ${note.pitch} rejected`)
        return
      }
      this._currentNotes.push(note)
    })
    this._flush([])
    const totalTones = this._tuneString.length / 3
    return encodedString + this._encodeChar(totalTones % 63) + this._encodeChar(Math.floor(totalTones / 63)) + this._tuneString
  }

  _encodeTime(noteTime) {
    for (let time = this._currentTime; time < noteTime; time++) {
      const tones = this._createTones(time)
      this._currentToneTime++
      if (!this._matchTone(tones)) {
        this._flush(tones)
      }
    }
    this._currentTime = noteTime
  }

  _filterFinishedNotes(note) {
    this._currentNotes = this._currentNotes.filter(currentNote => currentNote.time + currentNote.length > note.time )
  }

  _flush(tones, simultaneusNotes = 2) {
    if (this._currentTones.length > 0) {
      const toneString = new Array(simultaneusNotes).fill(0).map((_, i) => this._encodeChar(this._currentTones[i] || 0)).join('')
      this._tuneString += toneString + this._encodeChar(this._currentToneTime)
      this._currentTones = tones
      this._currentToneTime = 0
      console.log('flushed')
    }else console.log('no notes to flush')
  }

  _createTones(time) {
    const tones = []
    this._currentNotes.forEach((note) => {
      if (note.time < time && time <= note.time + note.length)
        tones.push(note.pitch - 36) // please dont import 3 first octaves
      console.log(note.pitch)
    })
    return tones
  }

  _matchTone(tones) {
    return tones.length === this._currentTones.length && this._currentTones.every((tone, i) => tone === tones[i])
  }

  _canBePlayedSimultaneusly(simultaneusNotes = 2) {
    if (!this._currentNotes.length) return true
    
    return this._currentNotes.length < simultaneusNotes
  }

  _encodeChar(num) { // min 0 max 62
    return String.fromCharCode(num + 32)
  }
}