export default class AudioPlayer {
  constructor () {
    this.AudioContext = window.AudioContext || window.webkitAudioContext
    this.ctx = new AudioContext({ //tworzy główny obiekt do przetwarzania dźwięku
      latencyHint: 'interactive',
      sampleRate: 44100,
    })
    this.osc = {
      silence: function(){
        return 0;
      },
      square: function(k,cycle,chalf,v){
        return (k % cycle > chalf ? v : -v);
      },
      sawtooth: function(k,c,h,v){
        return (((k % c)/c) * v - v/2) * 2;
      },
      triangle: function(k,c,h,v){
        return (k % c > h ? 1 : -1) * this.sawtooth(k,h,h/2,v);
      },
      sine: function(k,c,h,v){
        return Math.sin(((k % c)/c) * 2 * Math.PI) * v;
      },
      rectangle1: function(k,c,h,v){
        return (k % c > (h/2) ? v : -v);
      },
      rectangle2: function(k,c,h,v){
        return (k % c > (h/4) ? v : -v);
      },
      bitNoise: function(k,c,h,v){
        return v * Math.round(Math.random() * 2 - 1);
      },
      hyperbolic: function(k,c,h,v){
        return (k % c > h ? Math.sqrt((k % h) / h) : -Math.sqrt(1 - ((k % h) - h) / h)) * v;
      },
      hyperbolic2: function(k,c,h,v){
        return (1 - Math.sqrt(4 * ((k % c) / c))) * v; 
      },
    }
    
  }

  set uiCallback(callback) {
    this._uiCallback = callback
  }

  play (alternativeBars, barLength, effects, instruments) {
    this._uiCallback.audioBuffering()
    var bars2play = [];
    if(typeof alternativeBars == 'object'){
      bars2play = alternativeBars;
    }else{
      bars2play = bars;
    }
    var length = 0;
    for(var i = 0;i < bars2play.length;i++){
      length += barLength * 60/ bars2play[i].tempo;
    };
    var buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * length, this.ctx.sampleRate);
    let channel = buffer.getChannelData(0);
    var timeStamp = 0;
    for(var i = 0;i < bars2play.length;i++){
      var bar = bars2play[i];
      var beatLength = (60 / bar.tempo) * this.ctx.sampleRate;
      var ef = effects[bar.effects || 0];
      var ec = ef.echo;
      console.log(ec);
      var eb = ec.blur * beatLength;
      for(var j = 0;j < bar.notes.length;j++){
        var note = bar.notes[j];
        if(note){
          var noteLength = note.length * beatLength;
          var frequency = Math.pow(2,(-81 + note.pitch) / 12) * 440;
          var cycle = this.ctx.sampleRate / frequency;
          var chalf = cycle / 2;
          var vc = note.vCurve;
          var startTime = (timeStamp + note.time * (60 / bar.tempo) ) * this.ctx.sampleRate;
          for(var k = 0;k < noteLength;k++){ //robi kwadracik
            var change = this.osc[instruments[note.instrument || 0].type || "square"](k,cycle,chalf,0.2 * note.volume * (vc.type !== "silence" ? ((this.osc[vc.type](k + vc.offset * beatLength,vc.cycle * beatLength,vc.cycle * beatLength / 2,(vc.end - vc.start) / 2) + (vc.start + vc.end) / 2 )) : 1));
            var pos = Math.round(startTime + k);
            if(Math.abs(channel[pos] + change) <= 1)
            channel[pos] += change;
            if(ec.enabled){
              var ecycle = ec.cycle * beatLength;
              var multipler = ec.multipler || 1;
              if(eb == 0){
                for(var l = 0;l < ec.max;l++){
                  var l = l + 1;
                  var pos1 = pos + ecycle * l;
                  var c = change * multipler;
                  if(Math.abs(channel[pos1] + c) <= 1)
                    channel[pos1] += c;
                  multipler *= ec.multipler;
                };
              }else{
                for(var l = 0;l < ec.max;l++){
                  var l = l + 1;
                  var pos = pos + ecycle * l - l * eb;
                  var c = (change * multipler) / (l * 2);
                  for(var m = 0;m <= l;m++){
                    if(Math.abs(channel[pos] + c) <= 1)
                      channel[pos] += c;
                    pos += eb;
                  };
                  multipler *= multipler;
                };
              };
            };
          };
        }
      };
      timeStamp += barLength * 60 / bar.tempo;
    };
    for(var i = channel.length - 1;i > 0;i--){ //skraca ciszę
      if(channel[i] && (Math.abs(channel[i]) > 0.00001)){
        channel = channel.subarray(0,i);
        break;
      };
    };
      // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    this.source = this.ctx.createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    this.source.buffer = buffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    this.source.connect(this.ctx.destination);
    // start the source playing
    this.source.start();
    this.source.onended = this._uiCallback.audioStopped
    this._uiCallback.audioStarted()
  }

  stop(){
    if(this.source) {
      this._uiCallback.audioStopping()
      this.source.stop()
      this._uiCallback.audioStopped()
    }
  }
}