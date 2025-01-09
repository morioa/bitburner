import {
    formatMoney, formatNumber, formatTime,
    getAttackScript, getLastAttackParams,
    play, showNotice, upperFirstLetter
} from "./util.common.js";
import {arrayEqual, entityTypeValid, numberValid} from "./util.is.js";
import {getUnbreachedHosts, list} from "./util.target.js";
import {breachAll} from "./util.breach.js";
import {prepSleeve} from "./sleeve";

const pollDelay = 5000;
let lex = Date.now(),
    cex = null,
    exd = null;

/** @param {NS} ns */
export async function main(ns) {
    const [action] = ns.args;

    try {
        if (typeof eval(action) !== "function") {
            throw new Error("A valid action must be specified");
        }
    }
    catch (e) {
        await ns.tprintf(`ERROR: ${e.message}`);
        ns.exit();
    }

    await eval(action)(ns, ns.args);
}

/**
 * @param ns
 * @param args
 * @returns {Promise<void>}
 */
export async function hackable(ns, args) {
    const [
        action,
        autoAttack = 0,
        moneyThresh = 1
    ] = args;
    let prevTargets = [],
        newTargets;

    await ns.tprintf(`INFO: Watching for new targets with at least ${formatMoney(ns, moneyThresh)} max money (auto-attack ${(autoAttack) ? "enabled" : "disabled"})`);

    while (true) {
        newTargets = list(ns, moneyThresh, 1).map(t => t["host"]);
        if (!arrayEqual(ns, prevTargets, newTargets)) {
            showNotice(ns, "Watcher found new target(s)");
            prevTargets = newTargets;

            play(ns, "connect");
            await ns.sleep(1000);

            await breachAll(ns, [getUnbreachedHosts(ns)]);

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
                await ns.tprintf("WARNING: All available hosts and targets breached and attacked -- TERMINATING SELF");
                ns.exit();
            }
        }
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @param args
 * @returns {Promise<void>}
 */
export async function targets(ns, args) {
    const [
        action,
        moneyThresh = 0
    ] = args;

    while (true) {
        await ns.run("target.js", 1, "find", moneyThresh, 1);
        await ns.sleep(pollDelay);
    }
}

/**
 * @param ns
 * @param args
 * @returns {Promise<void>}
 */
export async function rep(ns, args) {
    const [
            action,
            entityType,
            entity,
            targetRep = 0
        ] = args,
        getRep = {
            company: ns.singularity.getCompanyRep,
            faction: ns.singularity.getFactionRep
        };
    let reportedInit = false,
        entityRep, erInt,
        erFormatted, trFormatted, drFormatted;


    if (!entityTypeValid(ns, entityType)) {
        await ns.tprintf(`ERROR: Invalid entity type: ${entityType}`);
        ns.exit();
    }

    while (true) {
        entityRep = getRep[entityType](entity);
        if (entityRep < 0) {
            await ns.tprintf(`ERROR: Invalid entity: ${entity}`);
            ns.exit();
        }

        if (!reportedInit) {
            erFormatted = formatNumber(ns, entityRep);
            trFormatted = formatNumber(ns, targetRep);
            drFormatted = formatNumber(ns, (targetRep - entityRep));
            await ns.tprintf(`INFO: entityRep: ${erFormatted}, targetRep: ${trFormatted}, remainingRep: ${drFormatted}`);
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
 * @param args
 * @returns {Promise<void>}
 */
export async function money(ns, args) {
    const [
        action,
        targetMoney,
        note = ""
    ] = args;
    let noteOut = note,
        reportedInit = false,
        playerMoney,
        pmFormatted, tmFormatted, dmFormatted;

    if (!numberValid(ns, targetMoney)) {
        await ns.tprintf(`ERROR: Invalid target money entry: ${targetMoney}`);
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
            await ns.tprintf(`INFO: playerMoney: ${formatMoney(ns, pmFormatted)}, targetMoney: ${formatMoney(ns, tmFormatted)}, remainingMoney: ${formatMoney(ns, dmFormatted)}`);
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
 * @param args
 * @returns {Promise<void>}
 */
export async function stat(ns, args) {
    const [
            action,
            whichStat,
            targetSkill = 0
        ] = args,
        statMap = {
            hack: "hacking",
            str: "strength",
            def: "defense",
            dex: "dexterity",
            agi: "agility",
            cha: "charisma",
            kar: "karma"
        };
    let stat = whichStat.toLowerCase(),
        statValid = false,
        currSkill;

    for (const [k,v] of Object.entries(statMap)) {
        if (stat.includes(k)) {
            stat = v;
            statValid = true;
            break;
        }
    }

    if (!statValid) {
        await ns.tprintf(`ERROR: Invalid stat: ${whichStat}`);
        ns.exit();
    }

    while (true) {
        let currSkillRaw = (stat === "karma")
                ? await ns.heart.break()
                : await ns.getPlayer().skills[stat],
            currSkill = (currSkillRaw < 0)
                ? Math.ceil(currSkillRaw)
                : (currSkillRaw > 0)
                    ? Math.floor(currSkillRaw)
                    : currSkillRaw;

        ns.print(`stat: ${stat}, targetSkill: ${targetSkill}, currSkill: ${currSkill}`);
        if (
            (targetSkill > 0 && currSkill >= targetSkill) ||
            (targetSkill < 0 && currSkill <= targetSkill)
        ) {
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

/**
 * @param ns
 * @param args
 * @returns {Promise<void>}
 */
export async function hashes(ns, args) {
    await ns.tprint(args);
    let act = (args[1] ?? "").toLowerCase(),
        allowedActs = {
            sell: "Sell for Money",
            favor: "Company Favor",
            study: "Improve Studying",
            gym: "Improve Gym Training",
            contract: "Generate Coding Contract"
        },
        action = allowedActs[act];

    if (!(act in allowedActs)) await handleError(ns, `'${act}' is not a valid action`);

    let procs = ns.ps("home");
    procs.forEach(function (p) {
        if (p.filename === "watch.js"
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
            cap = await ns.hacknet.hashCapacity() || 0,
            has = await ns.hacknet.numHashes(),
            cost = await ns.hacknet.hashCost(action),
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

                    if (!await ns.hacknet.spendHashes(action, "", n)) await handleError(ns, "Failed to spend hashes");

                    let money = formatNumber(ns, n * 1000000, "shorthand", true);
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for ${money}`);
                }
                else if (act === "favor") {
                    let company = ns.args[2];

                    if (cap < cost) await handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy favor -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (await ns.hacknet.numHashes() > await ns.hacknet.hashCost(action)) {
                        n++;
                        if (!await ns.hacknet.spendHashes(action, company)) await handleError(ns, "Failed to spend hashes");
                    }

                    let favor = n * 5;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${favor} favor for ${company}`);
                }
                else if (act === "study") {
                    if (cap < cost) await handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved studying -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (await ns.hacknet.numHashes() > await ns.hacknet.hashCost(action)) {
                        n++;
                        if (!await ns.hacknet.spendHashes(action)) await handleError(ns, "Failed to spend hashes");
                    }

                    let study = n * 20;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${study}%% improved studying`);
                }
                else if (act === "gym") {
                    if (cap < cost) await handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy improved gym training -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (await ns.hacknet.numHashes() > await ns.hacknet.hashCost(action)) {
                        n++;
                        if (!await ns.hacknet.spendHashes(action)) await handleError(ns, "Failed to spend hashes");
                    }

                    let gym = n * 20;
                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for +${gym}%% improved gym training`);
                }
                else if(act === "contract") {
                    if (cap < cost) await handleError(ns, "Hash cap reached -- ENDING");

                    if (has < cost) {
                        ns.printf("Insufficient hashes to buy coding contract -- WAITING");
                        await ns.sleep(pollDelay);
                        continue;
                    }

                    while (await ns.hacknet.numHashes() > await ns.hacknet.hashCost(action)) {
                        n++;
                        if (!await ns.hacknet.spendHashes(action)) await handleError(ns, "Failed to spend hashes");
                    }

                    ns.printf(`INFO: Reached hash spend threshold after ${formatTime(ns, getTimeDiff())} -- sold hashes ${n} times for coding contracts`);
                }
                //await play(ns, "drip");
            }
            catch (e) {
                await ns.tprintf(`ERROR: ${e.message}`);
                ns.exit();
            }
        }

        await ns.sleep(pollDelay);
    }
}

export async function tasks(ns, args) {
    const [action, includePlayerAlert = 0] = args,
        alertDelayMinutes = 10,
        alertDelay = alertDelayMinutes * 60 * 1000,
        pollDelay = 10000;
    let i, sleeveCount,
        sleeveName, sleeve, task,
        playAlert = false, alerts = {}, timeNow;

    while (true) {
        timeNow = Date.now();

        sleeveName = "pl";
        sleeve = await ns.getPlayer();
        task = await ns.singularity.getCurrentWork();

        if (task === null) {
            if (includePlayerAlert && (!Object.hasOwn(alerts, sleeveName) || alerts[sleeveName] + alertDelay <= timeNow)) {
                await ns.tprintf(`WARN: Player is idle`);
                playAlert = true;
                alerts[sleeveName] = timeNow;
            }
        }

        sleeveCount = await ns.sleeve.getNumSleeves();

        for (i = 0; i < sleeveCount; i++) {
            sleeveName = `s${i}`;
            sleeve = await ns.sleeve.getSleeve(i);
            task = await ns.sleeve.getTask(i);

            if (sleeve.shock > 0) {
                if (task === null || task.type !== "RECOVERY") {
                    await ns.tprintf(`INFO: Setting sleeve ${i} to shock recovery [Shock: ${formatNumber(ns, sleeve.shock)}]`);
                    await ns.sleeve.setToShockRecovery(i);
                }
            } else if (sleeve.sync < 100) {
                if (task === null || task.type !== "SYNCHRO") {
                    await ns.tprintf(`INFO: Setting sleeve ${i} to synchronize [Sync: ${formatNumber(ns, sleeve.sync)}]`);
                    await ns.sleeve.setToSynchronize(i);
                }
            } else if (task !== null && ["RECOVERY","SYNCHRO"].includes(task.type)) {
                await ns.tprintf(`WARN: Setting sleeve ${i} to idle`);
                await ns.sleeve.setToIdle(i);
                playAlert = true;
                alerts[sleeveName] = timeNow;
            } else if (task === null) {
                if (!Object.hasOwn(alerts, sleeveName) || alerts[sleeveName] + alertDelay <= timeNow) {
                    await ns.tprintf(`WARN: Sleeve ${i} is idle`);
                    playAlert = true;
                    alerts[sleeveName] = timeNow;
                }
            }
        }

        if (playAlert) {
            await play(ns, "disconnect");
            playAlert = false;
        }

        await ns.sleep(pollDelay);
    }
}

export async function territory(ns, args) {
    const [action] = args,
        script = 'gang.js';
    let gi = await ns.gang.getGangInformation(), ogi,
        ctw = null, ctwCurr, ctwCurrLow = null, ctwThreshold = 0.95,
        ctwPct, ctwThresholdPct = formatNumber(ns, ctwThreshold * 100) + "%",
        tp;

    await ns.run(script, 1, "task", "all", "tw");
    await ns.sleep(1000);

    while (ctw === null || ctw < ctwThreshold) {
        ogi = await ns.gang.getOtherGangInformation();
        ctwCurrLow = null;

        for (const [k,v] of Object.entries(ogi)) {
            if (k === gi.faction) {
                continue;
            }

            ctwCurr = await ns.gang.getChanceToWinClash(k);
            //await ns.print(k + " : " + ctwCurr);
            if (ctwCurrLow === null || ctwCurr < ctwCurrLow) {
                ctwCurrLow = ctwCurr;
            }
        }

        ctw = ctwCurrLow;

        ctwPct = formatNumber(ns, ctw * 100) + "%";
        ns.print(`Chance to win: ${ctwPct} (target: ${ctwThresholdPct})`);

        if (ctw < ctwThreshold) {
            await ns.sleep(pollDelay);
        }
    }

    await ns.gang.setTerritoryWarfare(true);
    gi = await ns.gang.getGangInformation();

    while (gi.territoryWarfareEngaged && gi.territory < 1) {
        tp = formatNumber(ns, gi.territory * 100) + "%";
        ns.print(`We only occupy ${tp} of territories -- WAITING`);
        await ns.sleep(pollDelay);
        gi = await ns.gang.getGangInformation();
    }

    ns.print("All territories acquired -- ENDING");
    await ns.gang.setTerritoryWarfare(false);
    await ns.run(script, 1, "task", "all", "ht");
    await play(ns, "tonelo");
}

export async function grafts(ns, args) {
    const [action] = args,
        pollDelay = 10000,
        graftCity = "New Tokyo",
        graftOrder = [
            "violet Congruity Implant",
            "Neuroreceptor Management Implant",
            "The Blade's Simulacrum",
            "Xanipher",
            "nextSENS Gene Modification",
            "QLink",
            "Power Recirculation Core",
            "ECorp HVMind Implant",
            "Neurotrainer I",
            "Neurotrainer II",
            "Neurotrainer III",
            "SPTN-97 Gene Modification"
        ];
    let player, task, taskCount,
        augs, augsCount, ownedAugs, ownedAugsCount,
        graftTime, grafting = false, msg;

    augs = await ns.grafting.getGraftableAugmentations();
    augsCount = augs.length;
    ownedAugs = await ns.singularity.getOwnedAugmentations();
    ownedAugsCount = ownedAugs.length;

    while (augsCount > 0) {
        player = await ns.getPlayer();
        task = await ns.singularity.getCurrentWork();

        if (task === null) {
            if (player.city !== graftCity) {
                await ns.singularity.travelToCity(graftCity);
            }

            for (let i = 0; i < augsCount; i++) {
                if (await ns.grafting.graftAugmentation(augs[i], false)) {
                    task = await ns.singularity.getCurrentWork();
                    msg = `Grafting augmentation '${augs[i]}'`;
                    await ns.tprintf(`WARN: ${msg}`);
                    break;
                }
            }

            if (player.city !== graftCity) {
                await ns.singularity.travelToCity(player.city);
            }
        }

        taskCount = (task === null || task.type !== "GRAFTING") ? 0 : 1;
        grafting = (task !== null && task.type === "GRAFTING");
        ns.print(`Augmentations: ${ownedAugsCount} of ${ownedAugsCount + augsCount} installed, ${taskCount} actively grafting` + ((grafting) ? ` >>> ${task.augmentation}` : ""));

        if (grafting) {
            graftTime = (await ns.grafting.getAugmentationGraftTime(task.augmentation)) - (task.cyclesWorked * 200);
            await ns.sleep(graftTime);
        } else {
            await ns.sleep(pollDelay);
        }

        augs = await ns.grafting.getGraftableAugmentations();
        augsCount = augs.length;
        ownedAugs = await ns.singularity.getOwnedAugmentations();
        ownedAugsCount = ownedAugs.length;
    }

    ns.print("No more graftable augmentations -- ENDING");
}

/**
 * @param ns
 * @param msg
 */
export async function handleError(ns, msg) {
    await ns.tprintf(`ERROR: ${msg}`);
    play(ns, "whistle");
    ns.exit();
}

/**
 * @returns {number}
 */
export function getTimeDiff() {
    cex = Date.now();
    exd = cex - lex; // in ms
    lex = cex;

    return exd;
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const t = this,
        [action = null, a1 = null] = args,
        excludedMethods = [
            "main",
            "handleError",
            "getTimeDiff",
            "autocomplete"
        ],
        actions = Object.getOwnPropertyNames(t).filter(function (p) {
            return (typeof t[p] === "function" && !excludedMethods.includes(p));
        });
    let ac = [],
        a1Choices;

    switch (action) {
        case "hackable":
            if (a1 === null) {
                ac = [0,1];
            }
            break;

        case "targets":
            break;

        case "rep":
            a1Choices = ["company","faction"];
            if (a1 === null || !a1Choices.includes(a1)) {
                ac = a1Choices;
            }
            break;

        case "money":
            break;

        case "stat":
            a1Choices = ["hack","str","def","dex","agi","cha","kar"];
            if (a1 === null || !a1Choices.includes(a1)) {
                ac = a1Choices;
            }
            break;

        case "hashes":
            a1Choices = ["sell","favor","study","gym","contract"];
            if (a1 === null || !a1Choices.includes(a1)) {
                ac = a1Choices;
            }
            break;

        case "tasks":
            if (a1 === null) {
                ac = [0,1];
            }
            break;

        case "territory":
        case "grafts":
        default:
            ac = actions;
    }

    return ac;
}
