import Instrument from './logic/Instrument'

export default class Repository {
  constructor () {
    this.MIDI_KEY_NAMES = ["a-1", "as-1", "b-1"]; //MPP
    const bare_notes = "c cs d ds e f fs g gs a as b".split(" ");
    for(var oct = 0; oct < 7; oct++) {
      for(var i in bare_notes) {
        this.MIDI_KEY_NAMES.push(bare_notes[i] + oct);
      }
    }
    this.MIDI_KEY_NAMES.push("c7")
  }

  set uiCallback(callback) {
    this._uiCallback = callback
  }

  save(data) {
    this._uiCallback.downloadData(data, 'text/JSON')
  }

  load(file, callback) {
    var r = new FileReader();
    const loadedData = {}
    r.onload = (function(f) {
      return function(e) {
        const data = JSON.parse(e.target.result)
        loadedData.bars = data.bars
        loadedData.instruments = data.instruments
        var v = data.version && parseFloat(data.version) || 0
        if(v > 0){
          this.cfg.bl = data.cfg.bl;
          if(v > 0.125){
            effects = data.effects;
          }else{
            for(var i = 0;i < loadedData.bars.length;i++){
              loadedData.bars[i].effects = 0;
            };
          };
        }else{
          this.cfg.bl = 32;
          for(var i = 0;i < loadedData.bars.length;i++){
            var b = loadedData.bars[i].notes;
            for(var j = 0;j < b.length;j++){
              if(b[j] && ((b[j].instrument || 0) > (loadedData.instruments.length - 1))){
                loadedData.instruments.push(new Instrument);
              };
            };
            loadedData.bars[i].effects = 0;
          };
        };
        callback(loadedData)
      };
    })(file);
    r.readAsText(file);
  }

  dumpNotes(bars) { // Used in multiplayer piano bot by perpheral assassin
    var noteArray = sortNotes(bars);
    var a =[];
    var b = [];
    var c = [];
    var r = [];
    var beatLength = (60 / bars[0].tempo) * 1000;
    var lastTime = 0;
    for(var i = 0;i < noteArray.length;i++){
      var n = noteArray[i];
      var nName = this.MIDI_KEY_NAMES[(n.pitch - 27 || 0)];
      if(nName){
        a.push(nName);
        Math.round(Math.round(b.push(n.volume) * 100) / 100);
        c.push(Math.round((n.time - lastTime) * beatLength));
        r.push(n.length * beatLength);
        lastTime = n.time;
      };
    };
    var code = "";
    console.log(a);
    code += "a = " + JSON.stringify(a);
    code += ";b = " + JSON.stringify(b);
    code += ";c = " + JSON.stringify(c);
    code += ";r = " + JSON.stringify(r);
    console.log(noteArray);
    return code;
  }

  dumpNotes2(id, name, simultaneusNotes = 2) { // Used only by me, please remove if you have copied this code from somewhere.
    const notes = sortNotes(bars)
    let currentNotes = []
    let currentTime = 0
    let currentTones = []
    let currentToneTime = 0
    const tempo = bars[0].tempo
    function encodeChar(num) { // min 0 max 62
      return String.fromCharCode(num + 32)
    }
    const encodedString = encodeChar(id) + encodeChar(Math.round(tempo / 60)) + encodeChar(name.length) + name
    let tuneString = ""
    function canBePlayedSimultaneusly(note) {
      if (!currentNotes.length) return true
      
      return currentNotes.length < simultaneusNotes
    }
    function filterFinishedNotes(note) {
      currentNotes = currentNotes.filter(currentNote => currentNote.time + currentNote.length > note.time )
    }
    function matchTone(tones) {
      return tones.length === currentTones.length && currentTones.every((tone, i) => tone === tones[i])
    }
    function createTones(time) {
      const tones = []
      currentNotes.forEach((note) => {
        //if (note.time < time && time <= note.time + note.length)
          tones.push(note.pitch - 36) // please dont import 3 first octaves
          console.log(note.pitch)
      })
      return tones
    }
    function flush(tones) {
      if (currentTones.length > 0) {
        const toneString = new Array(simultaneusNotes).fill(0).map((_, i) => encodeChar(currentTones[i] || 0)).join('')
        tuneString += toneString + encodeChar(currentToneTime)
        currentTones = tones
        currentToneTime = 0
        console.log("flushed")
      }else console.log("no notes to flush")
    }
    function encodeTime(noteTime) {
      for (let time = currentTime; time < noteTime; time++) {
        const tones = createTones(time)
        currentToneTime++
        if (!matchTone(tones)) {
          flush(tones)
        }
      }
      currentTime = noteTime;
    }
    notes.forEach((note) => {
      encodeTime(note.time)
      filterFinishedNotes(note);
      if (!canBePlayedSimultaneusly(note)) {
        console.log(`Note ${note.time} ${note.pitch} rejected`)
        return
      }
      currentNotes.push(note);
    })
    flush([])
    const totalTones = tuneString.length / 3
    return encodedString + encodeChar(totalTones % 63) + encodeChar(Math.floor(totalTones / 63)) + tuneString
  }

  _sortNotes(bars) {
    const notes = []
    bars.forEach((bar) => {
      bar.notes.forEach((note) => {
        if(note) notes.push(new Note(note.pitch,note.time + i * 32,note.length,note.volume * 100,note.instrument,note.vCurve))
      })
    })
    return notes.sort(function(a,b){return a.time - b.time});
  }

}