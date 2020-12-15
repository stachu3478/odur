import CanvasRenderer from "./CanvasRenderer";
import OdurUICallback from "./OdurUICallback";

export default class OdurUI {
  constructor () {
    const canvas = document.getElementById("c")
    this.canvasRenderer = new CanvasRenderer(canvas)
    this.out1 = document.getElementById("pitchOut");
    this.out2 = document.getElementById("strOut");
    this.out3 = document.getElementById("urlOut");
    this.in1 = document.getElementById("noteLength");
    this.in2 = document.getElementById("noteVolume");
    this.barsDiv = document.getElementById("bars");
    this.insDiv = document.getElementById("instruments");
    this.ftsDiv = document.getElementById("soundFonts");
    this.effDiv = document.getElementById("effects");
    this.pressed = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
      z: false,
      x: false,
    };
    this.CURVESHTML = "<option>square</option><option>sawtooth</option><option>triangle</option><option>sine</option><option>rectangle1</option><option>rectangle2</option><option>bitNoise</option><option>hyperbolic</option><option>hyperbolic2</option>";
    document.getElementById("vCurveType").innerHTML = this.CURVESHTML + "<option selected>silence</option>"
    this.callback = new OdurUICallback(this.out2, this.out3, this.barsDiv, this.insDiv, this.refreshBars, this.canvasRenderer.render, this.in1, this.in2, this.insEl, this.pressed)
    this.canvasRenderer.uiCallback = this.callback
  }

  get tabs() {
    return new Array(...document.getElementsByClassName('tab'))
  }

  get tabButtons() {
    return new Array(...document.getElementsByClassName('tab-button'))
  }

  start() {
    this.bindListeners()
    this.canvasRenderer.render()
    this.refreshBars()
    this.out2.innerText = "Ready";
  }

  set logic(logic) {
    this._logic = logic
    this.canvasRenderer.logic = logic
  }

  bindListeners() {
    this.canvasRenderer.bindListeners()
    document.getElementById("load").oninput = this._logic.load
    document.body.onkeydown = (evt) => {
      this.pressed[evt.key] = true
    }
    document.body.onkeyup = (evt) => {
      this.pressed[evt.key] = false
    }

    document.getElementById('play-button').addEventListener('click', () => this._logic.play())
    document.getElementById('play-current-bar-button').addEventListener('click', () => this._logic.playCurrentBar())
    document.getElementById('stop-button').addEventListener('click', () => this._logic.stop())
    document.getElementById('build-button').addEventListener('click', () => this._logic.build())
    document.getElementById('save-button').addEventListener('click', () => this._logic.save())

    this.tabButtons.forEach(tabButton => {
      tabButton.addEventListener('click', (evt) => {
        this._setTab(evt.target.name)
        this.refreshBars()
      })
    })
  }

  refreshBars() {
    const bars = this._logic.bars
    const instruments = this._logic.instruments
    const effects = this._logic.effects
    if(!this.barsDiv.hidden){
      this.barsDiv.innerHTML = "";
      var choiceHTML = "";
      for(var i = 0;i < effects.length;i++){
        choiceHTML += "<option>Effects set " + (i + 1) + "</option>"; 
      };
      for(var i = 0;i < bars.length;i++){
        var el = document.createElement("div");
        el.innerHTML = "Bar "+ (i + 1) +"<br>Tempo: <span id=read" + i + ">" + bars[i].tempo + "</span><input id=bar" + i + " type=range min=15 max=480 value=" + bars[i].tempo + ">";
        //barsDiv.innerHTML += "<div>Bar "+ (i + 1) +"<br>Tempo: <span id=read" + i + ">" + bars[i].tempo + "</span><input id=bar" + i + " type=range min=15 max=480 value=" + bars[i].tempo + "></div>"
        el.oninput = (evt) => this._onRangeInputTempo(evt);
        var el1 = document.createElement("select");
        el1.innerHTML = choiceHTML;
        el1.id = "bre" + i;
        el1.value = "Effects set " + (bars[i].effects + 1);
        el1.oninput = (evt) => { bars[evt.target.id.slice(3)].effects = evt.target.value.slice(11)};
        el.appendChild(this._fastSpan("Effect set: "));
        el.appendChild(el1);
        this.barsDiv.appendChild(el);
      };
    }else if(!this.insDiv.hidden){
      this.insDiv.innerHTML = "";
      this.ftsDiv.innerHTML = "";
      for(var i = 0;i < instruments.length;i++){
        var el = document.createElement("div");
        var el2 = document.createElement("select");
        el2.innerHTML = this.CURVESHTML;
        el2.id = "ins" + i;
        el2.value = instruments[i].type;
        el2.oninput = (evt) => this._onInputIns(evt);
        el.innerHTML = "Soundfont "+ (i + 1) +"<br>Type: ";
        //insDiv.innerHTML += "<div>Soundfont "+ (i + 1) +"<br>Type: " + "<select id=ins" + i + " value=" + instruments[i].type + "><option>square</option><option>sawtooth</option></select>" + "</div>"
        this.insDiv.appendChild(el);
        el.appendChild(el2);
        var el = document.createElement("input");
        el.type = "radio";
        el.name = "ins";
        el.value = i;
        if(i == instruments.length - 1)el.checked = true;
        var el2 = document.createElement("span");
        el2.innerText = "Soundfont " + (i + 1);
        this.ftsDiv.appendChild(el);
        this.ftsDiv.appendChild(el2);
        this.ftsDiv.appendChild(document.createElement("br"));
      };
      var el = document.createElement("button");
      el.innerText = "New";
      el.onclick = () => { this._logic.createInstrument(); this.refreshBars() }
      this.insDiv.appendChild(el);
    }else if(!this.effDiv.hidden){
      this.effDiv.innerHTML = "";
      for(var i = 0;i < effects.length;i++){
        var eld = document.createElement("div");
        eld.id = "eff" + i;
        var el = document.createElement("input");
        el.type = "checkbox";
        el.checked = effects[i].echo.enabled;
        var el2 = document.createElement("input");
        el2.type = "number";
        el2.value = effects[i].echo.cycle;
        var el3 = document.createElement("input");
        el3.type = "number";
        el3.value = effects[i].echo.multipler;
        var el4 = document.createElement("input");
        el4.type = "number";
        el4.value = effects[i].echo.max;
        var el5 = document.createElement("input");
        el5.type = "number";
        el5.value = effects[i].echo.blur;
        eld.appendChild(this._fastSpan("Effect set " + (i + 1) + "<br>"));
        eld.appendChild(el);
        eld.appendChild(this._fastSpan("Enable echo: <br>Echo delay: "));
        eld.appendChild(el2);
        eld.appendChild(this._fastSpan("Echo multipler: "));
        eld.appendChild(el3);
        eld.appendChild(this._fastSpan("Number of cycles: "));
        eld.appendChild(el4);
        eld.appendChild(this._fastSpan("Echo blur: "));
        eld.appendChild(el5);
        eld.oninput = (evt) => {
          var target = evt.target.parentElement;
          var id = target.id.slice(3);
          var c = target.children
          const effect = effects[id]
          effect.echo.enabled = c[1].checked;
          effect.echo.cycle = parseFloat(c[3].value);
          effect.echo.multipler = parseFloat(c[5].value);
          effect.echo.max = parseInt(c[7].value) || 1;
          effect.echo.blur = parseFloat(c[9].value);
        };
        var el = document.createElement("button");
        el.innerText = "New";
        el.onclick = () => { this._logic.createEffectSet(); this.refreshBars() }
        eld.appendChild(el);
        this.effDiv.appendChild(eld);
      };
    }else{
      document.getElementById("barLength").value = this._logic.cfg.bl;
    };
  }

  _fastSpan(txt) {
    var el = document.createElement("span");
    el.innerHTML = txt;
    return el;
  }

  _instrumentChoice(id) {
    var code = "<select id=ins" + id + " value=" + this._logic.instruments[id].type + "><option>square</option><option>sawtooth</option></select>";
	  return code;
  }

  _onRangeInputTempo(evt){
    var el = evt.target;
    var id = el.id.slice(3);
    switch(el.id.slice(0,3)){
      case "bar": {
        this._logic.bars[id].tempo = parseInt(el.value);
        document.getElementById("read"+id).innerText = el.value;
      };break;
      case "bre": {
        this._logic.bars[id].effects = parseInt(el.value.slice(11)) - 1;
      };
    }
  }

  _onInputIns(evt){
    var el = evt.target;
    var id = el.id.slice(3);
    this._logic.instruments[id].type = el.value;
  }

  _setTab(name){
    console.log('tab ', name)
    this.tabs.forEach(tab => {
      tab.hidden = tab.getAttribute('name') !== name
      console.log(tab, tab.hidden)
    })
  }
}