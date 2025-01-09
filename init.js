/** @param {NS} ns */
import {getAttackScript, getWatcherScript, removeLastAttackParams} from "./util.common.js";

export async function main(ns) {
    const [moneyThresh = 1] = ns.args;

    // remove last attack commands file if it exists
    await removeLastAttackParams(ns);

    // launch first attack wave
    await ns.run(getAttackScript(ns), 1, 4, 2, 1, 0);

    // start the watcher
    await ns.run(getWatcherScript(ns), 1, "hackable", 1, moneyThresh);
    // This tells the watcher to auto-attack when ----^
    // a new target is found, so that is why the launch
    // of the first attack wave below is commented out,
    // as there is no need to trigger it as the watcher
    // will handle it automatically. If you do not want
    // the watcher to handle it automatically, then
    // remove the last argument and uncomment the
    // launch of the first attack below or run attacks
    // manually via the Terminal.
}
