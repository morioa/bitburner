/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import {listHostsOwned} from "./util.common.js";

const fromOpts = {0:"home", 1:"owned", 2:"purchased", 3:"other", 4:"all"};
const fromDefault = 4;

const modelOpts = {0:"last", 1:"targeted", 2:"distributed", 3:"distributed/weighted"};
const modelDefault = 2;

const targetMoneyThreshDefault = 0;

export async function main(ns) {
	ns.disableLog("ALL");

	let attackParams = getAttackParams(ns);
	ns.tprint(attackParams);
	await attackDistributedAll(ns, attackParams['target']);

	await ns.sleep(1);
}

function getAttackParams(ns) {
	let from, model, target;

	if (ns.args[0] != undefined && ns.args[0] === 'help') {
		showHelp(ns);
		ns.exit();
	}

	from = ns.args[0];
	if (from == undefined) {
		from = fromDefault;
		ns.tprint("Using default 'from': " + fromDefault + " (" + fromOpts[fromDefault] + ")");
	} else if (!(from in fromOpts)) {
		from = fromDefault;
		ns.tprint("Specified 'from' does not exist... using default: " + fromDefault + " (" + fromOpts[fromDefault] + ")");
	} else {
		ns.tprint("Using specified 'from': " + from + " (" + fromOpts[from] + ")");
	}

	model = ns.args[1];
	if (model == undefined) {
		model = modelDefault;
		ns.tprint("Using default 'model': " + model + " (" + modelOpts[model] + ")");
	} else if (!(model in modelOpts)) {
		model = modelDefault;
		ns.tprint("Specified 'model' does not exist... using default: " + model + " (" + modelOpts[model] + ")");
	} else {
		ns.tprint("Using specified 'model': " + model + " (" + modelOpts[model] + ")");
	}

	target = ns.args[2];
	if (model > 1) {
		if (target == undefined) {
			target = targetMoneyThreshDefault;
			ns.tprint("Using default 'target' money threshold: " + target);
		} else if (isNaN(target)) {
			target = targetMoneyThreshDefault;
			ns.tprint("Individual targets ignored for the specified 'model'");
			ns.tprint("Using default 'target' money threshold: " + target);
		} else {
			target = Math.floor(target);
			ns.tprint("Using specified 'target' money threshold: " + target);
		}
	} else {
		if (model === 0) {
			target = targetUtil.getLastHackableHost(ns).host;
			ns.tprint("Target acquired: " + target);
		} else {
			if (target == undefined || ns.serverExists(target) === false) {
				ns.tprint("Specified target server does not exist: " + target);
				target = targetUtil.getLastHackableHost(ns).host;
				ns.tprint("Targeting last hackable server instead: " + target);
			} else {
				ns.tprint("Target acquired: " + target);
			}
		}
	}

	return {"from":from, "model":model, "target":target};
}

function getUsableHosts(ns, otherOnly = false) {
	let hostsOwned = commonUtil.listHostsOwned(ns);
	let hostsOther = targetUtil.list(ns, 0, 1).map(x => x.host);

	if (otherOnly) {
		return hostsOther;
	}

	return hostsOwned.concat(hostsOther);
}

async function attackDistributedAll(ns, moneyThresh) {
	let hosts = getUsableHosts(ns);
	let hostsOther = getUsableHosts(ns, true);
	let allTargets = targetUtil.list(ns, moneyThresh, 1);
	let hackScript = commonUtil.getHackScript(ns);
	let hostsCount = hosts.length;
	let hostsUsedCount = 0;
	let targetsCount = allTargets.length;

	tableUtil.renderTable(ns, "TARGETS", allTargets, true);

	for (let host of hosts) {
		if (hostsOther.indexOf(host) >= 0) {
			// Ensure that the usable host is actually usable by breaching it...
			if (breachUtil.breachHost(ns, host) === false) {
				// We should never get here, but just in case...
				ns.tprint("Usable server '" + host + "' is not breachable -- SKIPPING");
				continue;
			}
		}

		commonUtil.findProcessByName(ns, hackScript, host, true);

		let hostRamReserved = (host === "home") ? 64 : 0;
		let hostRamMax = ns.getServerMaxRam(host);
		let hostRamUsed = ns.getServerUsedRam(host);
		let hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;

		if (hostRamAvail <= 0) {
			ns.print("Host '" + host + "' does not have any RAM -- SKIPPING");
			continue;
		}

		let threadsCountPerTarget = Math.floor((hostRamAvail / commonUtil.getHackScriptRamCost(ns)) / allTargets.length);

		if (threadsCountPerTarget === 0) {
			ns.print("Host '" + host + "' does not have enough RAM to target all servers -- SKIPPING");
			continue;
		}

		if (host !== "home") {
			await ns.scp(hackScript, host);
		}

		for (let target of allTargets) {
			if (target["moneyMax"] === 0) {
				ns.print("Target '" + target["host"] + "' has 0 max money -- SKIPPING");
			}

			target = target["host"];
			if (host === "home") {
				if (breachUtil.breachHost(ns, target) === false) {
					// We should never get here, but just in case...
					ns.tprint("Target server '" + target + "' is not breachable -- SKIPPING");
					continue;
				}
			}

			if (ns.fileExists(hackScript, host)) {
				ns.exec(hackScript, host, threadsCountPerTarget, target);
				//ns.print("Host '" + host + "' is attacking target '" + target + "' with " + threadsCountPerTarget + " threads");
				commonUtil.findProcessByName(ns, hackScript, host);
			}
		}

		hostsUsedCount++;
	}

	ns.tprint("Targets attacked: " + targetsCount);
	ns.tprint("Hosts utilized: " + hostsUsedCount);
}

function showHelp(ns) {
	let output = "\n\n" +
		"Usage:   run " + commonUtil.getAttackScript(ns) + " [from] [model] [target]\n\n" +
		"from     [optional] Can be the string 'help' (to show this help) or any\n" +
		"         integer '0-4' [0:\"home\", 1:\"owned\", 2:\"purchased\", 3:\"other\",\n" +
		"         4:\"all\"] (from which servers to mount the attack). Defaults\n" +
		"         to '" + fromDefault + "' if not passed.\n\n" +
		"model    [optional] Can be any integer '0-3' [0:\"last\", 1:\"targeted\",\n" +
		"         2:\"distributed\", 3:\"distributed/weighted\"] to establish\n" +
		"         which method to use for the attack. Defaults to '" + modelDefault + "' if not\n" +
		"         passed.\n\n" +
		"target   [optional] If model '0' or '1' is specified, then this must be\n" +
		"         be a valid target hostname, otherwise the attack will default\n" +
		"         to the 'last' target. If model '2' or '3' is specified, then\n" +
		"         the specified target (integer) will be used as a Max Money\n" +
		"         filter, only attacking (all hackable) targets that have a Server\n" +
		"         Max Money value equal to or greater than the specified target,\n" +
		"         otherwise it will default to '" + targetMoneyThreshDefault + "' and assume all hackable\n" +
		"         targets are to be attacked.\n\n" +
		"Examples:\n\n" +
		"    To show this help:\n" +
		"         run " + commonUtil.getAttackScript(ns) + " help\n\n" +
		"    To attack with default options:\n" +
		"         run " + commonUtil.getAttackScript(ns) + "\n\n" +
		"    To attack the default target from rooted servers you do not own:\n" +
		"         run " + commonUtil.getAttackScript(ns) + " 3\n\n" +
		"    To attack a specified target from your home server:\n" +
		"         run " + commonUtil.getAttackScript(ns) + " 0 1 n00dles\n\n" +
		"    To attack all hackable targets that have at least 10b max money\n" +
		"    equally using all servers you own:\n" +
		"         run " + commonUtil.getAttackScript(ns) + " 1 2 10000000000\n\n";

	ns.tprint(output);
}
