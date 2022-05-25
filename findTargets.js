/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";
import * as breachUtil from "./util.breach";

export async function main(ns) {
	if (isUtil.valueEqual(ns, ns.args[0], "breach")) {
		await breach(ns);
	} else {
		await list(ns);
	}
}

async function list(ns) {
	let moneyThresh = (isUtil.numberValid(ns, ns.args[0]))
		? ns.args[0]
		: 0;
	let hackableOnly = (isUtil.numberEqual(ns, ns.args[1], 1));

	ns.tprint("Listing "
		+ ((hackableOnly) ? "hackable" : "all") + " hosts with at least "
		+ commonUtil.formatMoney(ns, moneyThresh) + " max money");

	//ns.tprint(targets.list(ns, moneyThresh, hackableOnly));

	tableUtil.renderTable(ns, "TARGETS", targetUtil.list(ns, moneyThresh, hackableOnly), true);
}

async function breach(ns) {
	await breachUtil.breachAll(ns, targetUtil.getUnbreachedHosts(ns));
}