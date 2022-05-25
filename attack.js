/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";

const fromOpts = {0:"home", 1:"owned", 2:"purchased", 3:"other", 4:"all"};
const fromDefault = 4;

const modelOpts = {0:"last", 1:"targeted", 2:"distributed", 3:"distributed/weighted"};
const modelDefault = 2;

const targetMoneyThreshDefault = 0;

const algos = {
	consolidated: [
		{file: "_chesterTheMolester.js", weight: 1.0}
	],
	loop: [
		{file: "_grow.js", weight: 0.77},
		{file: "_hack.js", weight: 0.08},
		{file: "_weaken.js", weight: 0.15}
	]
};
const algoType = "loop";
const algo = algos[algoType];

export async function main(ns) {
	ns.disableLog("ALL");
	ns.enableLog("exec");

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
	const hosts = getUsableHosts(ns);
	const hostsOther = getUsableHosts(ns, true);
	const allTargets = targetUtil.list(ns, moneyThresh, 1);
	let hostsUsedCount = 0;
	let targetsAttacked = [];

	tableUtil.renderTable(ns, "TARGETS", allTargets, true);

	// Loop through usable hosts
	for (const host of hosts) {
		// Ensure that usable hosts that are not owned are actually usable
		if (hostsOther.indexOf(host) >= 0) {
			if (breachUtil.breachHost(ns, host) === false) {
				// We should never get here, but just in case move onto the next host
				//ns.print("Usable server '" + host + "' is not breachable -- SKIPPING");
				continue;
			}
		}

		// Kill all existing processes that match any of the attack scripts
		for (const [k,script] of Object.entries(algos)) {
			for (const file of script.map(x => x.file)) {
				commonUtil.findProcessByName(ns, file, host, true);
			}
		}

		// Determine how much RAM is available for use on this host
		const hostRamReserved = (host === "home")
			? commonUtil.getHomeRamReserved(ns)
			: 0;
		const hostRamMax = ns.getServerMaxRam(host);
		let hostRamUsed = ns.getServerUsedRam(host);
		let hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;
		const hostRamMinReq = algo.reduce((acc, curr) => acc + ns.getScriptRam(curr.file), 0)

		// Skip this host if the available RAM does not meet the minimum requirement
		if (hostRamAvail < hostRamMinReq) {
			//ns.print("Host '" + host + "' does not have enough RAM -- SKIPPING");
			continue;
		}

		// Determine how many max threads this host can handle per target
		const singleScriptRamCost = algo.reduce((acc, curr) => (acc > ns.getScriptRam(curr.file)) ? acc : ns.getScriptRam(curr.file), 0);
		const threadsTotal = hostRamAvail / singleScriptRamCost;
		let threadsPerTarget = Math.floor((threadsTotal) / allTargets.length);
		let thisHostTargets = allTargets;
		let threadsPerTargetMinReq = algo.length;

		// Assign all threads to the last / hardest target if not enough RAM to attack all targets
		if (threadsPerTarget < threadsPerTargetMinReq) {
			//ns.print("Host '" + host + "' does not have enough RAM to target all servers");
			//ns.print("Assigning host resources to last target");
			thisHostTargets = [allTargets[allTargets.length - 1]];
			threadsPerTarget = Math.floor(threadsTotal);
		}

		// Copy attack scripts to the remote host
		if (host !== "home") {
			for (const file of algo.map(x => x.file)) {
				await ns.scp(file, host);
			}
		}

		for (const [i, target] of Object.entries(thisHostTargets)) {
			// Ignore target if there is no money to be gained
			if (target.moneyMax === 0) {
				//ns.print("Target '" + target.host + "' has 0 max money -- SKIPPING");
				continue;
			}

			// Breach the target
			if (breachUtil.breachHost(ns, target.host) === false) {
				// We should never get here because it's already been determined it's breachable, but just in case...
				//ns.print("Target server '" + target.host + "' is not breachable -- SKIPPING");
				continue;
			}

			let targetThreadsHolder = threadsPerTarget;
			let targetThreads = threadsPerTarget;
			let targetThreadsPctUsed = 0;

			// If this is the last target and there are extra threads remaining, add them to the attack pool
			ns.print(`${i} : ${Object.entries(thisHostTargets).length - 1}`);
			if (isUtil.numberEqual(ns, i, Object.entries(thisHostTargets).length - 1)) {
				// Determine if there is any threads left over to apply to the last target
				hostRamUsed = ns.getServerUsedRam(host);
				hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;
				targetThreadsHolder = Math.floor(hostRamAvail / singleScriptRamCost);
			}

			// Sort files in order by weight, smallest to largest
			algo.sort((a,b) => a.weight - b.weight);

			// Loop through each file in the chosen attack algorithm
			for (const [j, script] of Object.entries(algo)) {

				if (ns.fileExists(script.file, host)) {
					// The attack file exists on the host, so let's do this...
					let fileThreads = targetThreads;

					if (isUtil.numberLess(ns, j, Object.entries(algo).length - 1)) {
						// Make sure that less weighted attack scripts still have at least one thread
						fileThreads = Math.floor(targetThreadsHolder * script.weight);
						if (fileThreads === 0) {
							fileThreads = 1;
						}
					} else {
						// Make sure that the threads for the most weighted script do not exceed 100% utilization
						//ns.print(`Threads per target: ${targetThreadsHolder}`);
						//ns.print(`Percent used: ${targetThreadsPctUsed}`);
						//ns.print(`Target threads remaining: ${targetThreads}`);
						//ns.print(`File threads (pre calc): ${fileThreads}`);
						fileThreads = targetThreadsHolder - Math.ceil(targetThreadsHolder * targetThreadsPctUsed);
						//ns.print(`File threads (post calc): ${fileThreads}`);
					}

					// ATTACK!
					ns.exec(script.file, host, fileThreads, target.host);
					if (!targetsAttacked.includes(target.host)) {
						targetsAttacked.push(target.host);
					}
					//ns.print("Host '" + host + "' is attacking target '" + target.host + "' with " + fileThreads + " threads");
					commonUtil.findProcessByName(ns, script.file, host);
					targetThreads -= fileThreads;
					targetThreadsPctUsed += fileThreads / targetThreadsHolder;
				}
			}
		}

		hostsUsedCount++;
	}

	ns.tprint("Targets attacked: " + targetsAttacked.length);
	ns.tprint(targetsAttacked);
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
