/** @param {NS} ns **/
import * as common from "./util.common.js";
import * as breach from "./util.breach.js";
import * as targets from "./util.targets.js";

export async function main(ns) {
	let target = ns.args[0];
	if (target == undefined || ns.serverExists(target) === false) {
		ns.tprint("Target server does not exist: " + target);
		ns.tprint("Targeting last hackable server instead");
		target = targets.getLastHackableHost(ns).host;
	}

	if (breach.breachHost(ns, target) === false) {
		ns.tprint("Target server is not breachable");
		ns.exit();
	}

	ns.tprint("Attacking " + target);

	let hosts = common.listHosts(ns, "home", []);
	let hostPurchasedPrefix = common.getHostPurchasedPrefix(ns);
	let hackScript = common.getHackScript(ns);

	for (let key in hosts) {
		let host = hosts[key];

		if (host === "home") {
			continue;
		}

		if (host.substr(0, hostPurchasedPrefix.length) === hostPurchasedPrefix 
		|| breach.breachHost(ns, host)) {
			await ns.killall(host);

			let hostRamMax = ns.getServerMaxRam(host);
			let hostRamUsed = ns.getServerUsedRam(host);
			let hostRamAvail = hostRamMax - hostRamUsed;

			if (hostRamAvail < common.getHackScriptRamCost(ns)) {
				continue;
			}

			let threadsCount = Math.floor(hostRamAvail / common.getHackScriptRamCost(ns));
		
			await ns.scp(hackScript, host);

			if (ns.fileExists(hackScript, host)) {
				ns.exec(hackScript, host, threadsCount, target);
			}
		}
	}
}