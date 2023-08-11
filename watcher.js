/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as breachUtil from "./util.breach.js";
import * as isUtil from "./util.is.js";

const pollDelay = 5000;

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

        case "stat":
            await stat(ns);
            break;

        case "money":
            await money(ns);
            break;

        default:
            ns.tprintf("ERROR: Script requires 'new', 'list', 'rep', 'stat' or 'money' as the first argument");
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
            commonUtil.showNotice(ns, "Watcher found new target(s)");
            prevTargets = newTargets;

            commonUtil.play(ns, "beep");
            await ns.sleep(1000);

            await breachUtil.breachAll(ns, targetUtil.getUnbreachedHosts(ns));

            if (autoAttack) {
                // use parameters from last attack log as those would
                // likely be more relevant than the defaults since
                // the watcher could be running for a long time
                let ap = commonUtil.getLastAttackParams(ns);
                let apFrom = (ap.from === null) ? 4 : ap.from;
                let apModel = (ap.model === null) ? 2 : ap.model;
                let apTarget = (ap.target === null) ? moneyThresh : ap.target;
                await ns.run(commonUtil.getAttackScript(ns), 1, apFrom, apModel, apTarget);
            }

            if (Object.entries(targetUtil.getUnbreachedHosts(ns)).length === 0) {
                ns.tprintf("WARNING: All available hosts and targets breached and attacked -- TERMINATING SELF");
                ns.exit();
            }
        }
        await ns.sleep(pollDelay);
    }
}

async function listTargets(ns) {
    let moneyThresh = (isUtil.numberGreaterOrEqual(ns, ns.args[1], 0))
        ? ns.args[1]
        : 0;
    while (true) {
        ns.run("findTargets.js", 1, moneyThresh, 1);
        await ns.sleep(pollDelay);
    }
}

async function rep(ns) {
    const entityType = ns.args[1];
    const entity = ns.args[2];
    const targetRep = (isUtil.numberValid(ns, ns.args[3]))
        ? ns.args[3]
        : 0;
    const getRep = {
        company: ns.getCompanyRep,
        faction: ns.getFactionRep
    };

    if (!isUtil.entityTypeValid(ns, entityType)) {
        ns.tprintf("ERROR: Invalid entity type: " + entityType);
        ns.exit();
    }

    while (true) {
        let entityRep = getRep[entityType](entity) + ns.getPlayer().workRepGained;
        if (entityRep < 0) {
            ns.tprintf(`ERROR: Invalid entity: ${entity}`);
            ns.exit();
        }

        ns.print(`entityRep: ${entityRep}, targetRep: ${targetRep}`);
        if (entityRep >= targetRep) {
            commonUtil.showNotice(ns, commonUtil.upperFirstLetter(ns, entityType) + " '" + entity + "' target rep reached: " + commonUtil.formatNumber(ns, targetRep));

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            commonUtil.play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetRep not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}

async function money(ns) {
    const targetMoney = ns.args[1];
    const note = (ns.args[2] != undefined)
        ? ` (${ns.args[2]})`
        : "";

    if (!isUtil.numberValid(ns, targetMoney)) {
        ns.tprintf(`ERROR: Invalid target money entry: ${targetMoney}`);
        ns.exit();
    }

    while (true) {
        let playerMoney = ns.getServerMoneyAvailable("home");
        ns.print(`playerMoney: ${playerMoney}, targetMoney: ${targetMoney}`);
        if (playerMoney >= targetMoney) {
            commonUtil.showNotice(ns, `Target money reached: ${commonUtil.formatMoney(ns, targetMoney)}${note}`);
            commonUtil.play(ns, "whistle");
            ns.exit();
        }

        ns.print("targetMoney not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}

async function stat(ns) {
    let whichStat = ns.args[1].toLowerCase();
    const targetSkill = (isUtil.numberValid(ns, ns.args[2]))
        ? ns.args[2]
        : 0;

    if (whichStat.includes("hack")) {
        whichStat = "hacking";
    } else if (whichStat.includes("str")) {
        whichStat = "strength";
    } else if (whichStat.includes("def")) {
        whichStat = "defense";
    } else if (whichStat.includes("dex")) {
        whichStat = "dexterity";
    } else if (whichStat.includes("agi")) {
        whichStat = "agility";
    } else if (whichStat.includes("cha")) {
        whichStat = "charisma";
    } else {
        ns.tprintf(`ERROR: Invalid stat: ${whichStat}`);
        ns.exit();
    }

    while (true) {
        let currSkill = ns.getPlayer().skills[whichStat];

        ns.print(`stat: ${whichStat}, targetSkill: ${targetSkill}`);
        if (currSkill >= targetSkill) {
            commonUtil.showNotice(ns, `${commonUtil.upperFirstLetter(ns, whichStat)} target skill reached: ${targetSkill}`);

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            commonUtil.play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetSkill not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}
