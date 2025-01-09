/** @param {NS} ns **/
import {renderTable} from "./util.table";
import {formatMoney, formatNumber} from "./util.common";

export async function main(ns) {
    const [action = null] = ns.args;

    if (!await ns.gang.inGang()) {
        await ns.tprintf("ERROR: You must first join a gang");
        ns.exit();
    }

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

export async function info(ns, args) {
    const [action, includeTerritory = false] = args,
        ticksPerSec = 5;
    let gi = await ns.gang.getGangInformation(),
        gn = gi.faction,
        giv = {
            "Reputation": formatNumber(ns, await ns.singularity.getFactionRep(gn)),
            "Money Gain": formatMoney(ns, gi.moneyGainRate * ticksPerSec) + " / sec",
            "Respect Gain": formatNumber(ns, gi.respectGainRate * ticksPerSec) + " / sec",
            "Respect": ((gi.respect >= gi.respectForNextRecruit) ? "[[@" : "") + formatNumber(ns, gi.respect),
            "Next Recruit": "@ " + formatNumber(ns, gi.respectForNextRecruit),
            "Wanted Gain": formatNumber(ns, gi.wantedLevelGainRate * ticksPerSec) + " / sec",
            "Wanted Level": formatNumber(ns, gi.wantedLevel),
            "Wanted Penalty": "x " + formatNumber(ns, gi.wantedPenalty),
            "Hacking": gi.isHacking
        };

    if (includeTerritory || gi.territoryWarfareEngaged) {
        giv["At War"] = ((gi.territoryWarfareEngaged) ? "[[@" : "") + gi.territoryWarfareEngaged;
        giv["Power"] = formatNumber(ns, gi.power);
        giv["Territory"] = formatNumber(ns, gi.territory * 100) + "%";
        giv["Clash Chance"] = formatNumber(ns, gi.territoryClashChance * 100) + "%";
    }

    await renderTable(ns, gn, [giv], true);
    await members(ns, ["members"]);
    await ascendInfo(ns, ["ascendInfo"]);
}

export async function members(ns, args) {
    const [action] = args,
        ticksPerSec = 5,
        gangInfo = await ns.gang.getGangInformation(),
        memberNames = await ns.gang.getMemberNames(),
        eqNames = await ns.gang.getEquipmentNames();
    let eqs = {}, members = [], member;

    for (const e of eqNames) {
        let et = await ns.gang.getEquipmentType(e);

        if (!eqs.hasOwnProperty(et)) {
            eqs[et] = [];
        }

        eqs[et].push(e);
    }

    for (const m of memberNames) {
        let mi = await ns.gang.getMemberInformation(m),
            member = {
                Name: mi.name,
                Task: mi.task,
                Hack: mi.hack,
                Str: mi.str,
                Def: mi.def,
                Dex: mi.dex,
                Agi: mi.agi,
                Cha: mi.cha,
                "Respect Gain": formatNumber(ns, mi.respectGain * ticksPerSec) + " / sec",
                "Wanted Gain": formatNumber(ns, mi.wantedLevelGain * ticksPerSec) + " / sec",
                "Money Gain": formatMoney(ns, mi.moneyGain * ticksPerSec) + " / sec"
            };
        mi.upgrades = mi.upgrades.concat(mi.augmentations);

        for (const [eqType, eqList] of Object.entries(eqs)) {
            const eqListCnt = eqList.length;
            let eCnt = 0;

            eqList.forEach(function (e) {
                eCnt += (mi.upgrades.includes(e)) ? 1 : 0;
            });

            let errStr = (eCnt === eqListCnt)
                ? ""
                : "[[!";
            member[eqType] = `${errStr}${eCnt}/${eqListCnt}`;
        }

        members.push(member);
    }

    await renderTable(ns, "Members", members, true, false, true);
}

export async function ascend(ns, args) {
    const [action, member = "all", buyUps = 0] = args,
        members = (member === "all")
            ? await ns.gang.getMemberNames()
            : [member],
        upDelaySec = 60,
        upDelay = upDelaySec * 1000;
    let mi, miTasks = {};

    if (members.length === 0) {
        await ns.tprintf(`WARNING: No members in gang`);
        ns.exit()
    }

    for (const m of members) {
        mi = await ns.gang.getMemberInformation(m);
        miTasks[m] = mi.task;

        await ns.gang.ascendMember(m);
        await ns.tprintf(`INFO: ${m} ascended`);
    }

    if (buyUps) {
        await ns.tprintf("WARN: Buying all upgrades");

        for (const m of members) {
            await buy(ns, ["buy", m, "u"]); // re-buy all upgrades
        }
    }

    let trainTasks = [
        "tc",  // combat
        "th",  // hacking
        "tl"   // charisma
    ];

    for (const t of trainTasks) {
        await ns.tprintf(`WARN: Setting task ${t}`);

        for (const m of members) {
            await task(ns, ["task", m, t]); // assign training task
        }

        await ns.tprintf(`WARN: Sleeping ${upDelaySec} seconds`);
        await ns.sleep(upDelay);  // give some time to train
    }

    await ns.tprintf(`WARN: Assigning original pre-ascension task`);
    for (const m of members) {
        await task(ns, ["task", m, miTasks[m]]);  // re-assign pre-ascension task
    }

    await info(ns, ["info"]);
}

export async function ascendInfo(ns, args) {
    const [action, member = "all"] = args,
        multThresh = 4.5,
        gangInfo = await ns.gang.getGangInformation(),
        members = (member === "all")
            ? await ns.gang.getMemberNames()
            : [member];
    let info = [];

    for (const m of members) {
        let ar = await ns.gang.getAscensionResult(m);

        if (ar === undefined) {
            ar = {
                respect: 0,
                hack: 0,
                str: 0,
                def: 0,
                dex: 0,
                agi: 0,
                cha: 0
            };
        }

        info.push({
            Name: m,
            "Respect Loss": "-" + await formatNumber(ns, ar.respect),
            "Hack Mult": ((ar.hack >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.hack),
            "Str Mult": ((ar.str >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.str),
            "Def Mult": ((ar.def >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.def),
            "Dex Mult": ((ar.dex >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.dex),
            "Agi Mult": ((ar.agi >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.agi),
            "Cha Mult": ((ar.cha >= multThresh) ? "[[@" : "") + "x " + await formatNumber(ns, ar.cha)
        });
    }

    await renderTable(ns, "Post Ascension Projection", info, true);
}

export async function buy(ns, args) {
    const [action, member = "all", what = "all", listPriceOnly = 0] = args,
        members = (member === "all")
            ? await ns.gang.getMemberNames()
            : [member],
        eqNames = await ns.gang.getEquipmentNames(),
        eqCount = eqNames.length,
        whatMap = {
            w: "Weapon",
            a: "Armor",
            v: "Vehicle",
            r: "Rootkit",
            g: "Augmentation"
        },
        moneyAvail = await ns.getServerMoneyAvailable("home");
    let whats = [];

    switch (what) {
        case "all":
            whats = ["w","a","v","r","g"];
            break;

        case "u":
            whats = ["w","a","v","r"];
            break;

        default:
            whats = [what];
    }

    let eqCostTotal = 0,
        eqPriceList = [];

    for (const m of members) {
        const mi = await ns.gang.getMemberInformation(m),
            miEqCount = mi.upgrades.length + mi.augmentations.length;

        if (miEqCount === eqCount && !listPriceOnly) {
            const eqTypeOut = (what === "all")
                ? "upgrades and augmentations"
                : `${whatMap[what]}s`
            await ns.tprintf(`WARN: ${m} already has all ${eqTypeOut.toLowerCase()}`);
            continue;
        }

        for (const e of eqNames) {
            const eqType = await ns.gang.getEquipmentType(e);

            for (const w of whats) {
                if (eqType === whatMap[w]) {
                    const hasEq = (mi.upgrades.includes(e) || mi.augmentations.includes(e)),
                        eqCost = await ns.gang.getEquipmentCost(e);

                    if (!hasEq) {
                        if (listPriceOnly) {
                            eqPriceList.push({
                                Name: m,
                                Item: e,
                                Type: eqType,
                                Cost: ((moneyAvail < eqCost) ? "[[!" : "") + formatMoney(ns, eqCost)
                            });
                            eqCostTotal += eqCost;
                        } else if (await ns.gang.purchaseEquipment(m, e)) {
                            await ns.tprintf(`INFO: ${m} now has ${eqType.toLowerCase()} "${e}"`);
                        } else {
                            await ns.tprintf(`ERROR: Failed to purchase ${eqType.toLowerCase()} "${e}" for ${m} [${formatMoney(ns, eqCost)}]`);
                        }
                    } else if (!listPriceOnly) {
                        await ns.tprintf(`WARN: ${m} already has ${eqType.toLowerCase()} "${e}"`);
                    }
                }
            }
        }
    }

    if (listPriceOnly) {
        eqPriceList.push({
            Name: "",
            Item: "",
            Type: "[[!Total:",
            Cost: ((moneyAvail < eqCostTotal) ? "[[!" : "") + formatMoney(ns, eqCostTotal)
        });

        await renderTable(ns, "Equipment Price List", eqPriceList, true);
    }
}

export async function recruit(ns) {
    const namePrefix = "m",
        recruitLimit = 12;
    let recruited = false,
        members, n, name;

    while (await ns.gang.canRecruitMember()) {
        members = await ns.gang.getMemberNames();
        for (n = 0; n < recruitLimit; n++) {
            name = `${namePrefix}${n+1}`;
            if (!members.includes(name)) {
                await ns.gang.recruitMember(name);
                await ns.tprintf(`INFO: Recruited member "${name}"`);
                recruited = true;
                break;
            }
        }

        await task(ns, ["task", name]);
    }

    members = await ns.gang.getMemberNames();
    n = members.length;

    if (n === recruitLimit) {
        await ns.tprintf(`WARN: Recruit limit reached`);
    } else if (!recruited) {
        await ns.tprintf(`WARN: No recruit slots available yet`);
    }

    await info(ns, ["info"]);
}

export async function task(ns, args) {
    const [action, member = "all", task = "tc"] = args,
        taskMap = {
            ua: "Unassigned",
            mp: "Mug People",
            dd: "Deal Drugs",
            sc: "Strongarm Civilians",
            rc: "Run a Con",
            ar: "Armed Robbery",
            ta: "Traffick Illegal Arms",
            tb: "Threaten & Blackmail",
            ht: "Human Trafficking",
            tr: "Terrorism",
            vj: "Vigilante Justice",
            tc: "Train Combat",
            th: "Train Hacking",
            tl: "Train Charisma",
            tw: "Territory Warfare"
        },
        t = (taskMap.hasOwnProperty(task))
            ? taskMap[task]
            : task;
    let members = await ns.gang.getMemberNames();

    switch (member) {
        case "list":
            let taskList = [];

            for (const [key, value] of Object.entries(taskMap)) {
                taskList.push({Id: "[[!" + key, Task: value});
            }
            await renderTable(ns, "Task List", taskList, true);
            ns.exit();
            break;

        case "all":
            break;

        case "first":
            members = [members.shift()];
            break;

        case "last":
            members = [members.pop()];
            break;

        default:
            members = [member];
    }

    for (const m of members) {
        if (await ns.gang.setMemberTask(m, t)) {
            await ns.tprintf(`INFO: ${m} is now performing the "${t}" task`);
        } else {
            await ns.tprintf(`ERROR: Failed to assign the "${t}" task to ${m}`);
        }
    }
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const t = this,
        [
            action = null,
            a1 = null,
            a2 = null,
            a3 = null
        ] = args,
        excludedMethods = [
            "main",
            "autocomplete"
        ],
        actions = Object.getOwnPropertyNames(t).filter(function (p) {
            return (typeof t[p] === "function" && !excludedMethods.includes(p));
        });
    let ac = [],
        a1Choices, a2Choices,
        memberChoices = ["all","last"];

    for (let i = 1; i <= 12; i++) {
        memberChoices.push(`m${i}`);
    }

    switch (action) {
        case "info":
            if (a1 === null) {
                ac = [0,1];
            }
            break;

        case "members":
            break;

        case "ascend":
            if (a1 === null || !memberChoices.includes(a1)) {
                ac = memberChoices;
            } else if (a2 === null) {
                ac = [0,1];
            }
            break;

        case "ascendInfo":
            break;

        case "buy":
            a2Choices = ["w","a","v","r","g"];
            if (a1 === null || !memberChoices.includes(a1)) {
                ac = memberChoices;
            } else if (a2 === null || !a2Choices.includes(a2)) {
                ac = a2Choices;
            } else if (a3 === null) {
                ac = [0,1];
            }
            break;

        case "recruit":
            break;

        case "task":
            a2Choices = ["ua","mp","dd","sc","rc","ar","ta","tb","ht","tr","vj","tc","th","tl","tw"];
            if (a1 === null || !memberChoices.includes(a1)) {
                ac = memberChoices;
            } else if (a2 === null || !a2Choices.includes(a2)) {
                ac = a2Choices;
            }
            break;

        default:
            ac = actions;
    }

    return ac;
}
