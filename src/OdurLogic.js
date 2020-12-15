import lamejs from 'lamejs'
import Bar from './logic/Bar'
import Instrument from './logic/Instrument'
import EffectSet from './logic/EffectSet'
import Note from './logic/Note'
import AudioPlayer from './AudioPlayer'
import Repository from './Repository'

export default class OdurLogic {
  constructor () {
    this.bars = []
    this.instruments = []
    this.effects = []
    this.cfg = {
      //config
	    bl: 32, //bar length
    }
    this.audioPlayer = new AudioPlayer()
    this.repository = new Repository()

    this.bars.push(new Bar())
    this.instruments.push(new Instrument())
    this.effects.push(new EffectSet())
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

  createNote(keyId, time) {
    const barLength = this.cfg.bl
    const barId = Math.floor(time / barLength)
    if(!this.bars[barId]){
      this.bars.push(new Bar(this.bars[this.bars.length - 1].tempo));
      this._uiCallback.refreshBars();
    }
    this.bars[barId].notes.push(new Note(keyId, time % barLength, this.noteLength, this.noteVolume, this.instrument, this._uiCallback.volumeCurve));
  }

  playNote(tempo, id) {
    var b = new Bar(tempo)
    b.notes.push(new Note(id, 0, this.noteLength, this.noteVolume, this._uiCallback.instrument, this._uiCallback.volumeCurve))
    this.audioPlayer.play([b], this.cfg.bl, this.effects, this.instruments)
  }

  play() {
    this.audioPlayer.play(this.bars, this.cfg.bl, this.effects, this.instruments)
  }

  playCurrentBar() {
    const bar = this.bars[Math.floor(scrollY / (this.cfg.bl * 10))]
    this.audioPlayer.play([bar], this.cfg.bl, this.effects, this.instruments)
  }

  stop() {
    this.audioPlayer.stop()
  }

  cloneBar(id){
    this.bars.push(new Object(bars[id]));
    this._rebuildNotes(32,32);
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
      bars: bars,
      instruments: instruments,
      cfg: this.cfg,
      effects: effects,
      version: "0.2",
    }
    this.repository.save(data)
  }

  load(evt){
    var file = evt.target.files[0]; 
    if (file) {
      this.repository.load(file, (loadedData) => {
        this.bars = loadedData.bars
        this.instruments = loadedData.instruments
        this._uiCallback.songLoaded(f.name)
      })
    } else {
      alert("Failed to load file"); 
    }
  }

  build(){
    this.audioPlayer.play(this.bars, this.cfg.bl, this.effects, this.instruments)
    this.audioPlayer.stop()
    this._uiCallback.exportingToMP3()
    const mp3Data = [];
    const mp3encoder = new lamejs.Mp3Encoder(1, this.audioPlayer.ctx.sampleRate, 128)
    
    const channel = this.audioPlayer.channel
    const supportChannel = new Int16Array(channel.length);
    var multipler = Math.pow(2,15);
    for(var i = 0;i < channel.length;i++){
      supportChannel[i] = (channel[i]) * multipler;
    };
    const samples = supportChannel; //one second of silence (get your data from the source you have)
    const sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier
    while(mp3Data.length == 0){
      var mp3buf = mp3encoder.encodeBuffer(new Int16Array(1152));
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    };
    for (var i = 0; i < samples.length; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize);
      var mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }
    var mp3buf = mp3encoder.flush();   //finish writing mp3
  
    if (mp3buf.length > 0) {
      mp3Data.push(new Int8Array(mp3buf));
    }

    this._uiCallback.downloadMP3(mp3Data)
  }

  findNote(barId,pitch,time){
    const bar = this.bars[barId]
    if(bar)for(var i = 0;i < bar.notes.length;i++){
      var note = bar.notes[i];
      if(note && (note.pitch == pitch) && (note.time == time))return {i: i,l: note.length};
    };
    return false;
  };

  _rebuildNotes(l1,l2){
    if(l2 > 0){
      var noteArray = [];
      var nBars = [];
      for(var i = 0;i < this.bars.length;i++){
        var n = this.bars[i].notes;
        for(var j = 0;j < n.length;j++){
          var m = n[j];
          if(m)noteArray.push(new Note(m.pitch,m.time + i * l1,m.length,m.volume * 100,m.instrument,m.vCurve));
        };
        nBars.push(new Bar(this.bars[i].tempo));
      };
      for(var i = 0;i < noteArray.length;i++){
        var n = noteArray[i];
        var barId = Math.floor(n.time / l2);
        if(barId < 10000){
          while(!nBars[barId])nBars.push(new Bar(nBars[nBars.length - 1].tempo));
          nBars[barId].notes.push(new Note(n.pitch,n.time % l2,n.length,n.volume * 100,n.instrument,n.vCurve));
        };
      };
      this.bars = nBars;
    };
  };
}