export default class TabHandler {
  constructor (root) {
    this.root = root
    this.tabs = []
  }

  reload() {
    this.currentTab.reload()
  }

  addTab(tab) {
    this.tabs.push(tab)
    if (!this.currentTab) this._setTab(tab.name)
  }

  bindListeners() {
    this.tabButtons.forEach(tabButton => {
      tabButton.addEventListener('click', (evt) => {
        this._setTab(evt.target.getAttribute('name'))
      })
    })
  }

  get tabButtons() {
    return new Array(...this.root.getElementsByClassName('tab-button'))
  }

  _setTab(name) {
    console.log('set tab', name)
    this.tabs.forEach(tab => {
      console.log(tab, name)
      const hasToBeHidden = tab.name !== name
      tab.hidden = hasToBeHidden
      if (!hasToBeHidden) this.currentTab = tab
    })
  }
}