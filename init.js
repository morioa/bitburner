/** @param {NS} ns */
import * as common from "./util.common.js";
import * as targets from "./util.targets.js";

export async function main(ns) {
	let target = targets.getLastHackableHost(ns).host;

	// run from "home" first to establish breach
	await ns.run(common.getLocalAttackScript(ns), 1, target);

	// run purchase script to purchase servers
	ns.run(common.getServerPurchaseScript(ns));

	// run remote attacks on all servers already purchased
	ns.run(common.getRemoteAttackScript(ns));
}