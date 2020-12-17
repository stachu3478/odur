import Mp3Converter from './converter/Mp3Converter'
import PeriosConverter from './converter/PeriosConverter'
import PiezoConverter from './converter/PiezoConverter'
import Note from './logic/Note'

export default class ConverterManager {
  constructor() {}

  convertToMp3 (channel) {
    return new Mp3Converter(channel).convert()
  }

  convertToPerios (bars) {
    return new PeriosConverter().convert(this._sortNotes(bars), bars[0].tempo)
  }

  convertToPiezo (bars) {
    const sortedNotes = this._sortNotes(bars)
    console.log(sortedNotes)
    return new PiezoConverter().convert(sortedNotes, bars[0].tempo)
  }

  _sortNotes(bars) {
    const notes = []
    bars.forEach((bar, i) => {
      bar.notes.forEach((note) => {
        if(note) notes.push(new Note(note.pitch,note.time + i * 32,note.length,note.volume * 100,note.instrument,note.vCurve))
      })
    })
    return notes.sort(function(a,b){return a.time - b.time})
  }
}