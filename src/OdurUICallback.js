export default class OdurUICallback {
  constructor (out2, out3, barsDiv, insDiv, refreshBars, renderCanvas, in1, in2, pressed) {
    this.out2 = out2
    this.out3 = out3
    this.barsDiv = barsDiv
    this.insDiv = insDiv
    this.refreshBars = refreshBars
    this.renderCanvas = renderCanvas
    this.in1 = in1
    this.in2 = in2
    this.pressed = pressed || {}
  }

  audioStopping() {
    this.out2.innerText = "Stopping..."
  }

  audioStopped() {
    this.out2.innerText = "Ready"
  }

  audioStarted() {
    this.out2.innerText = "Playing..."
  }

  audioBuffering() {
    this.out2.innerText = "Buffering..."
  }

  downloadData(data, type) {
    var blob = new Blob([JSON.stringify(data)], {type});
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.download = document.getElementById("songName").value + ".JSON";
    anchor.click();
  }

  songLoaded(title) {
    document.getElementById("songName").value = title.slice(0, title.length - 5);
    this.renderCanvas();
    this.barsDiv.hidden = true;
    this.insDiv.hidden = false;
    this.refreshBars();
  }

  exportingToMP3() {
    this.out2.innerText = "Encoding..."
  }

  downloadMP3(mp3Data) {
    var blob = new Blob(mp3Data, {type: 'audio/mp3'});
    var url = window.URL.createObjectURL(blob);
    var anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.download = document.getElementById("songName").value + ".mp3";
    anchor.click();
    out3.innerHTML = "Converted to mp3 with lame.js, www.mp3dev.org";
    out2.innerText = "Ready";
  }

  set noteLength(v) {
    this.in1.value = v
  }

  get noteLength() {
    return this.in1.value
  }

  set noteVolume(v) {
    this.in2.value = v
  }

  get noteVolume() {
    return parseInt(this.in2.value)
  }

  get instrument() {
    return parseInt(this.insEl.value)
  }

  get insEl() {
    return document.querySelector("input[name=ins]:checked") || {value: 0};
  }

  get volumeCurve() {
    return {
      type: document.getElementById("vCurveType").value,
      start: parseFloat(document.getElementById("vCurveStart").value),
      end: parseFloat(document.getElementById("vCurveEnd").value),
      offset: parseFloat(document.getElementById("vCurveOffset").value),
      cycle: parseFloat(document.getElementById("vCurveCycle").value),
    }
  }
}