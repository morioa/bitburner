/** @param {NS} ns */
import * as common from "./util.common.js";
import * as breach from "./util.breach.js";

export function list(ns, moneyThresh = 0, hackableOnly = 0) {
	let hosts = common.listHostsOther(ns);
	let hostsDetails = [];

	for (let key1 in hosts) {
		let host = hosts[key1];

		let hostDetails = {};
		hostDetails["host"] = host;
		hostDetails["moneyMax"] = ns.getServerMaxMoney(host);
		hostDetails["moneyMaxFormatted"] = common.formatMoney(ns, hostDetails["moneyMax"]);
		hostDetails["moneyAvail"] = ns.getServerMoneyAvailable(host);
		hostDetails["securityLevel"] = ns.getServerSecurityLevel(host);
		hostDetails["securityLevelBase"] = ns.getServerBaseSecurityLevel(host);
		hostDetails["securityLevelMin"] = ns.getServerMinSecurityLevel(host);
		hostDetails["hasRootAccess"] = ns.hasRootAccess(host);
		hostDetails["hackLevelReq"] = ns.getServerRequiredHackingLevel(host);
		hostDetails["portsOpenReq"] = ns.getServerNumPortsRequired(host);

		if (hostDetails["moneyMax"] === 0 || hostDetails["moneyMax"] < moneyThresh) {
			continue;
		} else if (hackableOnly && breach.isHackable(ns, host) === false) {
			continue;
		} else if (hackableOnly && breach.isBreachable(ns, host) === false) {
			continue;
		}

		if (hostsDetails.length === 0) {
			hostsDetails.push(hostDetails);
		} else {
			let inserted = false;
			for (let key2 in hostsDetails) {
				let compareHostDetails = hostsDetails[key2];
				if (hostDetails['moneyMax'] < compareHostDetails['moneyMax']) {
					hostsDetails.splice(key2, 0, hostDetails);
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

export function getFirstHackableHost(ns, moneyThresh = 0) {
	return list(ns, moneyThresh, 1).shift();
}

export function getLastHackableHost(ns, moneyThresh = 0) {
	return list(ns, moneyThresh, 1).pop();
}

export function getNextHackableHost(ns, moneyThresh = 0) {
	//return list(ns, moneyThresh, 1).pop();
}