/** @param {NS} ns */
import {removeLastAttackParams} from "./util.common.js";

export async function main(ns) {
    // remove last attack commands file if it exists
    await removeLastAttackParams(ns);

    // stop all running processes
    await ns.run("end.js", 1, "watch.js", "home");
    await ns.run("end.js", 1, "_grow.js", "home");
    await ns.run("end.js", 1, "_hack.js", "home");
    await ns.run("end.js", 1, "_weaken.js", "home");
    await ns.run("end.js", 1, "_chesterTheMolester.js", "home");

    // launch first attack wave
    await ns.run("attack.js", 1, 4, 2, 1, 0);

    // start the watcher to earn quick money from hashes
    await ns.run("watch.js", 1, "hashes", "sell");

    // reminder
    await ns.tprintf("WARN: Remember to start mugging, buy TOR Router, buy BruteSSH.exe, and increase RAM ASAP, then run init.js to start the auto attack watcher when you have enough RAM.");
}
