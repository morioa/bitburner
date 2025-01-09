import {breachAll} from "./util.breach";
import {formatMoney} from "./util.common.js";
import {renderTable} from "./util.table.js";
import {getUnbreachedHosts, list} from "./util.target.js";

/** @param {NS} ns */
export async function main(ns) {
    const [action = "find"] = ns.args;

    try {
        if (typeof eval(action) !== "function") {
            throw new Error("A valid action must be specified");
        }
    }
    catch (e) {
        await ns.tprintf(`ERROR: ${e.message}`);
        ns.exit();
    }

    await eval(action)(ns, ns.args);
}

/**
 * @param {NS} ns
 * @param args
 * @returns {Promise<void>}
 */
export async function find(ns, args) {
    const [
            action,
            moneyThresh = 0,
            hackableOnly = 0,
            reverseMatch = 0
        ] = args,
        targets = await list(ns, moneyThresh, hackableOnly, reverseMatch);

    await renderTable(ns, "TARGETS", targets, true, true);
    await ns.tprintf(`INFO: Found all ${targets.length}${(hackableOnly) ? ((reverseMatch) ? " non-hackable" : " hackable") : ""} hosts with at least ${formatMoney(ns, moneyThresh)} max money`);
}

/**
 * @param {NS} ns
 * @param args
 * @returns {Promise<void>}
 */
export async function breach(ns, args) {
    const [
        action,
        installBackdoor = 0,
        includeWD = 0
    ] = args;
    await breachAll(ns, [getUnbreachedHosts(ns), installBackdoor, includeWD]);
    await find(ns, ["find", 0, 1]);
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const t = this,
        [
            action = null,
            a1 = null,
            a2 = null,
            a3 = null
        ] = args,
        excludedMethods = [
            "main",
            "autocomplete"
        ],
        actions = Object.getOwnPropertyNames(t).filter(function (p) {
            return (typeof t[p] === "function" && !excludedMethods.includes(p));
        });
    let ac = [];

    switch (action) {
        case "find":
            if (a1 !== null && (a2 === null || a3 === null)) {
                ac = [0, 1];
            }
            break;

        case "breach":
            if (a1 === null) {
                ac = [0, 1]; // breach all
            } else if (a2 === null) {
                ac = [0, 1]; // backdoor all
            }
            break;

        default:
            ac = actions;
    }

    return ac;
}
