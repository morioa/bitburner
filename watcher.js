/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as breachUtil from "./util.breach.js";
import * as isUtil from "./util.is.js";

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
    let autoAttack = isUtil.numberEqual(ns, ns.args[1], 1);
    let moneyThresh = (isUtil.numberGreaterOrEqual(ns, ns.args[2], 1000000))
        ? ns.args[2]
        : 1000000;

    let prevTargets = [];
    while (true) {
        let newTargets = targetUtil.list(ns, moneyThresh, 1).map(t => t["host"]);
        if (!isUtil.arrayEqual(ns, prevTargets, newTargets)) {
            commonUtil.showNotice(ns, "New target(s) exist");
            prevTargets = newTargets;

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            beep(ns);
            await ns.sleep(1000);

            await breachUtil.breachAll(ns, targetUtil.getUnbreachedHosts(ns));

            if (autoAttack) {
                await ns.run(commonUtil.getAttackScript(ns), 1, 4, 2, moneyThresh);
            }

            if (Object.entries(targetUtil.getUnbreachedHosts(ns)).length === 0) {
                ns.tprint("All available hosts and targets breached and attacked -- TERMINATING SELF");
                ns.exit();
            }
        }
        await ns.sleep(5000);
    }
}

async function listTargets(ns) {
    let moneyThresh = (isUtil.numberGreaterOrEqual(ns, ns.args[1], 0))
        ? ns.args[1]
        : 0;
    while (true) {
        ns.run("findTargetHosts.js", 1, moneyThresh, 1);
        await ns.sleep(5000);
    }
}

async function rep(ns) {
    let entityType = ns.args[1];
    let entity = ns.args[2];
    let targetRep = (isUtil.numberValid(ns, ns.args[3]))
        ? ns.args[3]
        : 0;
    let getRep = {
        company: ns.singularity.getCompanyRep,
        faction: ns.singularity.getFactionRep
    };

    if (!isUtil.entityTypeValid(ns, entityType)) {
        ns.tprint("Invalid entity type: " + entityType);
        ns.exit();
    }

    let entityRep = getRep[entityType](entity);
    if (entityRep < 0) {
        ns.tprint("Invalid entity: " + entity);
        ns.exit();
    }

    if (entityRep >= targetRep) {
        commonUtil.showNotice(ns, commonUtil.upperFirstLetter(ns, entityType) + " '" + entity + "' target rep reached: " + targetRep);

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
