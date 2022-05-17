/** @param {NS} ns **/
const portApps = [ "BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe" ];

export function breachHost(ns, host) {
	if (ns.hasRootAccess(host)) {
		return true;
	}

	if (isBreachable(ns, host) === false || isHackable(ns, host) === false) {
		return false;
	}

	ns.tprint("Breaching " + host);

	for (var key in portApps) {
		if (isOwned(ns, portApps[key])) {
			switch (portApps[key].substr(0, portApps[key].indexOf(".")).toLowerCase()) {
				case 'brutessh':
					ns.brutessh(host);
					break;

				case 'ftpcrack':
					ns.ftpcrack(host);
					break;

				case 'relaysmtp':
					ns.relaysmtp(host);
					break;

				case 'httpworm':
					ns.httpworm(host);
					break;

				case 'sqlinject':
					ns.sqlinject(host);
					break;

				default:
					// should never get here
			}
			
			/* I really wish this worked...
			let breachFunc = portApps[key].substr(0, portApps[key].indexOf(".")).toLowerCase();
			this["ns." + breachFunc](host);
			*/
		}
	}

	ns.nuke(host);

	return ns.hasRootAccess(host);
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
	for (let key in portApps) {
		owned += isOwned(ns, portApps[key]);
	}
	return owned;
}