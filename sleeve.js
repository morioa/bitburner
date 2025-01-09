import {renderTable} from "./util.table";
import {formatNumber} from "./util.common";

/** @param {NS} ns */
export async function main(ns) {
    const [action = null] = ns.args;

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

export async function list(ns, args) {
    const [action] = args,
        sleevesCount = await ns.sleeve.getNumSleeves();
    let sleeveName, sleeve, sleevePrep, sleeves = [],
        task;

    sleeveName = "Player"
    sleeve = await ns.getPlayer();
    task = await ns.singularity.getCurrentWork();
    sleeves.push(await prepSleeve(ns, sleeveName, sleeve, task));

    for (let i = 0; i < sleevesCount; i++) {
        sleeveName = `Sleeve ${i}`;
        sleeve = await ns.sleeve.getSleeve(i);
        task = await ns.sleeve.getTask(i);
        sleeves.push(await prepSleeve(ns, sleeveName, sleeve, task));
    }

    await renderTable(ns, "Player/Sleeves", sleeves, true, false, true);
}

export async function prepSleeve(ns, name, sleeve, task) {
    let sleevePrep;

    sleevePrep = {
        "Name": name,
        "Health": ((sleeve.hp.current < sleeve.hp.max) ? "[[!" : "") + `${sleeve.hp.current}/${sleeve.hp.max}`,
        "Hack": sleeve.skills.hacking,
        "Str": sleeve.skills.strength,
        "Def": sleeve.skills.defense,
        "Dex": sleeve.skills.dexterity,
        "Agi": sleeve.skills.agility,
        "Cha": sleeve.skills.charisma,
        "Int": sleeve.skills.intelligence,
        "Shock": (Object.hasOwn(sleeve, "shock"))
            ? ((sleeve.shock > 0) ? "[[!" : "") + formatNumber(ns, sleeve.shock)
            : "",
        "Sync": (Object.hasOwn(sleeve, "sync"))
            ? ((sleeve.sync < 100) ? "[[!" : "") + formatNumber(ns, sleeve.sync)
            : "",
        "Memory": (Object.hasOwn(sleeve, "memory")) ? sleeve.memory : "",
        "Cycles": (Object.hasOwn(sleeve, "storedCycles")) ? sleeve.storedCycles : "",
        "City": sleeve.city,
        "Task": (task === null) ? "[[!IDLE" : task.type,
        "Task Detail 1": "",
        "Task Detail 2": ""
    };

    if (task !== null) {
        switch (task.type) {
            case "BLADEBURNER":
                sleevePrep["Task Detail 1"] = task.actionType;
                sleevePrep["Task Detail 2"] = task.actionName;
                break;

            case "FACTION":
                sleevePrep["Task Detail 1"] = task.factionName;
                sleevePrep["Task Detail 2"] = task.factionWorkType[0].toUpperCase() + task.factionWorkType.substring(1);
                break;

            case "GRAFTING":
                sleevePrep["Task Detail 1"] = task.augmentation;
                break;

            case null:
            default:
            // do nothing
        }
    }

    return sleevePrep;
}