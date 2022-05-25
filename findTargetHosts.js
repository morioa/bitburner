/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";

export async function main(ns) {
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