/** @param {NS} ns */
import * as common from "./util.common.js";
import * as targets from "./util.targets.js";

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
	+ common.formatMoney(ns, moneyThresh) + " max money");

	ns.tprint(targets.list(ns, moneyThresh, hackableOnly));
}