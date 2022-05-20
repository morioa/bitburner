/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";

export async function main(ns) {
	ns.tprint("This script is outdated -- terminating");
	ns.exit();

	let target = ns.args[0];
	if (target == undefined || ns.serverExists(target) === false) {
		ns.tprint("Target server does not exist: " + target);
		target = targetUtil.getLastHackableHost(ns).host;
		ns.tprint("Targeting last hackable server instead: " + target);
	}

	if (breachUtil.breachHost(ns, target) === false) {
		ns.tprint("Target server is not breachable");
		ns.exit();
	}

	ns.tprint("Attacking " + target);

	let hosts = commonUtil.listHosts(ns, "home", []);
	let hostPurchasedPrefix = commonUtil.getHostPurchasedPrefix(ns);
	let hackScript = commonUtil.getHackScript(ns);

	for (let host of hosts) {
		if (host === "home") {
			continue;
		}

		if (host.substr(0, hostPurchasedPrefix.length) === hostPurchasedPrefix 
		|| breachUtil.breachHost(ns, host)) {
			await ns.killall(host);

			let hostRamMax = ns.getServerMaxRam(host);
			let hostRamUsed = ns.getServerUsedRam(host);
			let hostRamAvail = hostRamMax - hostRamUsed;

			if (hostRamAvail < commonUtil.getHackScriptRamCost(ns)) {
				continue;
			}

			let threadsCount = Math.floor(hostRamAvail / commonUtil.getHackScriptRamCost(ns));
		
			await ns.scp(hackScript, host);

			if (ns.fileExists(hackScript, host)) {
				ns.exec(hackScript, host, threadsCount, target);
			}
		}
	}
}