import CanvasRenderer from './CanvasRenderer'
import OdurUICallback from './OdurUICallback'
import BarsTab from './ui/tab/Bars'
import EffectsTab from './ui/tab/Effects'
import InstrumentsTab from './ui/tab/Instruments'
import SettingsTab from './ui/tab/Settings'
import TabHandler from './ui/TabHandler'

export default class OdurUI {
  constructor () {
    const canvas = document.getElementById('c')
    this.canvasRenderer = new CanvasRenderer(canvas)
    this.out1 = document.getElementById('pitchOut')
    this.out2 = document.getElementById('strOut')
    this.out3 = document.getElementById('urlOut')
    this.in1 = document.querySelector('input.indicator-input[name="note-length"]')
    this.in2 = document.querySelector('input.indicator-input[name="note-volume"]')
    this.barsDiv = document.getElementById('bars')
    this.insDiv = document.getElementById('instruments')
    this.ftsDiv = document.getElementById('soundFonts')
    this.effDiv = document.getElementById('effects')
    this.pressed = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      z: false,
      x: false,
    }
    this.CURVESHTML = '<option>square</option><option>sawtooth</option><option>triangle</option><option>sine</option><option>rectangle1</option><option>rectangle2</option><option>bitNoise</option><option>hyperbolic</option><option>hyperbolic2</option>'
    document.getElementById('vCurveType').innerHTML = this.CURVESHTML + '<option selected>silence</option>'
  
    this.tabsHandler = new TabHandler(document.getElementById('container1'))
    this.barsTab = new BarsTab(this.barsDiv)
    
    this.tabsHandler.addTab(this.barsTab)
    this.effectsTab = new EffectsTab(this.effDiv)
    
    this.tabsHandler.addTab(this.effectsTab)
    this.instrumentsTab = new InstrumentsTab(this.insDiv)
    this.instrumentsTab.fontsElement = this.ftsDiv
    
    this.tabsHandler.addTab(this.instrumentsTab)

    this.settingsTab = new SettingsTab(document.getElementById('settings'))
    this.tabsHandler.addTab(this.settingsTab)

    this.callback = new OdurUICallback(this.out2, this.out3, this.barsDiv, this.insDiv, this.tabsHandler, this.canvasRenderer.render, this.in1, this.in2, this.insEl, this.pressed)
    this.canvasRenderer.uiCallback = this.callback
  }

  get indicatorInputs() {
    return new Array(...document.getElementsByClassName('indicator-input'))
  }

  start() {
    this.bindListeners()
    this.canvasRenderer.render()
    this.out2.innerText = 'Ready'
  }

  set logic(logic) {
    this._logic = logic
    this.canvasRenderer.logic = logic

    this.barsTab.bars = this._logic.bars
    this.barsTab.effects = this._logic.effects
    this.effectsTab.effects = this._logic.effects
    this.instrumentsTab.instruments = this._logic.instruments
    this.instrumentsTab.logic = this._logic
  }

  bindListeners() {
    this.canvasRenderer.bindListeners()
    document.getElementById('load').oninput = this._logic.load
    document.body.onkeydown = (evt) => {
      this.pressed[evt.key] = true
    }
    document.body.onkeyup = (evt) => {
      this.pressed[evt.key] = false
    }

    document.getElementById('play-button').addEventListener('click', () => this._logic.play())
    document.getElementById('play-current-bar-button').addEventListener('click', () => this._logic.playCurrentBar())
    document.getElementById('stop-button').addEventListener('click', () => this._logic.stop())
    document.getElementById('mp3-convert-button').addEventListener('click', () => this._logic.build())
    document.getElementById('download-button').addEventListener('click', () => this._logic.save())
    document.getElementById('perios-convert-button').addEventListener('click', () => this._logic.downloadPerios())
    document.getElementById('piezo-convert-button').addEventListener('click', () => this._logic.downloadPiezo())

    this.indicatorInputs.forEach(indicatorInput => {
      indicatorInput.addEventListener('input', evt => {
        this._showIndicator(evt)
      })
    })

    document.getElementById('scroll-up').addEventListener('click', () => this.canvasRenderer.scrollY += 100)
    document.getElementById('scroll-down').addEventListener('click', () => this.canvasRenderer.scrollY -= 100)
    document.getElementById('scroll-to-start').addEventListener('click', () => this.canvasRenderer.scrollY = 0)
    document.getElementById('scroll-to-end').addEventListener('click', () => this.canvasRenderer.scrollY = ((this._logic.bars.length * 32) - 20) * 10)

    this.tabsHandler.bindListeners()
  }

  _onInputIns(evt){
    let el = evt.target
    let id = el.id.slice(3)
    this._logic.instruments[id].type = el.value
  }

  _showIndicator(evt) {
    const selector = `div.indicator[name="${evt.target.getAttribute('name')}"]`
    const indicator = document.querySelector(selector)
    indicator.innerText = evt.target.value
  }
}