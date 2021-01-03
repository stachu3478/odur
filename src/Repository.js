import Instrument from './logic/Instrument'

export default class Repository {
  constructor () {
    
  }

  set uiCallback(callback) {
    this._uiCallback = callback
  }

  save(data) {
    this._uiCallback.downloadJson(data)
  }

  load(file, callback) {
    let r = new FileReader()
    const loadedData = {}
    r.onload = (function() {
      return function(e) {
        const data = JSON.parse(e.target.result)
        loadedData.bars = data.bars
        loadedData.instruments = data.instruments
        let v = data.version && parseFloat(data.version) || 0
        if(v > 0){
          loadedData.barLength = data.cfg.bl
          if(v > 0.125){
            loadedData.effects = data.effects
          }else{
            for(let i = 0;i < loadedData.bars.length;i++){
              loadedData.bars[i].effects = 0
            }
          }
        }else{
          this.cfg.bl = 32
          for(let i = 0;i < loadedData.bars.length;i++){
            let b = loadedData.bars[i].notes
            for(let j = 0;j < b.length;j++){
              if(b[j] && ((b[j].instrument || 0) > (loadedData.instruments.length - 1))){
                loadedData.instruments.push(new Instrument)
              }
            }
            loadedData.bars[i].effects = 0
          }
        }
        callback(loadedData)
      }
    })(file)
    r.readAsText(file)
  }
}