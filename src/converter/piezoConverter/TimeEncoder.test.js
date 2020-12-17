import Encoder from './Encoder'
import TimeEncoder from './TimeEncoder'

describe('TimeEncoder', () => {
  describe('+code', () => {
    it ('returns two spaces when got code without context', () => {
      const returnValue = 'some random string'
      expect(new TimeEncoder({ int11: () => returnValue }).code).toEqual(returnValue)
    })
  })

  describe('#encode', () => {
    it ('does not do anything when notes not changed', () => {
      const encoder = new TimeEncoder({ int11: () => '', int5: Encoder.int5 })
      new Array(3).fill(0).forEach(() => encoder.encode([14, 17])) 
      expect(encoder.code).toEqual('')
    })

    it ('adds notes when tone changed', () => {
      const returnValue = 'some random length'
      const encoder = new TimeEncoder({ int11: () => returnValue, int5: Encoder.int5 })
      encoder.encode([14, 17])
      encoder.encode([14, 17])
      encoder.encode([53])
      expect(encoder.code).toEqual(returnValue + Encoder.int5(14) + Encoder.int5(17) + Encoder.int5(2))
    })

    it ('adds notes when flushed', () => {
      const returnValue = 'some random length'
      const encoder = new TimeEncoder({ int11: () => returnValue, int5: Encoder.int5 })
      new Array(5).fill(0).forEach(() => encoder.encode([14, 17]))
      encoder.flush()
      expect(encoder.code).toEqual(returnValue + Encoder.int5(14) + Encoder.int5(17) + Encoder.int5(5))
    })

    it ('adds multiple notes when length differs', () => {
      const returnValue = 'some random length'
      const encoder = new TimeEncoder({ int11: () => returnValue, int5: Encoder.int5 })
      encoder.encode([14])
      encoder.encode([17, 14])
      encoder.encode([17, 14])
      encoder.encode([14])
      encoder.encode([14])
      encoder.flush()
      expect(encoder.code).toEqual(returnValue + Encoder.int5(14) + Encoder.int5(0) + Encoder.int5(1) + Encoder.int5(17) + Encoder.int5(14) + Encoder.int5(2) + Encoder.int5(14) + Encoder.int5(0) + Encoder.int5(2))
    })

    it ('adds empty time when no notes', () => {
      const returnValue = 'some random length'
      const encoder = new TimeEncoder({ int11: () => returnValue, int5: Encoder.int5 })
      new Array(5).fill(0).forEach(() => encoder.encode([]))
      encoder.flush()
      expect(encoder.code).toEqual(returnValue + Encoder.int5(0) + Encoder.int5(0) + Encoder.int5(5))
    })

    it ('is strange', () => {
      const returnValue = 'some random length'
      const encoder = new TimeEncoder({ int11: () => returnValue, int5: Encoder.int5 })
      encoder.encode([14])
      encoder.encode([15])
      encoder.encode([16])
      encoder.flush()
      expect(encoder.code).toEqual(returnValue + Encoder.int5(14) + Encoder.int5(0) + Encoder.int5(1) + Encoder.int5(15) + Encoder.int5(0) + Encoder.int5(1) + Encoder.int5(16) + Encoder.int5(0) + Encoder.int5(1))
    })
  })

  describe('#addChar', () => {
    it ('adds char to the code', () => {
      const returnValue = 'some random string'
      const encoder = new TimeEncoder({ int11: () => '', int5: () => returnValue })
      encoder.addChar(22)
      expect(encoder.code).toEqual(returnValue)
    })
  })

  describe('#addString', () => {
    it ('adds string with its length to the code', () => {
      const stringToEncode = 'some random string'
      const returnValue = 'some random code'
      const encoder = new TimeEncoder({ int11: () => '', int5: () => returnValue })
      encoder.addString(stringToEncode)
      expect(encoder.code).toEqual(`${returnValue}${stringToEncode}`)
    })
  })
})