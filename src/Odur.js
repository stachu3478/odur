import OdurLogic from './OdurLogic'
import OdurUI from './OdurUI'

export default class Odur {
  constructor () {
    this.logic = new OdurLogic()
    this.ui = new OdurUI()
    this.ui.logic = this.logic
    this.logic.uiCallback = this.ui.callback
  }

  start () {
    this.ui.start()
  }
}