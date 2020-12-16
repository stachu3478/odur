import fastSpan from '../fastSpan'
import Tab from '../Tab'

export default class BarsTab extends Tab {
  constructor (e) {
    super(e)
  }

  set bars(bars) {
    this._bars = bars
    console.log('bars set: ', bars)
  }

  set effects(effects) {
    this._effects = effects
  }

  reload() {
    this.element.innerHTML = ''
    this._bars && this._bars.forEach((bar, i ) => {
      console.log('bar reloading')
      let el = document.createElement('div')
      el.innerHTML = 'Bar '+ (i + 1) +'<br>Tempo: <span id=read' + i + '>' + bar.tempo + '</span><input id=bar' + i + ' type=range min=15 max=480 value=' + bar.tempo + '>'
      el.oninput = (evt) => this._onRangeInputTempo(evt)
      let el1 = document.createElement('select')
      this._effects.forEach((_, i) => {
        const option = document.createElement('option')
        option.innerText = `Effects set ${i + 1}`
        el1.appendChild(option)
      })
      el1.id = 'bre' + i
      el1.value = 'Effects set ' + (bar.effects + 1)
      el1.oninput = (evt) => { this._bars[evt.target.id.slice(3)].effects = evt.target.value.slice(11)}
      el.appendChild(fastSpan('Effect set: '))
      el.appendChild(el1)
      this.element.appendChild(el)
    })
  }

  _onRangeInputTempo(evt){
    let el = evt.target
    let id = el.id.slice(3)
    switch(el.id.slice(0,3)){
    case 'bar': {
      this._bars[id].tempo = parseInt(el.value)
      document.getElementById('read'+id).innerText = el.value
    }break
    case 'bre': {
      this._bars[id].effects = parseInt(el.value.slice(11)) - 1
    }
    }
  }
}