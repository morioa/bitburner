/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";

const portApps = [ "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe" ];

export async function breachAll(ns, hosts) {
    for (const [i, host] of Object.entries(hosts.filter(h => !h.hasRootAccess))) {
        await breachHost(ns, host.host);
    }
}

export async function breachHost(ns, host) {
    const openPort = {
        brutessh: ns.brutessh,
        ftpcrack: ns.ftpcrack,
        relaysmtp: ns.relaysmtp,
        httpworm: ns.httpworm,
        sqlinject: ns.sqlinject
    }

    if (ns.hasRootAccess(host)) {
        return true;
    }

    if (isBreachable(ns, host) === false || isHackable(ns, host) === false) {
        return false;
    }

    ns.tprint("Breaching " + host);

    for (const app of portApps) {
        if (isOwned(ns, app)) {
            let func = app.substr(0, app.indexOf(".")).toLowerCase();
            openPort[func](host);
        }
    }

    ns.nuke(host);

    return ns.hasRootAccess(host);
}

export async function backdoorAll(ns) {
    let hostsConnections = commonUtil.listHostsConnections(ns);
    for (const [i,h] of Object.entries(hostsConnections)) {
        ns.tprintf(`WARN: ${h.host}`);
        await backdoorHost(ns, h.host);
        for (const conn of h.connections) {
            ns.tprintf(`${h.host} => ${conn}`);
            await backdoorHost(ns, conn, h.host);
            ns.tprintf(`INFO: Reconnecting to ${h.host}`);
            if (!ns.connect(h.host)) {
                ns.tprintf("ERROR: ...failed");
                return;
            }
            ns.tprintf("INFO: ...succeeded");
        }
    }
    ns.connect("home");
    commonUtil.showNotice(ns, "Backdoor processing complete");
    commonUtil.play(ns, "trek");
}

export async function backdoorHost(ns, host, parent = null) {
    ns.tprintf(`INFO: Connecting to ${host}`);
    if (!ns.connect(host)) {
        ns.tprintf("ERROR: ...failed");
        return;
    }
    ns.tprintf("INFO: ...succeeded");

    const server = ns.getServer(host);
    if (server.purchasedByPlayer ||
        server.backdoorInstalled ||
        !server.hasAdminRights) {
        return;
    }

    ns.tprintf("INFO: Installing backdoor");
    let result = await ns.installBackdoor(host);
}

export function isBreachable(ns, host) {
    return (countOwned(ns) >= ns.getServerNumPortsRequired(host));
}

export function isHackable(ns, host) {
    return (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(host));
}

export function isOwned(ns, app) {
    return ns.fileExists(app, "home");
}

export function countOwned(ns) {
    let owned = 0;
    for (const app of portApps) {
        owned += isOwned(ns, app);
    }
    return owned;
}