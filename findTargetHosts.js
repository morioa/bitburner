/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
	let moneyThresh = ns.args[0];
	if (moneyThresh == undefined) {
		moneyThresh = 0;
	}

	let hackableOnly = ns.args[1];
	hackableOnly = (hackableOnly == undefined 
	|| (hackableOnly.toString().toLowerCase() !== "true" 
	&& Number(hackableOnly) !== 1)) 
		? 0
		: 1;

	ns.tprint("Listing " 
	+ ((hackableOnly) ? "hackable" : "all") + " hosts with at least " 
	+ commonUtil.formatMoney(ns, moneyThresh) + " max money");

	//ns.tprint(targets.list(ns, moneyThresh, hackableOnly));

	tableUtil.renderTable(ns, "TARGETS", targetUtil.list(ns, moneyThresh, hackableOnly), true);
}