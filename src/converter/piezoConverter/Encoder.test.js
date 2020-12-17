import Encoder from './Encoder'

describe('Encoder', () => {
  describe('#int5', () => {
    it ('returns space', () => {
      expect(Encoder.int5(0)).toBe(' ')
    })

    it ('returns A', () => {
      expect(Encoder.int5(33)).toBe('A')
    })

    it ('returns ~', () => {
      expect(Encoder.int5(94)).toBe('~')
    })
  })

  describe('#int11', () => {
    it ('returns 2 spaces', () => {
      expect(Encoder.int11(0)).toBe('  ')
    })

    it ('returns space and !', () => {
      expect(Encoder.int11(95)).toBe(' !')
    })

    it ('returns ~ and space', () => {
      expect(Encoder.int11(94)).toBe('~ ')
    })

    it ('returns ~~', () => {
      expect(Encoder.int11(94 * 95 + 94)).toBe('~~')
    })
  })
})