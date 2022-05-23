/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";

export async function main(ns) {
	let watchWhat = (ns.args[0] == undefined)
		? "undefined"
		: ns.args[0];
	switch (watchWhat) {
		case "new":
			await newTarget(ns);
			break;

		case "list":
			await listTargets(ns);
			break;

		default:
			ns.tprint("Script requires either 'new' or 'list' as the first argument");
	}
}

async function newTarget(ns) {
	let prevTarget = null;
	while (true) {
		let nextTarget = targetUtil.getLastHackableHost(ns)["host"];
		if (nextTarget !== prevTarget) {
			commonUtil.showNotice(ns, "New target exists: " + nextTarget);
			prevTarget = nextTarget;
		}
		await ns.sleep(5000);
	}
}

async function listTargets(ns) {
	let minMaxMoney = (ns.args[1] == undefined || isNaN(ns.args[1]))
		? 10000000000
		: ns.args[1];
	while (true) {
		ns.run("findTargetHosts.js", 1, minMaxMoney, 1);
		await ns.sleep(3000);
	}
}