import fastSpan from '../fastSpan'
import Tab from '../Tab'

export default class EffectsTab extends Tab {
  constructor (e) {
    super(e)
  }
  
  set effects(effects) {
    this._effects = effects
  }

  reload() {
    this.element.innerHTML = ''
    this._effects && this._effects.forEach((effect, i) => {
      let eld = document.createElement('div')
      eld.id = 'eff' + i
      let el = document.createElement('input')
      el.type = 'checkbox'
      el.checked = effect.echo.enabled
      let el2 = document.createElement('input')
      el2.type = 'number'
      el2.value = effect.echo.cycle
      let el3 = document.createElement('input')
      el3.type = 'number'
      el3.value = effect.echo.multipler
      let el4 = document.createElement('input')
      el4.type = 'number'
      el4.value = effect.echo.max
      let el5 = document.createElement('input')
      el5.type = 'number'
      el5.value = effect.echo.blur
      eld.appendChild(fastSpan('Effect set ' + (i + 1) + '<br>'))
      eld.appendChild(el)
      eld.appendChild(fastSpan('Enable echo: <br>Echo delay: '))
      eld.appendChild(el2)
      eld.appendChild(fastSpan('Echo multipler: '))
      eld.appendChild(el3)
      eld.appendChild(fastSpan('Number of cycles: '))
      eld.appendChild(el4)
      eld.appendChild(fastSpan('Echo blur: '))
      eld.appendChild(el5)
      eld.oninput = (evt) => {
        let target = evt.target.parentElement
        let c = target.children
        effect.echo.enabled = c[1].checked
        effect.echo.cycle = parseFloat(c[3].value)
        effect.echo.multipler = parseFloat(c[5].value)
        effect.echo.max = parseInt(c[7].value) || 1
        effect.echo.blur = parseFloat(c[9].value)
      }
      el = document.createElement('button')
      el.innerText = 'New'
      el.onclick = () => { this._logic.createEffectSet(); this.reload() }
      eld.appendChild(el)
      this.element.appendChild(eld)
    })
  }
}