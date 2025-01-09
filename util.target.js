/** @param {NS} ns */
import {listHostsOther} from "./util.common.js";
import {isHackable, isBreachable} from "./util.breach.js";

export function list(ns, moneyThresh = 0, hackableOnly = 0, reverseMatch = 0) {
    let hosts = listHostsOther(ns),
        hostsDetails = [];

    for (let host of hosts) {
        let server = ns.getServer(host),
            hostDetails = {
                "host":host,
                "moneyMax":Math.floor(ns.getServerMaxMoney(host)),
                "moneyAvail":Math.floor(ns.getServerMoneyAvailable(host)),
                "securityLevel":Math.floor(ns.getServerSecurityLevel(host)),
                "securityLevelMin":ns.getServerMinSecurityLevel(host),
                "hasRootAccess":server.hasAdminRights,
                "hasBackdoor":server.backdoorInstalled,
                "maxRam":server.maxRam,
                "hackLevelReq":server.requiredHackingSkill,
                "portsOpenReq":server.numOpenPortsRequired
            };

        if (!isHackable(ns, host)) {
            hostDetails["hackLevelReq"] = "[[!" + hostDetails["hackLevelReq"];
        }

        if (!isBreachable(ns, host)) {
            hostDetails["portsOpenReq"] = "[[!" + hostDetails["portsOpenReq"];
        }

        if (hostDetails["moneyMax"] < moneyThresh) {
            continue;
        }

        if (reverseMatch) {
            if (hackableOnly && (!isHackable(ns, host, reverseMatch) && !isBreachable(ns, host, reverseMatch))) {
                continue;
            }
        } else if (hackableOnly && (!isHackable(ns, host, reverseMatch) || !isBreachable(ns, host, reverseMatch))) {
            continue;
        }

        if (hostsDetails.length === 0) {
            hostsDetails.push(hostDetails);
        } else {
            let inserted = false;
            for (let key in hostsDetails) {
                let compareHostDetails = hostsDetails[key];
                if (hostDetails['moneyMax'] < compareHostDetails['moneyMax']) {
                    hostsDetails.splice(key, 0, hostDetails);
                    inserted = true;
                    break;
                }
            }

            if (inserted === false) {
                hostsDetails.push(hostDetails);
            }
        }
    }

    return hostsDetails;
}

export function getTargetDetails(ns, host) {
    return list(ns, 0).filter(h => h.host === host).pop();
}

export function getFirstHackableHost(ns, moneyThresh = 0) {
    return list(ns, moneyThresh, 1).shift();
}

export function getLastHackableHost(ns, moneyThresh = 0) {
    return list(ns, moneyThresh, 1).pop();
}

export function getUnbreachedHosts(ns) {
    return list(ns).filter(h => !h.hasRootAccess);
}

export function getAllHosts(ns) {
    return list(ns);
}