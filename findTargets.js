import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";
import * as breachUtil from "./util.breach";

/** @param {NS} ns */
export async function main(ns) {
    if (isUtil.valueEqual(ns, ns.args[0], "breach")) {
        await breach(ns, ns.args[1]);
    } else if (isUtil.valueEqual(ns, ns.args[0], "backdoor")) {
        await breachUtil.backdoorAll(ns);
    } else {
        await list(ns);
    }
}

/** @param {NS} ns */
async function list(ns) {
    let moneyThresh = (isUtil.numberValid(ns, ns.args[0]))
            ? ns.args[0]
            : 0,
        hackableOnly = (isUtil.numberEqual(ns, ns.args[1], 1));

    //ns.tprint(targetUtil.list(ns, moneyThresh, hackableOnly));

    await tableUtil.renderTable(ns, "TARGETS", targetUtil.list(ns, moneyThresh, hackableOnly), true, true);
    ns.tprintf(`INFO: Listed ${(hackableOnly) ? "hackable" : "all"} hosts with at least ${commonUtil.formatNumber(ns, moneyThresh, "shorthand", true)} max money`);
}

/**
 * @param ns
 * @param installBackdoor
 * @returns {Promise<void>}
 */
async function breach(ns, installBackdoor = false) {
    await breachUtil.breachAll(ns, targetUtil.getUnbreachedHosts(ns), installBackdoor);
}

export function autocomplete(data, args) {

    return ["help","cost",524288,1048576];
}
