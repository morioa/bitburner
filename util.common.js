/** @param {NS} ns **/

/*
export function getInitScript(ns) {
	return "init.js";
}
*/

export function getScriptsPurchaseScript(ns) {
	return "purchaseScripts.js";
}

export function getServerPurchaseScript(ns) {
	return "purchaseServers.js";
}

export function getWatcherScript(ns) {
	return "watcher.js";
}

export function getAttackScript(ns) {
	return "attack.js";
}

/*
export function getLocalAttackScript(ns) {
	return "attackHome.js";
}

export function getRemoteAttackScript(ns) {
	return "attackRemote.js";
}
*/

export function getHackScript(ns) {
	return "chesterTheMolester.js";
}

export function getHackScriptRamCost(ns) {
	return ns.getScriptRam(getHackScript(ns));
}

export function getHostPurchasedPrefix(ns) {
	return "pserv-";
}

export function getLastHostPurchasedId(ns) {
	let hosts = listHostsOwned(ns, false);

	if (hosts.length === 0) {
		return -1;
	}

	return hosts[hosts.length - 1].substring(hosts[hosts.length - 1].lastIndexOf("-") + 1);
}

export function getNextHostPurchasedId(ns) {
	return Number(getLastHostPurchasedId(ns)) + 1;
}

export function getNextHostPurchasedName(ns) {
	return getHostPurchasedPrefix(ns) + getNextHostPurchasedId(ns);
}

export function listHosts(ns, host, hostList) {
	if (hostList.indexOf(host) == -1) {
		hostList.push(host);
		ns.scan(host).forEach(host => listHosts(ns, host, hostList));
	}
	return hostList;
}

export function listHostsOwned(ns, includeHome = true) {
	let hosts = [];

	if (includeHome) {
		hosts.push("home");
	}

	return hosts.concat(ns.getPurchasedServers());
}

export function listHostsOther(ns) {
	return listHosts(ns, "home", []).filter(host => !listHostsOwned(ns).includes(host));
}

export function findProcessByName(ns, name, host, kill = false) {
	let allProcesses = ns.ps(host);
	let processes = [];
	for (let process of allProcesses) {
		if (process.filename === name) {
			if (kill) {
				ns.kill(process.pid, host);
			} else {
				processes.push(process);
			}
		}
	}

	if (processes.length > 0) {
		return processes;
	}

	return null;
}

export function formatMoney(ns, money) {
	return "$" + parseInt(money).toString().replace(/(.)(?=(\d{3})+$)/g,'$1,');
}
