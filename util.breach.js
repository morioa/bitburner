/** @param {NS} ns **/
import {listHostsConnections, showNotice, play} from "./util.common.js";

const portApps = [ "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe" ];

export async function breachAll(ns, args) {
    const [
        hosts,
        installBackdoor = 0,
        includeWD = 0
    ] = args;

    for (const [i, host] of Object.entries(hosts.filter(h => !h.hasRootAccess))) {
        await breachHost(ns, host.host);
    }

    if (installBackdoor) {
        await backdoorAll(ns, includeWD);
    } else {
        await showNotice(ns, "Breach processing complete");
        await play(ns, "drip");
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

    ns.tprint(`Breaching '${host}'`);

    for (const app of portApps) {
        if (isOwned(ns, app)) {
            let func = app.substr(0, app.indexOf(".")).toLowerCase();
            openPort[func](host);
        }
    }

    ns.nuke(host);

    return ns.hasRootAccess(host);
}

export async function backdoorAll(ns, includeWD) {
    const hostsConnections = listHostsConnections(ns),
        wdHost = "w0r1d_d43m0n";
    await ns.sleep(100);
    parentHost: for (const [i,ph] of Object.entries(hostsConnections)) {
        if (ph.host === "home") {
            continue parentHost;
        }

        ns.tprintf(`WARN: ${ph.host}`);
        childHost: for (const [j,ch] of Object.entries(ph.connections)) {
            if (parseInt(j) === 0) {
                let chServer = ns.getServer(ch);
                if (!chServer.isConnectedTo) {
                    if (!chServer.backdoorInstalled) {
                        let currHost = hostsConnections[(parseInt(i)-1)];
                        for (let ii = parseInt(i); ii > 0; ii--) {
                            let upHost = hostsConnections[(ii-1)];
                            if (upHost.connections.includes(currHost.host)) {
                                if (!ns.singularity.connect(upHost.host)) {
                                    ns.tprintf(`ERROR: ...connection to '${upHost.host}' failed [0-up]`);
                                    continue parentHost;
                                }
                                ns.tprintf(`INFO: ...connection to '${upHost.host}' succeeded [0-up]`);
                                currHost = upHost;
                            }
                            if (upHost.connections.includes(ch)) {
                                break;
                            }
                        }
                    }

                    if (!ns.singularity.connect(ch)) {
                        ns.tprintf(`ERROR: ...connection to '${ch}' failed [0]`);
                        continue parentHost;
                    }
                    ns.tprintf(`INFO: ...connection to '${ch}' succeeded [0]`);

                } else {
                    ns.tprintf(`INFO: ...connection to '${ch}' already established [0]`)
                }
                if (!includeWD && ph.host === wdHost) {
                    ns.tprintf(`WARN: Excluding ${wdHost}`);
                } else {
                    await backdoorHost(ns, ph.host);
                }
                continue childHost;
            }

            ns.tprintf(`${ph.host} => ${ch}`);
            if (!includeWD && ch === wdHost) {
                ns.tprintf(`WARN: Excluding ${wdHost}`);
            } else {
                await backdoorHost(ns, ch, ph.host);
            }
            if (!ns.singularity.connect(ph.host)) {
                ns.tprintf(`ERROR: ...connection to '${ph.host}' failed [1]`);
                continue parentHost;
            }
            ns.tprintf(`INFO: ...connection to '${ph.host}' succeeded [1]`);
        }
    }
    ns.singularity.connect("home");

    await showNotice(ns, "Backdoor processing complete");
    await play(ns, "drip");
}

export async function backdoorHost(ns, host, parent = null) {
    if (!await ns.singularity.connect(host)) {
        ns.tprintf(`ERROR: ...connection to '${host}' failed [2]`);
        return;
    }
    ns.tprintf(`INFO: ...connection to '${host}' succeeded [2]`);

    const server = ns.getServer(host);
    if (server.purchasedByPlayer ||
        server.backdoorInstalled ||
        !server.hasAdminRights ||
        !isHackable(ns, host)) {
        return;
    }

    ns.tprintf("INFO: ...installing backdoor");
    let result = await ns.singularity.installBackdoor(host);
}

export function isBreachable(ns, host, reverseMatch) {
    const breachable = (countOwned(ns) >= ns.getServerNumPortsRequired(host));
    return (reverseMatch) ? !breachable : breachable;
}

export function isHackable(ns, host, reverseMatch) {
    const hackable = (ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(host))
    return (reverseMatch) ? !hackable : hackable;
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