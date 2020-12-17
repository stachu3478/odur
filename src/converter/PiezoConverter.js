import TimeEncoder from './piezoConverter/TimeEncoder'

export default class PiezoConverter {
  constructor (timeEncoder = new TimeEncoder()) {
    this.timeEncoder = timeEncoder
    this._currentNotes = []
    this.timeEncoder.notes = this._currentNotes
  }

  convert(sortedNotes, tempo, prompter = prompt) {
    const id = parseInt(prompter('Please type song id (0)')) || 0
    const title = prompter('Please type song title ("song")') || 'song'
    this.timeEncoder.addChar(id)
    this.timeEncoder.addChar(Math.round(tempo / 60))
    this.timeEncoder.addString(title)

    let highestTime = 0
    sortedNotes.forEach(note => {
      const endTime = note.time + note.length
      if (endTime > highestTime) highestTime = endTime
    })

    const toneArray = new Array(highestTime).fill(0).map(() => [])
    sortedNotes.forEach(note => {
      for (let time = note.time; time < note.time + note.length; time++) {
        if (toneArray[time].length < 2) toneArray[time].push(note.pitch - 36)
      }
    })
    
    toneArray.forEach(tone => {
      this.timeEncoder.encode(tone)
    })
    this.timeEncoder.flush()
    return this.timeEncoder.code
  }
}