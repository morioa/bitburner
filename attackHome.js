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

	let host = "home";
	let hackScript = common.getHackScript(ns);

	common.findProcessByName(ns, hackScript, host, true);

	let hostRamReserved = 16;
	let hostRamMax = ns.getServerMaxRam(host);
	let hostRamUsed = ns.getServerUsedRam(host);
	let hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;

	if (hostRamAvail <= 0) {
		ns.tprint("Insufficient memory to execute attack");
		ns.exit();
	}

	let threadsCount = Math.floor(hostRamAvail / common.getHackScriptRamCost(ns));

	if (ns.fileExists(hackScript, host)) {
		ns.tprint("Attacking " + target);
		ns.run(hackScript, threadsCount, target);
		common.findProcessByName(ns, hackScript, host);
	}

	await ns.sleep(1);
}