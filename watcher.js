import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as breachUtil from "./util.breach.js";
import * as isUtil from "./util.is.js";

const pollDelay = 5000;
let lex = Date.now(),
    cex = null,
    exd = null;

/**
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
    switch (ns.args[0] ?? "") {
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

        case "hashes":
            await hashes(ns);
            break;

        default:
            ns.tprintf("ERROR: Script requires 'new', 'list', 'rep', 'stat', 'money' or 'hashes' as the first argument");
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function newTarget(ns) {
    let autoAttack = isUtil.numberEqual(ns, ns.args[1], 1),
        moneyThresh = (isUtil.numberGreaterOrEqual(ns, ns.args[2], 1000000))
            ? ns.args[2]
            : 1000000,
        prevTargets = [];

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
                let ap = commonUtil.getLastAttackParams(ns),
                    apFrom = (ap.from === null) ? 4 : ap.from,
                    apModel = (ap.model === null) ? 2 : ap.model,
                    apTarget = (ap.target === null) ? moneyThresh : ap.target;
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

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function listTargets(ns) {
    let moneyThresh = (isUtil.numberGreaterOrEqual(ns, ns.args[1], 0))
        ? ns.args[1]
        : 0;
    while (true) {
        await ns.run("findTargets.js", 1, moneyThresh, 1);
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function rep(ns) {
    const entityType = ns.args[1],
        entity = ns.args[2],
        targetRep = (isUtil.numberValid(ns, ns.args[3]))
            ? ns.args[3]
            : 0,
        getRep = {
            company: ns.singularity.getCompanyRep,
            faction: ns.singularity.getFactionRep
        };

    if (!isUtil.entityTypeValid(ns, entityType)) {
        ns.tprintf(`ERROR: Invalid entity type: ${entityType}`);
        ns.exit();
    }

    let reportedInit = false;

    while (true) {
        let entityRep = getRep[entityType](entity);
        if (entityRep < 0) {
            ns.tprintf(`ERROR: Invalid entity: ${entity}`);
            ns.exit();
        }

        if (!reportedInit) {
            let erFormatted = commonUtil.formatNumber(ns, entityRep),
                trFormatted = commonUtil.formatNumber(ns, targetRep),
                drFormatted = commonUtil.formatNumber(ns, (targetRep - entityRep));
            ns.tprintf(`INFO: entityRep: ${erFormatted}, targetRep: ${trFormatted}, remainingRep: ${drFormatted}`);
            reportedInit = true;
        }

        ns.print(`entityRep: ${entityRep}, targetRep: ${targetRep}`);
        if (entityRep >= targetRep) {
            await commonUtil.showNotice(ns, `${commonUtil.upperFirstLetter(ns, entityType)} '${entity}' target rep reached: ${commonUtil.formatNumber(ns, targetRep)}`);

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            await commonUtil.play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetRep not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function money(ns) {
    const targetMoney = ns.args[1],
        note = (ns.args[2] !== undefined)
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
            await commonUtil.showNotice(ns, `Target money reached: ${commonUtil.formatMoney(ns, targetMoney)}${note}`);
            await commonUtil.play(ns, "whistle");
            ns.exit();
        }

        ns.print("targetMoney not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
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
            await commonUtil.showNotice(ns, `${commonUtil.upperFirstLetter(ns, whichStat)} target skill reached: ${targetSkill}`);

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            await commonUtil.play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetSkill not reached... sleeping");
        await ns.sleep(pollDelay);
    }
}

async function hashes(ns) {
    let act = (ns.args[1] ?? "").toLowerCase(),
        allowedActs = ["sell","favor","study","gym"];

    if (!allowedActs.includes(act)) handleError(ns, `'${act}' is not a valid action`);

    while (true) {
        let pct = 0.0001,
            cap = ns.hacknet.hashCapacity() || 0,
            has = ns.hacknet.numHashes();

        if (has >= Math.floor(cap * pct)) {
            try {
                if (act === "sell") {
                    let action = "Sell for Money",
                        cost = ns.hacknet.hashCost(action),
                        n = Math.floor(has / cost),
                        money = commonUtil.formatNumber(ns, n * 1000000, "shorthand", true);

                    if (n < 1) {
                        ns.printf('Insufficient hashes to sell for money -- WAITING');
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    if (!ns.hacknet.spendHashes(action, "", n)) handleError(ns, "Failed to sell hashes");
                    ns.tprintf(`INFO: Reached hash spend threshold after ${commonUtil.formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for ${money}`);
                }
                else if (act === "favor") {
                    let company = ns.args[2],
                        action = "Company Favor",
                        n = 0,
                        cost = ns.hacknet.hashCost(action);

                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy favor -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action, company)) handleError(ns, "Failed to sell hashes");
                    }

                    let favor = n * 5;
                    ns.tprintf(`INFO: Reached hash spend threshold after ${commonUtil.formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${favor} favor for ${company}`);
                }
                else if (act === "study") {
                    let action = "Improve Studying",
                        n = 0,
                        cost = ns.hacknet.hashCost(action);

                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved studying -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action)) handleError(ns, "Failed to sell hashes");
                    }

                    let study = n * 20;
                    ns.tprintf(`INFO: Reached hash spend threshold after ${commonUtil.formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${study}%% improved studying`);
                }
                else if (act === "gym") {
                    let action = "Improve Gym Training",
                        n = 0;

                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved gym training -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action)) handleError(ns, "Failed to sell hashes");
                    }

                    let gym = n * 20;
                    ns.tprintf(`INFO: Reached hash spend threshold after ${commonUtil.formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${gym}%% improved gym training`);
                }
                //await commonUtil.play(ns, "drip");
            }
            catch (e) {
                ns.tprintf(`ERROR: ${e.message}`);
                ns.exit();
            }
        }

        await ns.sleep(pollDelay);
    }
}

function handleError(ns, msg) {
    ns.tprintf(`ERROR: ${msg}`);
    commonUtil.play(ns, "whistle");
    ns.exit();
}

function getTimeDiff() {
    cex = Date.now();
    exd = cex - lex; // in ms
    lex = cex;

    return exd;
}
