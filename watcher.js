/** @param {NS} ns */
import * as common from "./util.common.js";
import * as targets from "./util.targets.js";

export async function main(ns) {
	if ((ns.args[0] == undefined) === false) {
		ns.tprint("Script not allowed to run with arguments");
		ns.exit();
	}

	let initScript = common.getInitScript(ns);
	let hackScript = common.getHackScript(ns);
	let localAttackScript = common.getLocalAttackScript(ns);
	let remoteAttackScript = common.getRemoteAttackScript(ns);

	while (true) {
		let process = common.findProcessByName(ns, hackScript);

		if (process === null) {
			ns.tprint("--------------------------------------------------------")
			ns.tprint(" >>> Hack script process not running -- initializing");
			ns.tprint("--------------------------------------------------------")
			ns.run(initScript);
		} else {
			let currentTarget = process.args[0];
			let nextTarget = targets.getLastHackableHost(ns).host;
			if (currentTarget !== nextTarget) {
				ns.tprint("--------------------------------------------------------")
				ns.tprint(" >>> New target acquired: " + nextTarget);
				ns.tprint("--------------------------------------------------------")
				ns.run(localAttackScript, 1, nextTarget);
				ns.run(remoteAttackScript, 1, nextTarget);
			}
		}

		await ns.sleep(5000);
	}
}