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

		case "rep":
			await rep(ns);
			break;

		default:
			ns.tprint("Script requires 'new', 'list', or 'rep' as the first argument");
	}
}

async function newTarget(ns) {
	let prevTarget = null;
	while (true) {
		let nextTarget = targetUtil.getLastHackableHost(ns)["host"];
		if (nextTarget !== prevTarget) {
			commonUtil.showNotice(ns, "New target exists: " + nextTarget);
			prevTarget = nextTarget;

			// comment out the line below if it yields an error
			// it loads singularity.connect which costs 32GB
			beep(ns);
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
		await ns.sleep(5000);
	}
}

async function rep(ns) {
	let validEntityTypes = ["company","faction"];
	let entityType = ns.args[1];
	let entity = ns.args[2];
	let targetRep = ns.args[3];

	if (entityType == undefined || !validEntityTypes.includes(entityType)) {
		ns.tprint("Invalid entity type: " + entityType);
		ns.exit();
	}

	let entityRep;
	switch (entityType) {
		case "company":
			entityRep = ns.singularity.getCompanyRep(entity);
			break;

		case "faction":
			entityRep = ns.singularity.getFactionRep(entity);
			break;

		default:
			ns.tprint("Invalid entity type: " + entityType);
			ns.exit();
	}

	if (entityRep < 0) {
		ns.tprint("Invalid entity: " + entity);
		ns.exit();
	}

	if (targetRep == undefined || isNaN(targetRep) || !isFinite(targetRep)) {
		targetRep = 0;
	}

	if (entityRep >= targetRep) {
		commonUtil.showNotice(ns, entityType.charAt(0).toUpperCase() + entityType.slice(1) + " '" + entity + "' target rep reached: " + targetRep);

		// comment out the line below if it yields an error
		// it loads singularity.connect which costs 32GB
		beep(ns);

		ns.exit();
	}

	await ns.sleep(5000);
}

function beep(ns) {
	if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") >= 32) {
		var context = new AudioContext();
		var oscillator = context.createOscillator();
		oscillator.type = "sine";
		oscillator.frequency.value = 800;
		oscillator.connect(context.destination);
		oscillator.start();
// Beep for 500 milliseconds
		setTimeout(function () {
			oscillator.stop();
		}, 100);
	}
}
