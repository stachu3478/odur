export default class CanvasRenderer {
  constructor (canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.CW = canvas.width
    this.CH = canvas.height
    this.fontColors = ['lightBlue','lime','pink','purple','yellow','blue','green','red','orange']
    this._scrollY = 0
    this.octKeyPos = [7,14,21,28,35,49,56,63,70,77,84,91]
  }

  get scrollY() {
    return this._scrollY
  }

  set scrollY(scrollY) {
    this._scrollY = scrollY
    if (this._scrollY < 0) this._scrollY = 0
    this.render()
  }

  set logic(logic) {
    this._logic = logic
  }

  set uiCallback(callback) {
    this._uiCallback = callback
    console.log('uicallback set', this._uiCallback)
  }

  bindListeners() {
    this.canvas.onmousemove = (evt) => {
      const barLength = this._logic.cfg.bl
      let notes = ['C','#C','D','#D','E','F','#F','G','#G','A','#A','B']
      let p = this._locateKeyId(evt.layerX)
      let t = this._locateKeyTime(evt.layerY)
      let onPiano = evt.layerY > this.CH - 42
      this._renderKeys()
      let result = this._logic.findNote(Math.floor(t / barLength), p.id, t % barLength)
      if(result !== false){
        this.ctx.fillStyle = 'purple'
        this.ctx.fillRect(p.o * 98 + this.octKeyPos[p.n] - 7,this._scrollY - (t + result.l) * 10 + this.CH - 40,14,result.l * 10)
      }else{
        this.ctx.fillStyle = 'lime'
        if(t >= 0) this.ctx.fillRect(p.o * 98 + this.octKeyPos[p.n] - 7,this._scrollY - (t + parseInt(this._logic.noteLength)) * 10 + this.CH - 40,14,this._logic.noteLength * 10)
      }
      this._renderPiano()
      this.ctx.fillStyle = 'black'
      this.ctx.font = 'Times New Roman 10px'
      let txt = (notes[p.n] || 'Unknown') + ' ' + p.o + '; ' + t + ' / ' + barLength + (onPiano ? ' (Click to play)' : (result != false ? (this._uiCallback.pressed.Control ? ' (Click to pick)' : ' (Click to remove)') : ''))
      let len = this.ctx.measureText(txt).width + 2
      this.ctx.fillRect(evt.layerX,evt.layerY - 12,len,12)
      this.ctx.fillStyle = 'white'
      this.ctx.fillText(txt,evt.layerX + 1,evt.layerY - 1)
    }
    this.canvas.onclick = (evt) => {
      const bars = this._logic.bars
      let p = this._locateKeyId(evt.layerX)
      let t = this._locateKeyTime(evt.layerY)
      let onPiano = evt.layerY > this.CH - 42
      let bl = this._logic.cfg.bl
      let barId = Math.floor(t / bl)
      let insEl = document.querySelector('input[name=ins]:checked') || {value: 0}
      if(onPiano){
        let tempo = bars[barId] && bars[barId].tempo || bars[barId + 1].tempo
        this._logic.playNote(tempo, p.id)
      }else{
        if(t >= 0){
          let pos = this._logic.findNote(barId, p.id, t % bl)
          if(pos !== false){
            if(this._uiCallback.pressed.Control){
              let n = bars[barId].notes[pos.i]
              this._logic.noteLength = n.length
              this._logic.noteVolume = n.volume * 100
              insEl.checked = false
              document.getElementsByName('ins')[n.instrument].checked = true
              document.getElementById('vCurveType').value = n.vCurve.type
              document.getElementById('vCurveStart').value = n.vCurve.start
              document.getElementById('vCurveEnd').value = n.vCurve.end
              document.getElementById('vCurveOffset').value = n.vCurve.offset
              document.getElementById('vCurveCycle').value = n.vCurve.cycle
            }else{
              bars[barId].notes[pos.i] = null
            }
          }else{
            this._logic.createNote(p.id, t)
          }
        }
        this.ctx.clearRect(0,0,this.CW,this.CH - 42)
        this._renderKeys()
      }
    }
  }

  render(){
    this._renderPiano()
    this._renderKeys()
  }

  _locateKeyId(x){
    let octave = Math.floor(x / 98)
    let nst = {id: 0, d: 20}
    let r = x % 98
    for(let i = 0; i < 12; i++){
      
      let dist = Math.abs(r - this.octKeyPos[i])
      if(nst.d > dist){
        nst.d = dist
        nst.id = i
      }
    }
    return {id: octave * 12 + nst.id, o: octave, n: nst.id}
  }

  _locateKeyTime(y){
	
    return Math.round((-y + 557 + this._scrollY) / 10)
  }

  _renderKeys(){
    const bars = this._logic.bars
    this.ctx.fillStyle = 'black'
    this.ctx.fillRect(0,0,this.CW, this.CH - 42)
    this.ctx.strokeStyle = 'grey'
    for(let i = 0; i < 70; i++){
      
      if(i % 7 == 0){
        this.ctx.strokeStyle = 'white'
      }else{
        this.ctx.strokeStyle = 'grey'
      }
      this.ctx.beginPath()
      this.ctx.moveTo(i * 14, this.CH - 42)
      this.ctx.lineTo(i * 14, 0)
      this.ctx.stroke()
    }
    for(let i = 0; i < this.CH - 42; i+= 10){
      
      if((this._scrollY + this.CH - 40 - i) % (this._logic.cfg.bl * 10) == 0){
        this.ctx.strokeStyle = 'white'
      }else{
        this.ctx.strokeStyle = 'grey'
      }
      this.ctx.beginPath()
      this.ctx.moveTo(0, i)
      this.ctx.lineTo(this.CW, i)
      this.ctx.stroke()
    }
    
    let barDown = Math.floor(this._scrollY / (this._logic.cfg.bl * 10))
    for(let i = barDown; i <= barDown + 56 / this._logic.cfg.bl + 1; i++){
      if(bars[i])for(let j = 0; j < bars[i].notes.length; j++){
        let note = bars[i].notes[j]
        if(note){
          this.ctx.fillStyle = this.fontColors[note.instrument]
          this.ctx.fillRect(Math.floor(note.pitch / 12) * 98 + this.octKeyPos[note.pitch % 12] - 7,(note.time + note.length) * -10 - i * this._logic.cfg.bl * 10  + this._scrollY + this.CH - 40,14,note.length * 10)
        }
      }
    }
  }

  _renderB(m){
    this.ctx.fillRect(m, this.CH - 42, 10, 21)
    this.ctx.strokeRect(m, this.CH - 42, 10, 21)
  }

  _renderPiano(){
    
    this.ctx.strokeStyle = 'black'
    this.ctx.fillStyle = 'white'
    for(let i = 0; i < 70; i++){
      
      this.ctx.fillRect(i * 14, this.CH - 42, 14, 42)
      this.ctx.strokeRect(i * 14, this.CH - 42, 14, 42)
    }
    this.ctx.strokeStyle = 'grey'
    this.ctx.fillStyle = 'black'
    for(let i = 0; i < 10; i++){
      
      let m = 9 + i * 98
      this._renderB(m)
      m += 14
      this._renderB(m)
      m += 28
      this._renderB(m)
      m += 14
      this._renderB(m)
      m += 14
      this._renderB(m)
    }
  }
}