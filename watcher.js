/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";

var prevTarget = null;

export async function main(ns) {
	if ((ns.args[0] == undefined) === false) {
		ns.tprint("Script not allowed to run with arguments");
		ns.exit();
	}

	while (true) {
		newTarget(ns);
		await ns.sleep(5000);
	}
}

function newTarget(ns) {
	let nextTarget = targetUtil.getLastHackableHost(ns)["host"];
	if (nextTarget !== prevTarget) {
		let lineChar = "=";
		let topLine = "==[ACHIEVEMENT]===========";
		let midLine = ">>>  New target exists: " + nextTarget + "  <<<";
		let botLine = "==========================";

		let output = "\n\n" + topLine + lineChar.repeat(midLine.length - topLine.length) + "\n" +
			midLine + "\n" +
			botLine + lineChar.repeat(midLine.length - topLine.length) + "\n";
		ns.tprint(output);
		prevTarget = nextTarget;
	}
}