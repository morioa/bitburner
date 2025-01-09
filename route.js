import {listHosts, listHostsConnections} from "./util.common.js";
import {renderTable} from "./util.table.js";

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
    const [action, host = null] = args;
    let routes = listHostsConnections(ns);

    if (host !== null) {
        for (let i = 0; i < routes.length; i++) {
            if (routes[i].host === host) {
                routes[i].host = "[[@" + routes[i].host;
                routes[i].backdoor = "[[@" + routes[i].backdoor;
                routes[i].connections = "[[@" + routes[i].connections;
            }
        }
    }

    await renderTable(ns, "ROUTES", routes, true);
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const t = this,
        [action = null, a1 = null] = args,
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
            if (a1 === null || !data.servers.includes(a1)) {
                ac = data.servers;
            }
            break;

        default:
            ac = actions;
    }

    return ac;
}
