/** @param {NS} ns **/
import * as isUtil from "./util.is.js";

export async function main(ns) {
    let context = new AudioContext();
    let osc = context.createOscillator();
    let gain = context.createGain();
    let now = context.currentTime;

    osc.connect(gain);
    gain.connect(context.destination);

    const play = {
        beep: function(ns) {
            let d = 0.045, f = 1200;
            gain.gain.value = 0.5;
            osc.type = "sine";
            osc.start();
            osc.frequency.setValueAtTime(f, now);
            osc.frequency.setValueAtTime(0, now + d);
            osc.frequency.setValueAtTime(f, now + (d * 2));
            osc.frequency.setValueAtTime(0, now + (d * 3));
            osc.frequency.setValueAtTime(f, (d * 4));
            osc.stop(now + (d * 5));
        },
        drip: function(ns) {
            let d = 0.075;
            gain.gain.value = 0.5;
            osc.type = "sine";
            osc.start();
            osc.frequency.setValueCurveAtTime([400,600,1200], now, now + d);
            osc.stop(now + d);
        },
        siren: function(ns) {
            let d = 1.0, fLo = 600, fHi = 1200;
            gain.gain.value = 0.5;
            osc.type = "sine";
            osc.start();
            osc.frequency.setValueCurveAtTime([fLo, fHi, fLo, fHi, fLo, fHi, fLo], now, now + d);
            osc.stop(now + d);
        },
        trek: function(ns) {
            let d = 1.0, f = 400;
            gain.gain.value = 0.5;
            osc.type = "sine";
            osc.start();
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(525, now + 0.8);
            osc.frequency.setValueAtTime(700, now + 1.0);
            osc.frequency.setValueAtTime(650, now + 2.5);
            osc.frequency.setValueAtTime(525, now + 3.0);
            osc.frequency.setValueAtTime(450, now + 3.35);
            osc.frequency.setValueAtTime(585, now + 3.75);
            osc.frequency.setValueAtTime(785, now + 4.0);
            osc.stop(now + (d * 5));
        },
    };

    if (ns.args[0] != undefined && play.hasOwnProperty(ns.args[0])) {
        await play[ns.args[0]](ns);
    }
}

