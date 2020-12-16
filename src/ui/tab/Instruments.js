import Tab from '../Tab'

export default class InstrumentsTab extends Tab {
  constructor (e) {
    super(e)
  }
  
  set instruments(instruments) {
    this._instruments = instruments
  }

  set logic(logic) {
    this._logic = logic
  }

  set fontsElement(fontsElement) {
    this._fontsElement = fontsElement
  }

  reload() {
    this.element.innerHTML = ''
    this._fontsElementDiv.innerHTML = ''
    this._instruments && this._instruments.forEach((instrument, i) => {
      let el = document.createElement('div')
      let el2 = document.createElement('select')
      el2.innerHTML = this.CURVESHTML
      el2.id = 'ins' + i
      el2.value = instrument.type
      el2.oninput = (evt) => this._onInputIns(evt)
      el.innerHTML = 'Soundfont '+ (i + 1) +'<br>Type: '
      this.element.appendChild(el)
      el.appendChild(el2)
      el = document.createElement('input')
      el.type = 'radio'
      el.name = 'ins'
      el.value = i
      if(i == this._instruments.length - 1)el.checked = true
      el2 = document.createElement('span')
      el2.innerText = 'Soundfont ' + (i + 1)
      this._fontsElement.appendChild(el)
      this._fontsElement.appendChild(el2)
      this._fontsElement.appendChild(document.createElement('br'))
    })
    let el = document.createElement('button')
    el.innerText = 'New'
    el.onclick = () => { this._logic.createInstrument(); this.reload() }
    this.element.appendChild(el)
  }
}