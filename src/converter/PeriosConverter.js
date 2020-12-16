export default class PeriosConverter {
  constructor () {
    this.MIDI_KEY_NAMES = ['a-1', 'as-1', 'b-1'] //MPP
    const bare_notes = 'c cs d ds e f fs g gs a as b'.split(' ')
    for(let oct = 0; oct < 7; oct++) {
      for(let i in bare_notes) {
        this.MIDI_KEY_NAMES.push(bare_notes[i] + oct)
      }
    }
    this.MIDI_KEY_NAMES.push('c7')
  }

  convert(sortedNotes, tempo) {// Used in multiplayer piano bot by perpheral assassin
    let a =[]
    let b = []
    let c = []
    let r = []
    let beatLength = (60 / tempo) * 1000
    let lastTime = 0
    for(let i = 0;i < sortedNotes.length;i++){
      let n = sortedNotes[i]
      let nName = this.MIDI_KEY_NAMES[(n.pitch - 27 || 0)]
      if(nName){
        a.push(nName)
        b.push(Math.round(Math.round(n.volume) * 100) / 100)
        c.push(Math.round((n.time - lastTime) * beatLength))
        r.push(n.length * beatLength)
        lastTime = n.time
      }
    }
    let code = ''
    console.log(a)
    code += 'a = ' + JSON.stringify(a)
    code += ';b = ' + JSON.stringify(b)
    code += ';c = ' + JSON.stringify(c)
    code += ';r = ' + JSON.stringify(r)
    console.log(sortedNotes)
    return code
  }
}