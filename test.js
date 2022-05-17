/** @param {NS} ns **/
import * as common from "./util.common.js";
import * as breach from "./util.breach.js";
import * as targets from "./util.targets.js";

export async function main(ns) {
	//ns.tprint("First hackable host: " + targets.getFirstHackableHost(ns).host);
	//ns.tprint("Last hackable host: " + targets.getLastHackableHost(ns).host);
	//ns.tprint("Owned breach apps: " + breach.countOwned(ns));
	//ns.tprint("My hacking level: " + ns.getHackingLevel());
	//ns.tprint("computek hacking level req: " + ns.getServerRequiredHackingLevel("computek"));
	/*
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(common.listHostsOwned(ns));
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(common.listHostsOther(ns));
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(common.getNextHostPurchasedName(ns));
	*/

	/*
	let maxRam = ns.getPurchasedServerMaxRam();
	ns.tprint("Max RAM for server: " + maxRam);

	for (let i = 1; Math.pow(2, i) <= maxRam; i++) {
		let ram = Math.pow(2, i);
		ns.tprint(ram + "GB = " + common.formatMoney(ns, ns.getPurchasedServerCost(ram)));
	}
	*/

	await ns.sleep(30000);
}