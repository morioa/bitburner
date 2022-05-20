/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

const apiScript = "Singularity.exe";
const moneyTor = 200000000;
const moneyScripts = 7000000000;
const scripts = [
	"BruteSSH.exe",
	"FTPCrack.exe",
	"relaySMTP.exe",
	"HTTPWorm.exe",
	"SQLInject.exe",
	"ServerProfiler.exe",
	"DeepscanV1.exe",
	"DeepscanV2.exe",
	"AutoLink.exe",
	"Formulas.exe"];

export async function main(ns) {
	let apiReqMet = ns.fileExists(apiScript);
	let moneyReqMet = ns.getServerMoneyAvailable("home") > moneyTor + moneyScripts;

	if (!apiReqMet) {
		showReminder(ns, "api");
	} else if (!moneyReqMet) {
		showReminder(ns, "money");
	}

	buy(ns);
}

function buy(ns) {
	ns.purchaseTor();
	for (let script of scripts) {
		ns.purchaseProgram(script);
	}
}

function showReminder(ns, reason) {
	let moneyReq = commonUtil.formatMoney(ns, moneyTor + moneyScripts);
	let output = "\n\n";

	switch (reason) {
		case "api":
			output += "NOTICE: Unable to auto-purchase scripts due to missing API requirement (" + apiScript + ")\n\n";
			break;

		case "money":
			output += "NOTICE: Unable to auto-purchase scripts due to missing money requirement (" + moneyReq + ")\n\n";
			break;

		default:
			output += "";
	}

	output += "This script is a work-in-progress.\n\n";

	ns.tprint(output);
	ns.exit();
}
