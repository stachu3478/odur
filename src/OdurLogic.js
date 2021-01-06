import Bar from './logic/Bar'
import Instrument from './logic/Instrument'
import EffectSet from './logic/EffectSet'
import Note from './logic/Note'
import AudioPlayer from './AudioPlayer'
import Repository from './Repository'
import ConverterManager from './ConverterManager'

export default class OdurLogic {
  constructor (audioPlayer = new AudioPlayer()) {
    this.bars = []
    this.instruments = []
    this.effects = []
    this.cfg = {
      //config
      bl: 32, //bar length
    }
    this.audioPlayer = audioPlayer
    this.repository = new Repository()

    this.bars.push(new Bar())
    this.instruments.push(new Instrument())
    this.effects.push(new EffectSet())

    this.converterManager = new ConverterManager()
  }

  set uiCallback(callback) {
    this._uiCallback = callback
    this.audioPlayer.uiCallback = callback
    this.repository.uiCallback = callback
  }

  set noteLength(v) {
    this._uiCallback.noteLength = v
  }

  get noteLength() {
    return this._uiCallback.noteLength
  }

  set noteVolume(v) {
    this._uiCallback.noteVolume = v
  }

  get noteVolume() {
    return this._uiCallback.noteVolume
  }

  get instrument() {
    return this._uiCallback.instrument
  }

  set barLength(v) {
    if(v > 0 && v !== this.cfg.bl ) {
      this._rebuildNotes(this.cfg.bl, v)
      this.cfg.bl = v
    }
  }

  get lastBar() {
    return this.bars[this.bars.length - 1]
  }

  downloadPiezo() {
    const code = this.converterManager.convertToPiezo(this.bars)
    this._uiCallback.downloadData(code, 'text/plain', '.bin')
  }

  downloadPerios() {
    const code = this.converterManager.convertToPerios(this.bars)
    this._uiCallback.downloadData(code, 'application/javascript', '.js')
  }

  createNote(keyId, time) {
    const barLength = this.cfg.bl
    const barId = Math.floor(time / barLength)
    if(!this.bars[barId]){
      this.bars.push(new Bar(this.lastBar.tempo))
      this._uiCallback.refreshBars()
    }
    this.bars[barId].notes.push(new Note(keyId, time % barLength, this.noteLength, this.noteVolume, this.instrument, this._uiCallback.volumeCurve))
  }

  playNote(tempo, id) {
    let b = new Bar(tempo)
    b.notes.push(new Note(id, 0, this.noteLength, this.noteVolume, this._uiCallback.instrument, this._uiCallback.volumeCurve))
    this.audioPlayer.play([b], this.cfg.bl, this.effects, this.instruments)
  }

  play() {
    this.audioPlayer.play(this.bars, this.cfg.bl, this.effects, this.instruments)
  }

  playCurrentBar() {
    const bar = this.bars[Math.floor(this._uiCallback.scrollY / (this.cfg.bl * 10))]
    this.audioPlayer.play([bar], this.cfg.bl, this.effects, this.instruments)
  }

  stop() {
    this.audioPlayer.stop()
  }

  cloneBar(id){
    this.bars.push(new Object(this.bars[id]))
    this._rebuildNotes(32,32)
  }

  createInstrument() {
    this.instruments.push(new Instrument())
  }

  createEffectSet() {
    this.effects.push(new EffectSet())
  }

  save() {
    this._rebuildNotes(this.cfg.bl, this.cfg.bl)
    const data = {
      bars: this.bars,
      instruments: this.instruments,
      cfg: this.cfg,
      effects: this.effects,
      version: '0.2',
    }
    this.repository.save(data)
  }

  load(evt){
    let file = evt.target.files[0] 
    if (file) {
      this.repository.load(file, (loadedData) => {
        this.bars.splice(0)
        this.bars.push(...loadedData.bars)
        this.instruments.splice(0)
        this.instruments.push(...loadedData.instruments)
        this.effects.splice(0)
        this.effects.push(...loadedData.effects)
        this.cfg.bl = loadedData.barLength
        this._uiCallback.songLoaded(file.name)
      })
    } else {
      alert('Failed to load file') 
    }
  }

  build(){
    this.audioPlayer.play(this.bars, this.cfg.bl, this.effects, this.instruments)
    this.audioPlayer.stop()
    this._uiCallback.exportingToMP3()
    const mp3Data = this.converterManager.convertToMp3(this.audioPlayer.channel)
    this._uiCallback.downloadMP3(mp3Data)
  }

  findNote(barId,pitch,time){
    const bar = this.bars[barId]
    if(bar)for(let i = 0;i < bar.notes.length;i++){
      let note = bar.notes[i]
      if(note && (note.pitch == pitch) && (note.time === time))return {i: i,l: note.length}
    }
    return false
  }

  applyCurrentNoteLengthToFont() {
    const instrument = this.instrument
    const noteLength = this.noteLength
    this.bars.forEach(bar => {
      bar.notes.forEach(note => {
        if(note && (note.instrument === instrument)){
          note.length = noteLength
        }
      })
    })
  }

  applyCurrentNoteVolumeToFont() {
    const instrument = this.instrument
    const noteVolume = this.noteVolume
    this.bars.forEach(bar => {
      bar.notes.forEach(note => {
        if(note && (note.instrument === instrument)){
          note.volume = noteVolume
        }
      })
    })
  }

  applyCurrentVolumeCurveToFont() {
    const instrument = this.instrument
    const noteVolumeCurve = this._uiCallback.volumeCurve
    this.bars.forEach(bar => {
      bar.notes.forEach(note => {
        if(note && (note.instrument === instrument)){
          note.vCurve = noteVolumeCurve
        }
      })
    })
  }

  _rebuildNotes(l1,l2){
    if(l2 > 0){
      let noteArray = []
      for(let i = 0;i < this.bars.length;i++){
        let n = this.bars[i].notes
        for(let j = 0;j < n.length;j++){
          let m = n[j]
          if(m)noteArray.push(new Note(m.pitch,m.time + i * l1,m.length,m.volume * 100,m.instrument,m.vCurve))
        }
        this.bars[i] = new Bar(this.bars[i].tempo)
      }
      for(let i = 0;i < noteArray.length;i++){
        const n = noteArray[i]
        let barId = Math.floor(n.time / l2)
        if(barId < 10000){
          while(!this.bars[barId]) {
            this.bars.push(new Bar(this.lastBar.tempo))
          }
          this.bars[barId].notes.push(new Note(n.pitch,n.time % l2,n.length,n.volume * 100,n.instrument,n.vCurve))
        }
      }
    }
  }
}