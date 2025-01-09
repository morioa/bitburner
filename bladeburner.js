/** @param {NS} ns **/
import {renderTable} from "./util.table";
import {formatNumber} from "./util.common";

export async function main(ns) {
    const [action = null] = ns.args;

    if (!await ns.bladeburner.inBladeburner()) {
        await ns.tprintf("ERROR: You must first join the Bladeburner division of the NSA");
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

export async function skills(ns, args) {
    const [action, upgradeCount = 1] = args,
        skillsMap = getSkillsMap();
    let skillPoints = await ns.bladeburner.getSkillPoints(),
        skills = await ns.bladeburner.getSkillNames(),
        skillObj, skillObjs = [],
        skillUpgradeCost = 0, totalSkillUpgradeCost = 0;

    for (const s of skills) {
        skillUpgradeCost = await ns.bladeburner.getSkillUpgradeCost(s, upgradeCount);
        totalSkillUpgradeCost += (skillUpgradeCost === Infinity)
            ? 0
            : skillUpgradeCost;
        skillObj = {
            "Name": s,
            "Alias": "[[@" + (skillsMap[skillsMap.findIndex(obj => { return obj.name === s; })].alias ?? ""),
            "Level": await ns.bladeburner.getSkillLevel(s),
            "Upgrade Cost": skillUpgradeCost
        };
        skillObj["Upgrade Cost"] = ((skillObj["Upgrade Cost"] > skillPoints) ? "[[!" : "") + formatNumber(ns, skillObj["Upgrade Cost"]);
        skillObjs.push(skillObj);
    }

    skillObjs.push({
        "Name": "",
        "Alias": "",
        "Level": "[[@Usable:",
        "Upgrade Cost": "[[@" + formatNumber(ns, skillPoints)
    });

    await renderTable(ns, `Bladeburner Skills`, skillObjs, true);
}

export async function upgrade(ns, args) {
    const [action, skillAlias, count = 1, listCostOnly = 0] = args,
        skillsMap = getSkillsMap();
    let skillsList = [], skill;

    if (skillAlias === "all") {
        skillsMap.forEach(function (s) {
            skillsList.push(s.name);
        });
    } else {
        try {
            let skillIdx = skillsMap.findIndex(obj => { return obj.alias === skillAlias; });
            if (skillIdx < 0) {
                throw new Error(`'${skillAlias}' is not a valid skill alias`);
            }

            skillsList.push(skillsMap[skillsMap.findIndex(obj => { return obj.alias === skillAlias; })].name);
        }
        catch (e) {
            await ns.tprintf(`ERROR: ${e.message}`);
            await skills(ns, ["skills", count]);
            ns.exit();
        }
    }

    if (listCostOnly) {

    }

    for (const s of skillsList) {

    }

    skill = skillsList[0];

    if (listCostOnly) {
        let skillPointsCost = formatNumber(ns, ns.bladeburner.getSkillUpgradeCost(skill, count));
        await ns.tprintf(`INFO: Upgrading "${skill}" ${count} time(s) requires ${skillPointsCost} points`);
    } else {
        if (! await ns.bladeburner.upgradeSkill(skill, count)) {
            await ns.tprintf(`ERROR: Failed to upgrade "${skill}" ${count} time(s)`);
        } else {
            await ns.tprintf(`INFO: Successfully upgrade "${skill}" ${count} time(s)`);
        }

        await skills(ns, ["skills", count]);
    }
}

export async function killNode(ns, args) {
    const [action, nextNode] = args,
        pollDelay = 10000,
        type = "BlackOps";
    let rank, nextOp, nextOpTime, currentAction;

    await ns.bladeburner.stopBladeburnerAction();

    while (true) {
        rank = await ns.bladeburner.getRank();
        nextOp = await ns.bladeburner.getNextBlackOp();
        currentAction = await ns.bladeburner.getCurrentAction();

        if (rank === null) {
            // this likely means that the previous node was killed and this script was running
            await ns.exit(0);
        }

        if (nextOp === null || nextOp == undefined) {
            await ns.tprintf('ERROR: No new Black Op available');

            if (nextNode === null || nextNode == undefined) {
                await ns.exit(0);
            }

            await ns.singularity.destroyW0r1dD43m0n(nextNode, 'autoinit.js');
            await ns.exit(0); // just in case
        }

        if (currentAction !== null || rank < nextOp.rank) {
            await ns.sleep(pollDelay);
        } else {
            nextOpTime = await ns.bladeburner.getActionTime(type, nextOp.name);
            await ns.bladeburner.startAction(type, nextOp.name);
            await ns.sleep(nextOpTime + 100);
        }

        await ns.sleep(1);
    }
}

export function getSkillsMap() {
    return [
        {name: "Blade's Intuition", alias: "bi"},
        {name: "Cloak",             alias: "cl"},
        {name: "Short-Circuit",     alias: "sc"},
        {name: "Digital Observer",  alias: "do"},
        {name: "Tracer",            alias: "tr"},
        {name: "Overclock",         alias: "oc"},
        {name: "Reaper",            alias: "re"},
        {name: "Evasive System",    alias: "es"},
        {name: "Datamancer",        alias: "dm"},
        {name: "Cyber's Edge",      alias: "ce"},
        {name: "Hands of Midas",    alias: "hm"},
        {name: "Hyperdrive",        alias: "hd"}
    ];
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
            "autocomplete",
            "getSkillsMap"
        ],
        actions = Object.getOwnPropertyNames(t).filter(function (p) {
            return (typeof t[p] === "function" && !excludedMethods.includes(p));
        }),
        skillChoices = getSkillsMap().map(obj => obj.alias);
    let ac = [],
        a1Choices, a2Choices;

    switch (action) {
        case "upgrade":
            a2Choices = ["int","10","50","200"];
            if (a1 === null || !skillChoices.includes(a1)) {
                ac = skillChoices;
            } else if (a2 === null || !a2Choices.includes(a2)) {
                ac = a2Choices;
            }
            break;

        case "skills":
        default:
            ac = actions;
    }

    return ac;
}
