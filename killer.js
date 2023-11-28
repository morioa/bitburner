import {listHosts} from "./util.common";

/** @param {NS} ns **/
export async function main(ns) {
    const hosts = listHosts(ns),
        [script, includeHome = 1] = ns.args;

    ns.tprintf(`INFO: Killing "${script}" on all servers ${(includeHome) ? "" : "except \"home\""}`);

    for (let host of hosts) {
        if (host === "home" && !includeHome) {
            continue;
        }

        ns.scriptKill(script, host);
    }
}
