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

	let host = "home";
	let hackScript = commonUtil.getHackScript(ns);

	commonUtil.findProcessByName(ns, hackScript, host, true);

	let hostRamReserved = 16;
	let hostRamMax = ns.getServerMaxRam(host);
	let hostRamUsed = ns.getServerUsedRam(host);
	let hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;

	if (hostRamAvail <= 0) {
		ns.tprint("Insufficient memory to execute attack");
		ns.exit();
	}

	let threadsCount = Math.floor(hostRamAvail / commonUtil.getHackScriptRamCost(ns));

	if (ns.fileExists(hackScript, host)) {
		ns.tprint("Attacking " + target);
		ns.run(hackScript, threadsCount, target);
		commonUtil.findProcessByName(ns, hackScript, host);
	}

	await ns.sleep(1);
}