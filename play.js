/** @param {NS} ns **/
export async function main(ns) {
    let bufferSize = 4096;
    let audio = new AudioContext();
    let osc = audio.createOscillator();
    let gain = audio.createGain();

    // https://noisehack.com/custom-audio-effects-javascript-web-audio-api/#noise-convolver
    let convolver = (function() {
        var convolver = audio.createConvolver(),
            noiseBuffer = audio.createBuffer(2, 0.5 * audio.sampleRate, audio.sampleRate),
            left = noiseBuffer.getChannelData(0),
            right = noiseBuffer.getChannelData(1);
        for (var i = 0; i < noiseBuffer.length; i++) {
            left[i] = Math.random() * 2 - 1;
            right[i] = Math.random() * 2 - 1;
        }
        convolver.buffer = noiseBuffer;
        return convolver;
    })();
    // https://noisehack.com/custom-audio-effects-javascript-web-audio-api/#moog-filter
    var moog = (function() {
        var node = audio.createScriptProcessor(bufferSize, 1, 1);
        var in1, in2, in3, in4, out1, out2, out3, out4;
        in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
        node.cutoff = 0.065; // between 0.0 and 1.0
        node.resonance = 3.99; // between 0.0 and 4.0
        node.onaudioprocess = function(e) {
            var input = e.inputBuffer.getChannelData(0);
            var output = e.outputBuffer.getChannelData(0);
            var f = node.cutoff * 1.16;
            var fb = node.resonance * (1.0 - 0.15 * f * f);
            for (var i = 0; i < bufferSize; i++) {
                input[i] -= out4 * fb;
                input[i] *= 0.35013 * (f*f)*(f*f);
                out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
                in1 = input[i];
                out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
                in2 = out1;
                out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
                in3 = out2;
                out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
                in4 = out3;
                output[i] = out4;
            }
        }
        return node;
    })();
    // https://noisehack.com/custom-audio-effects-javascript-web-audio-api/#bitcrusher
    let bitcrusher = (function() {
        var node = audio.createScriptProcessor(bufferSize, 1, 1);
        node.bits = 4; // between 1 and 16
        node.normfreq = 0.1; // between 0.0 and 1.0
        var step = Math.pow(1/2, node.bits);
        var phaser = 0;
        var last = 0;
        node.onaudioprocess = function(e) {
            var input = e.inputBuffer.getChannelData(0);
            var output = e.outputBuffer.getChannelData(0);
            for (var i = 0; i < bufferSize; i++) {
                phaser += node.normfreq;
                if (phaser >= 1.0) {
                    phaser -= 1.0;
                    last = step * Math.floor(input[i] / step + 0.5);
                }
                output[i] = last;
            }
        };
        return node;
    })();

    let startTime = audio.currentTime;

    let pipeline = [osc, gain, /*bitcrusher, convolver,*/ audio.destination];

    pipeline.reduce((p, c) => {
        p['connect'](c);
        return c;
    });

    /*
    let wavetable = loadWavetable(ns, "__wavetable.js");
    let wave = audio.createPeriodicWave(wavetable.real, wavetable.imag);
    osc.setPeriodicWave(wave);
    osc.connect(audio.destination);
    */

    const play = {
        beep: function(ns) {
            let d = 0.045, f = 1200;
            let fCycleDuration = 1 / f;
            gain.gain.value = 0.3;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueAtTime(f, startTime);
            osc.frequency.setValueAtTime(0, startTime + d);
            osc.frequency.setValueAtTime(f, startTime + (d * 2));
            osc.frequency.setValueAtTime(0, startTime + (d * 3));
            osc.frequency.setValueAtTime(f, startTime + (d * 4));
            osc.stop(startTime + (d * 5) + fCycleDuration);
        },
        drip: function(ns) {
            let d = 0.075, f = 1200;
            let fCycleDuration = 1 / f;
            gain.gain.value = 0.3;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueCurveAtTime([f/3,f/2,f], startTime, startTime + d);
            osc.stop(startTime + d + fCycleDuration);
        },
        siren: function(ns) {
            let d = 1.0, fLo = 1200, fHi = 2400;
            let fCycleDuration = 1 / fLo;
            gain.gain.value = 0.3;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueCurveAtTime([fLo,fHi,fLo,fHi,fLo,fHi,fLo], startTime, startTime + d);
            osc.stop(startTime + d + fCycleDuration);
        },
        tone: function(ns) {
            let f = 440;
            let fCycleDuration = 1 / f;
            osc.frequency.value = f;
            osc.start(startTime);
            osc.stop(startTime + 1 + fCycleDuration);
        },
        trek: function(ns) {
            let d = 1.0, f = 785;
            let fCycleDuration = 1 / f;
            gain.gain.value = 0.3;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueAtTime(400, startTime);
            osc.frequency.setValueAtTime(530, startTime + 0.8);
            osc.frequency.setValueAtTime(710, startTime + 1.0);
            osc.frequency.setValueAtTime(660, startTime + 2.5);
            osc.frequency.setValueAtTime(525, startTime + 3.0);
            osc.frequency.setValueAtTime(450, startTime + 3.35);
            osc.frequency.setValueAtTime(585, startTime + 3.75);
            osc.frequency.setValueAtTime(f, startTime + 4.0);
            osc.stop(startTime + (d * 5));
        },
        whistle: function(ns) {
            let d = 0.25, fLo = 1200, fHi = 2400;
            let fCycleDuration = 1 / fLo;
            gain.gain.value = 0.3;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueCurveAtTime([fHi, fLo, fHi], startTime, startTime + d);
            osc.stop(startTime + d + fCycleDuration);
        }
    };

    if (ns.args[0] != undefined && play.hasOwnProperty(ns.args[0])) {
        await play[ns.args[0]](ns);
    }
}

function loadWavetable(ns, file) {
    return JSON.parse(
        ns.read(file)              // read contents of file
            .replace(/\s/gm, "")   // remove all whitespace
            .replace(/'/g, '"')    // convert single quotes to double quotes
            .replace(/,]/g, ']')   // remove trailing commas before brackets
            .replace(/,}/g, '}')   // remove trailing commas before braces
    );
}