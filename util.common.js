/** @param {NS} ns **/

export function getInitScript(ns) {
	return "init.js";
}

export function getServerPurchaseScript(ns) {
	return "purchaseServers.js";
}

export function getLocalAttackScript(ns) {
	return "attackHome.js";
}

export function getRemoteAttackScript(ns) {
	return "attackRemote.js";
}

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
		ns.tprint("Returning -1");
		return -1;
	}

	ns.tprint("Returning parsed value");
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
	let processes = ns.ps(host);
	for (let key in processes) {
		let process = processes[key];
		if (process.filename === name) {
			if (kill) {
				ns.kill(process.pid, host);
			} else {
				return process;
			}
		}
	}
	/*
	ns.ps(host).forEach(function (process) {
		if (process.filename === name) {
			if (kill) {
				ns.kill(process.pid, host);
			} else {
				return process;
			}
		}
	});
	*/

	return null;
}

export function formatMoney(ns, money) {
	return "$" + parseInt(money).toString().replace(/(.)(?=(\d{3})+$)/g,'$1,');
}