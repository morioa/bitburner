import {breachHost} from "./util.breach.js";
import {
    findProcessByName,
    getAttackLogFile, getAttackScript,
    getHomeRamReserved, getLastAttackParams,
    listHostsOwned, working
} from "./util.common.js";
import {numberEqual, numberLess} from "./util.is.js";
import {renderTable} from "./util.table.js";
import {getLastHackableHost, list} from "./util.target.js";

// If you find that the attack kills your game, you should adjust the attack
// threshold to a lower value and/or bump up the delay slightly. This slows
// down the attack, so it will take longer for all attacks to start on all
// usable hosts.
const attackThreshold = 30,     // Number of targets before a delay is imposed
    attackThresholdDelay = 100, // Delay between each host loop
    fromOpts = {0:"home", 1:"owned", 2:"purchased", 3:"other", 4:"all"},
    fromDefault = 4,
    modelOpts = {0:"last", 1:"targeted", 2:"distributed", 3:"distributed/weighted"},
    modelDefault = 2,
    targetMoneyThreshDefault = 0,
    useHacknetsDefault = 0,
    algos = {
        consolidated: [
            {file: "_chesterTheMolester.js", weight: 1.0}
        ],
        loop: [
            {file: "_grow.js", weight: 0.67},
            {file: "_hack.js", weight: 0.08},
            {file: "_weaken.js", weight: 0.25}
        ]
    };

let algoType = "loop",
    algo = algos[algoType];

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog("ALL");
    //ns.enableLog("exec");

    let ap = await getAttackParams(ns);
    await ns.write(getAttackLogFile(ns), JSON.stringify(ap), "w");
    await ns.sleep(100);
    await attackDistributedAll(ns, ap['target'], ap['useHacknets']);
    await ns.sleep(1);
}

export async function getAttackParams(ns) {
    let ap = (ns.args[0] != undefined)
        ? ns.args
        : getLastAttackParams(ns, true);

    if (ap[0] === 'help') {
        showHelp(ns);
        ns.exit();
    }

    let [
        from = fromDefault,
        model = modelDefault,
        target = targetMoneyThreshDefault,
        useHacknets = 0
    ] = ap;

    if (!(from in fromOpts)) {
        from = fromDefault;
        await ns.tprintf(`WARNING: Specified 'from' does not exist... using default: ${fromDefault} (${fromOpts[fromDefault]})`);
    }

    if (!(model in modelOpts)) {
        model = modelDefault;
        await ns.tprintf(`WARNING: Specified 'model' does not exist... using default: ${model} (${modelOpts[model]})`);
    }

    if (model > 1) {
        if (isNaN(target)) {
            target = targetMoneyThreshDefault;
            await ns.tprintf("WARNING: Individual targets ignored for the specified 'model'");
            await ns.tprintf(`WARNING: Using default 'target' money threshold instead: ${target}`);
        } else {
            target = Math.floor(target);
        }
    } else {
        if (model === 0) {
            target = getLastHackableHost(ns).host;
        } else {
            if (await ns.serverExists(target) === false) {
                await ns.tprintf(`WARNING: Specified target server does not exist: ${target}`);
                target = getLastHackableHost(ns).host;
                await ns.tprintf(`WARNING: Targeting last hackable server instead: ${target}`);
            }
        }
    }

    useHacknets = (useHacknets) ? 1 : useHacknetsDefault;

    await ns.tprintf(`INFO: from: ${from} (${fromOpts[from]})`);
    await ns.tprintf(`INFO: model: ${model} (${modelOpts[model]})`);
    await ns.tprintf(`INFO: target: ${target}`);
    await ns.tprintf(`INFO: useHacknets: ${useHacknets} (${(useHacknets) ? 'true' : 'false'})`);

    return {"from":from, "model":model, "target":target, "useHacknets":useHacknets};
}

export async function getUsableHosts(ns, otherOnly = false, useHacknets = false) {
    let hostsOwned = listHostsOwned(ns, true, useHacknets),
        hostsOther = list(ns, 0, 1).map(x => x.host);

    if (otherOnly) {
        return hostsOther;
    }

    return hostsOwned.concat(hostsOther);
}

export async function attackDistributedAll(ns, moneyThresh, useHacknets) {
    const hosts = await getUsableHosts(ns, false, useHacknets),
        hostsOther = await getUsableHosts(ns, true),
        allTargets = list(ns, moneyThresh, 1);
    let hostsUsedCount = 0,
        targetsAttacked = [];

    renderTable(ns, "TARGETS", allTargets, true);
    await ns.sleep(1000);

    let workingElemId = working(ns);
    await ns.sleep(100);

    // Loop through usable hosts
    for (const host of hosts) {
        // Ensure that usable hosts that are not owned are actually usable
        if (hostsOther.indexOf(host) >= 0) {
            if (await breachHost(ns, host) === false) {
                // We should never get here, but just in case move onto the next host
                //ns.print("Usable server '" + host + "' is not breachable -- SKIPPING");
                continue;
            }
        }

        // Kill all existing processes that match any of the attack scripts
        for (const [k,script] of Object.entries(algos)) {
            for (const file of script.map(x => x.file)) {
                findProcessByName(ns, file, host, true);
            }
        }

        // Determine how much RAM is available for use on this host and which algorithm to use
        algo = determineAlgo(ns, host);
        const hostRamReserved = (host === "home")
                ? getHomeRamReserved(ns)
                : 0,
            hostRamMax = await ns.getServerMaxRam(host);
        let hostRamUsed = await ns.getServerUsedRam(host),
            hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;
        const hostRamMinReq = algo.reduce((acc, curr) => acc + ns.getScriptRam(curr.file), 0)

        // Skip this host if the available RAM does not meet the minimum requirement
        if (hostRamMax === 0) {
            ns.print(`Host '${host}' has no RAM and cannot be used as an attacker -- SKIPPING`);
            continue;
        } else if (hostRamAvail < hostRamMinReq) {
            await ns.tprint(`Host '${host}' does not have enough RAM -- SKIPPING`);
            await ns.tprint(`
    Host: ${host} 
     Max: ${hostRamMax}
Reserved: ${hostRamReserved}
    Used: ${hostRamUsed}
   Avail: ${hostRamAvail}
Required: ${hostRamMinReq}
`);
            continue;
        }

        // Determine how many max threads this host can handle per target
        const singleScriptRamCost = algo.reduce((acc, curr) => (acc > ns.getScriptRam(curr.file)) ? acc : ns.getScriptRam(curr.file), 0),
            threadsTotal = hostRamAvail / singleScriptRamCost;
        let threadsPerTarget = Math.floor((threadsTotal) / allTargets.length),
            thisHostTargets = allTargets,
            threadsPerTargetMinReq = algo.length;

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
            if (await breachHost(ns, target.host) === false) {
                // We should never get here because it's already been determined it's breachable, but just in case...
                //ns.print("Target server '" + target.host + "' is not breachable -- SKIPPING");
                continue;
            }

            let targetThreadsHolder = threadsPerTarget,
                targetThreads = threadsPerTarget,
                targetThreadsPctUsed = 0;

            // If this is the last target and there are extra threads remaining, add them to the attack pool
            //ns.print(`${i} : ${Object.entries(thisHostTargets).length - 1}`);
            if (numberEqual(ns, i, Object.entries(thisHostTargets).length - 1)) {
                // Determine if there is any threads left over to apply to the last target
                hostRamUsed = ns.getServerUsedRam(host);
                hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed;
                targetThreadsHolder = Math.floor(hostRamAvail / singleScriptRamCost);
            }

            // Sort files in order by weight, smallest to largest
            algo.sort((a,b) => a.weight - b.weight);

            // Loop through each file in the chosen attack algorithm
            for (const [j, script] of Object.entries(algo)) {

                if (await ns.fileExists(script.file, host)) {
                    // The attack file exists on the host, so let's do this...
                    let fileThreads = targetThreads;

                    if (numberLess(ns, j, Object.entries(algo).length - 1)) {
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
                    await ns.exec(script.file, host, fileThreads, target.host);
                    if (!targetsAttacked.includes(target.host)) {
                        targetsAttacked.push(target.host);
                    }
                    //ns.print(`Host '${host}' is attacking target '${target.host}' with ${script.file} using ${fileThreads} threads`);
                    findProcessByName(ns, script.file, host);
                    targetThreads -= fileThreads;
                    targetThreadsPctUsed += fileThreads / targetThreadsHolder;
                }
            }
        }

        hostsUsedCount++;

        if (targetsAttacked.length > attackThreshold) {
            await ns.sleep(attackThresholdDelay);
        }
    }

    working(ns, workingElemId);

    await ns.tprintf(`INFO: Targets attacked: ${targetsAttacked.length}`);
    //await ns.tprint(targetsAttacked);
    await ns.tprintf(`INFO: Hosts utilized: ${hostsUsedCount}`);
}

function determineAlgo(ns, host) {
    return (ns.getServerMaxRam(host) < 64)
        ? algos.consolidated
        : algos.loop;
}

function showHelp(ns) {
    let output = `
This script will perform attacks against hackable targets using default
or user-specified parameters.

Usage:   run ${getAttackScript(ns)} [from] [model] [target] [useHacknets]

from     [optional] Can be the string 'help' (to show this help) or any
         integer '0-4' [0:"home", 1:"owned", 2:"purchased", 3:"other",
         4:"all"] (from which servers to mount the attack). Defaults
         to '${fromDefault}' if not passed.
 
model    [optional] Can be any integer '0-3' [0:"last", 1:"targeted",
         2:"distributed", 3:"distributed/weighted"] to establish
         which method to use for the attack. Defaults to '${modelDefault}' if not
         passed.
 
target   [optional] If model '0' or '1' is specified, then this must be
         be a valid target hostname, otherwise the attack will default
         to the 'last' target. If model '2' or '3' is specified, then
         the specified target (integer) will be used as a Max Money
         filter, only attacking (all hackable) targets that have a 
         Server Max Money value equal to or greater than the specified 
         target, otherwise it will default to '${targetMoneyThreshDefault}' and assume 
         all hackable targets are to be attacked.
         
useHacknets
         [optional] Can be an integer '0-1' [0:"false", 1:"true"] to
         allow the usage of purchased Hacknet servers for attacking
         targets. This would typically be used when you no longer need
         the hashes that they generate. Defaults to '${useHacknetsDefault}' if not passed.
 
Examples:

    To show this help:
         run ${getAttackScript(ns)} help
 
    To attack with default options:
         run ${getAttackScript(ns)}
         
    To attack all hackable targets with at least $1m max money
    from all rooted servers using a distributed attack model:
         run ${getAttackScript(ns)} ${fromDefault} ${modelDefault} 1000000
 
    To attack the default target from rooted servers you do not own:
         run ${getAttackScript(ns)} 3
 
    To attack a specified target from your home server:
         run ${getAttackScript(ns)} 0 1 n00dles
    `;
    ns.tprintf(output);
}
