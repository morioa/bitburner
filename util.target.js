/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";

export function list(ns, moneyThresh = 0, hackableOnly = 0) {
	let hosts = commonUtil.listHostsOther(ns);
	let hostsDetails = [];

	for (let host of hosts) {
		let hostDetails = {};
		hostDetails["host"] = host;
		hostDetails["moneyMax"] = ns.getServerMaxMoney(host);
		//hostDetails["moneyMaxFormatted"] = commonUtil.formatMoney(ns, hostDetails["moneyMax"]);
		hostDetails["moneyAvail"] = Math.floor(ns.getServerMoneyAvailable(host));
		//hostDetails["moneyAvailFormatted"] = commonUtil.formatMoney(ns, hostDetails["moneyAvail");
		hostDetails["securityLevel"] = Math.floor(ns.getServerSecurityLevel(host));
		hostDetails["securityLevelMin"] = ns.getServerMinSecurityLevel(host);
		hostDetails["hasRootAccess"] = ns.hasRootAccess(host);
		hostDetails["maxRam"] = ns.getServerMaxRam(host);
		hostDetails["hackLevelReq"] = ns.getServerRequiredHackingLevel(host);
		hostDetails["portsOpenReq"] = ns.getServerNumPortsRequired(host);

		if (/*hostDetails["moneyMax"] === 0 ||*/ hostDetails["moneyMax"] < moneyThresh) {
			continue;
		}

		if (hackableOnly && breachUtil.isHackable(ns, host) === false) {
			continue;
		}

		if (hackableOnly && breachUtil.isBreachable(ns, host) === false) {
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

export function getNextHackableHost(ns, moneyThresh = 0) {
	//return list(ns, moneyThresh, 1).pop();
}