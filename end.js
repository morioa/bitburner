import {listHosts} from "./util.common";

/** @param {NS} ns */
export async function main(ns) {
    const [
        script = null,
        host = "all",
        excludeHome = 0
    ] = ns.args;

    if (script === null) {
        await ns.tprintf("ERROR: You must specify a script to kill");
        ns.exit();
    }

    let hosts = (host !== "all")
            ? [host]
            : listHosts(ns),
        output = `INFO: Killing script '${script}'`;

    if (host === "all") {
        output += " on 'all' servers";
        if (excludeHome) {
            hosts = hosts.filter(h => h !== "home");
            output += " except 'home'";
        }
    } else {
        output += ` on '${host}'`;
    }

    await ns.tprintf(output);

    for (const host of hosts) {
        await ns.scriptKill(script, host);
    }
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const [
            script = null,
            host = null,
            excludeHome = null
        ] = args,
        acScripts = data.scripts.filter(s => s.indexOf("/") < 0),
        acHosts = ["all"].concat(data.servers);
    let ac = [];

    if (script === null || !acScripts.includes(script)) {
        ac = acScripts;
    } else if (host === null || !acHosts.includes(host)) {
        ac = acHosts;
    } else if (excludeHome === null) {
        ac = [0,1];
    }

    return ac;
}

