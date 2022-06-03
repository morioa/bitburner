/** @param {NS} ns **/

export async function main(ns) {
    let audio = new AudioContext();
    let osc = audio.createOscillator();
    let gain = audio.createGain();
    let startTime = audio.currentTime;

    osc.connect(gain);
    gain.connect(audio.destination);

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
            gain.gain.value = 0.5;
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
            gain.gain.value = 0.5;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueCurveAtTime([f/3,f/2,f], startTime, startTime + d);
            osc.stop(startTime + d + fCycleDuration);
        },
        siren: function(ns) {
            let d = 1.0, fLo = 1200, fHi = 2400;
            let fCycleDuration = 1 / fLo;
            gain.gain.value = 0.5;
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
            gain.gain.value = 0.5;
            //osc.type = "sine";
            osc.start(startTime);
            osc.frequency.setValueAtTime(400, startTime);
            osc.frequency.setValueAtTime(525, startTime + 0.8);
            osc.frequency.setValueAtTime(700, startTime + 1.0);
            osc.frequency.setValueAtTime(650, startTime + 2.5);
            osc.frequency.setValueAtTime(525, startTime + 3.0);
            osc.frequency.setValueAtTime(450, startTime + 3.35);
            osc.frequency.setValueAtTime(585, startTime + 3.75);
            osc.frequency.setValueAtTime(f, startTime + 4.0);
            osc.stop(startTime + (d * 5));
        },
        whistle: function(ns) {
            let d = 0.25, fLo = 1200, fHi = 2400;
            let fCycleDuration = 1 / fLo;
            gain.gain.value = 0.5;
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
