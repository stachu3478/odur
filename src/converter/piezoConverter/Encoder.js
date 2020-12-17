/**
* @module Encoder
*/
export default {
  int5(num) {
    return String.fromCharCode(num + 32)
  },
  int11(num) {
    return this.int5(num % 95) + this.int5(Math.floor(num / 95))
  }
}