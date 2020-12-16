import Tab from '../Tab'

export default class SettingsTab extends Tab {
  constructor (e) {
    super(e)
  }
  
  set config(config) {
    this._config = config
  }

  reload() {
    document.getElementById('barLength').value = this._config.bl
  }
}