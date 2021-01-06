import PiezoConverter from './PiezoConverter'

describe('PiezoConverter', () => {
  describe('#convert', () => {
    it ('converts song', () => {
      const notes = [
        { time: 0, pitch: 40, length: 1},
        { time: 2, pitch: 43, length: 1},
        { time: 2, pitch: 45, length: 3},
      ]
      const timeEncoder = { 
        addChar: jest.fn(),
        addString: jest.fn(),
        encode: jest.fn(),
        flush: jest.fn(),
        code: 'code'
      }
      const piezoConverter = new PiezoConverter(timeEncoder)
      const prompts = [4, 'xd']
      let prompt = 0
      const result = piezoConverter.convert(notes, 200, jest.fn(() => prompts[prompt++]))
      expect(result).toBe('code')
      expect(timeEncoder.addChar.mock.calls.length).toBe(2)
      expect(timeEncoder.addChar.mock.calls[0][0]).toBe(prompts[0])
      expect(timeEncoder.addChar.mock.calls[1][0]).toBe(3)
      expect(timeEncoder.addString.mock.calls.length).toBe(1)
      expect(timeEncoder.addString.mock.calls[0][0]).toBe(prompts[1])
      expect(timeEncoder.encode.mock.calls.length).toBe(5)
      expect(timeEncoder.encode.mock.calls[0][0]).toStrictEqual([4])
      expect(timeEncoder.encode.mock.calls[1][0]).toStrictEqual([])
      expect(timeEncoder.encode.mock.calls[2][0]).toStrictEqual([7 + 2 / 15, 9 + 2 / 15])
      expect(timeEncoder.encode.mock.calls[3][0]).toStrictEqual([9 + 2 / 15])
      expect(timeEncoder.encode.mock.calls[4][0]).toStrictEqual([9 + 2 / 15])
      expect(timeEncoder.flush.mock.calls.length).toBe(1)
    })
  })
})