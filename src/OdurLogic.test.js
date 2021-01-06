import OdurLogic from './OdurLogic'

describe('OdurLogic', () => {
  describe('#playCurrentBar', () => {
    it ('play bar based on ui callback scrolling', () => {
      const audioPlayer = { play: jest.fn() }
      const logic = new OdurLogic(audioPlayer)
      const MockUiCallback = class { get scrollY() { return 1000 } }
      logic.uiCallback = new MockUiCallback()
      logic.bars = new Array(10).fill(1).map(() => ({}))
      logic.playCurrentBar()
      expect(audioPlayer.play.mock.calls[0][0].length).toEqual(1)
      expect(audioPlayer.play.mock.calls[0][0][0]).toBe(logic.bars[3])
      expect(audioPlayer.play.mock.calls[0][1]).toBe(logic.cfg.bl)
      expect(audioPlayer.play.mock.calls[0][2]).toBe(logic.effects)
      expect(audioPlayer.play.mock.calls[0][3]).toBe(logic.instruments)
    })
  })
})