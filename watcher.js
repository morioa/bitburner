import {arrayEqual, entityTypeValid, numberEqual, numberGreaterOrEqual, numberValid} from "./util.is.js";
import {getUnbreachedHosts, list} from "./util.target.js";
import {breachAll} from "./util.breach.js";
import {
    formatMoney,
    formatNumber, formatTime,
    getAttackScript,
    getLastAttackParams,
    play,
    showNotice,
    upperFirstLetter
} from "./util.common.js";

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
    const [
        action,
        autoAttack = 0,
        moneyThresh = 1000000
    ] = ns.args;
    let prevTargets = [],
        newTargets;

    ns.tprintf(`INFO: Watching for new targets with at least ${formatMoney(ns, moneyThresh)} max money (auto-attack ${(autoAttack) ? "enabled" : "disabled"})`);

    while (true) {
        newTargets = list(ns, moneyThresh, 1).map(t => t["host"]);
        if (!arrayEqual(ns, prevTargets, newTargets)) {
            showNotice(ns, "Watcher found new target(s)");
            prevTargets = newTargets;

            play(ns, "connect");
            await ns.sleep(1000);

            await breachAll(ns, getUnbreachedHosts(ns));

            if (autoAttack) {
                // use parameters from last attack log as those would
                // likely be more relevant than the defaults since
                // the watcher could be running for a long time
                let ap = getLastAttackParams(ns),
                    apFrom = (ap.from === null) ? 4 : ap.from,
                    apModel = (ap.model === null) ? 2 : ap.model,
                    apTarget = (ap.target === null) ? moneyThresh : ap.target,
                    apUseHacknets = (ap.useHacknets === null) ? 0 : ap.useHacknets;
                await ns.run(getAttackScript(ns), 1, apFrom, apModel, apTarget, apUseHacknets);
            }

            if (Object.entries(getUnbreachedHosts(ns)).length === 0) {
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
    const [
        action,
        moneyThresh = 0
    ] = ns.args;

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
    const [
        action,
        entityType,
        entity,
        targetRep = 0
    ] = ns.args,
    getRep = {
        company: ns.singularity.getCompanyRep,
        faction: ns.singularity.getFactionRep
    };
    let reportedInit = false,
        entityRep, erInt,
        erFormatted, trFormatted, drFormatted;


    if (!entityTypeValid(ns, entityType)) {
        ns.tprintf(`ERROR: Invalid entity type: ${entityType}`);
        ns.exit();
    }

    while (true) {
        entityRep = getRep[entityType](entity);
        if (entityRep < 0) {
            ns.tprintf(`ERROR: Invalid entity: ${entity}`);
            ns.exit();
        }

        if (!reportedInit) {
            erFormatted = formatNumber(ns, entityRep);
            trFormatted = formatNumber(ns, targetRep);
            drFormatted = formatNumber(ns, (targetRep - entityRep));
            ns.tprintf(`INFO: entityRep: ${erFormatted}, targetRep: ${trFormatted}, remainingRep: ${drFormatted}`);
            reportedInit = true;
        }

        erInt = Math.floor(entityRep);
        ns.print(`entity: ${entity}, entityRep: ${erInt}, targetRep: ${targetRep}`);
        if (entityRep >= targetRep) {
            await showNotice(ns, `${upperFirstLetter(ns, entityType)} '${entity}' target rep reached: ${formatNumber(ns, targetRep)}`);
            await play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetRep not reached -- WAITING");
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function money(ns) {
    const [
        action,
        targetMoney,
        note = ""
    ] = ns.args;
    let noteOut = note,
        reportedInit = false,
        playerMoney,
        pmFormatted, tmFormatted, dmFormatted;

    if (!numberValid(ns, targetMoney)) {
        ns.tprintf(`ERROR: Invalid target money entry: ${targetMoney}`);
        ns.exit();
    }

    if (noteOut !== "") {
        noteOut = ` (${noteOut})`;
    }

    while (true) {
        playerMoney = ns.getServerMoneyAvailable("home");

        if (!reportedInit) {
            pmFormatted = formatNumber(ns, playerMoney);
            tmFormatted = formatNumber(ns, targetMoney);
            dmFormatted = formatNumber(ns, (targetMoney - playerMoney));
            ns.tprintf(`INFO: playerMoney: ${formatMoney(ns, pmFormatted)}, targetMoney: ${formatMoney(ns, tmFormatted)}, remainingMoney: ${formatMoney(ns, dmFormatted)}`);
            reportedInit = true;
        }

        ns.print(`playerMoney: ${formatMoney(ns, playerMoney)}, targetMoney: ${formatMoney(ns, targetMoney)}`);
        if (playerMoney >= targetMoney) {
            await showNotice(ns, `Target money reached: ${formatMoney(ns, targetMoney)}${noteOut}`);
            await play(ns, "whistle");
            ns.exit();
        }

        ns.print("targetMoney not reached -- WAITING");
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @returns {Promise<void>}
 */
async function stat(ns) {
    const [
        action,
        whichStat,
        targetSkill = 0
    ] = ns.args;
    let stat = whichStat.toLowerCase(),
        currSkill;

    if (stat.includes("hack")) {
        stat = "hacking";
    } else if (stat.includes("str")) {
        stat = "strength";
    } else if (stat.includes("def")) {
        stat = "defense";
    } else if (stat.includes("dex")) {
        stat = "dexterity";
    } else if (stat.includes("agi")) {
        stat = "agility";
    } else if (stat.includes("cha")) {
        stat = "charisma";
    } else {
        ns.tprintf(`ERROR: Invalid stat: ${whichStat}`);
        ns.exit();
    }

    while (true) {
        let currSkill = ns.getPlayer().skills[stat];

        ns.print(`stat: ${stat}, targetSkill: ${stat}`);
        if (currSkill >= targetSkill) {
            await showNotice(ns, `${upperFirstLetter(ns, stat)} target skill reached: ${targetSkill}`);

            // comment out the line below if it yields an error
            // it loads singularity.connect which costs 32GB
            await play(ns, "drip");
            await ns.sleep(1000);
            break;
        }

        ns.print("targetSkill not reached -- WAITING");
        await ns.sleep(pollDelay);
    }
}

async function hashes(ns) {
    let act = (ns.args[1] ?? "").toLowerCase(),
        allowedActs = {
            "sell": "Sell for Money",
            "favor": "Company Favor",
            "study": "Improve Studying",
            "gym": "Improve Gym Training",
            "contract": "Generate Coding Contract"
        },
        action = allowedActs[act];

    if (!(act in allowedActs)) handleError(ns, `'${act}' is not a valid action`);

    let procs = ns.ps("home");
    procs.forEach(function (p) {
        if (p.filename === "watcher.js"
            && p.args[0] === "hashes"
            && p.pid !== ns.getRunningScript().pid
        ) {
            ns.kill(p.pid);
            return;
        }
    });

    ns.tprintf(`INFO: Using hashes: "${action}"`);

    while (true) {
        let pct = 0.000001,
            cap = ns.hacknet.hashCapacity() || 0,
            has = ns.hacknet.numHashes(),
            cost = ns.hacknet.hashCost(action),
            n = 0;

        if (has >= Math.floor(cap * pct)) {
            try {
                if (act === "sell") {
                    n = Math.floor(has / cost);

                    if (n < 1) {
                        ns.printf('Insufficient hashes to sell for money -- WAITING');
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    if (!ns.hacknet.spendHashes(action, "", n)) handleError(ns, "Failed to spend hashes");

                    let money = formatNumber(ns, n * 1000000, "shorthand", true);
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for ${money}`);
                }
                else if (act === "favor") {
                    let company = ns.args[2];

                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy favor -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action, company)) handleError(ns, "Failed to spend hashes");
                    }

                    let favor = n * 5;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${favor} favor for ${company}`);
                }
                else if (act === "study") {
                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved studying -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action)) handleError(ns, "Failed to spend hashes");
                    }

                    let study = n * 20;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${study}%% improved studying`);
                }
                else if (act === "gym") {
                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved gym training -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action)) handleError(ns, "Failed to spend hashes");
                    }

                    let gym = n * 20;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${gym}%% improved gym training`);
                }
                else if(act === "contract") {
                    if (cap < cost) handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy coding contract -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (ns.hacknet.numHashes() > ns.hacknet.hashCost(action)) {
                        n++;
                        if (!ns.hacknet.spendHashes(action)) handleError(ns, "Failed to spend hashes");
                    }

                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for coding contracts`);
                }
                //await play(ns, "drip");
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
    play(ns, "whistle");
    ns.exit();
}

function getTimeDiff() {
    cex = Date.now();
    exd = cex - lex; // in ms
    lex = cex;

    return exd;
}
