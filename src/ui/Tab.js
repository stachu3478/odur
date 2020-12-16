/**
 * @abstract
 */
export default class Tab {
  constructor (element) {
    this.element = element
  }

  get name() {
    return this.element.getAttribute('name')
  }

  set hidden(hidden) {
    this.element.hidden = hidden
    if (!hidden) this.reload()
  }

  reload() {
    throw new Error('Not implemented')
  }
}