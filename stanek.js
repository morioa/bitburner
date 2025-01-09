import {renderTable} from "./util.table";
import {getHomeRamReserved} from "./util.common";

let nsHold;

/** {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");

    nsHold = ns;

    const [action = "active"] = ns.args;

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

export async function active(ns, args) {
    const [action] = args,
        frags = ns.stanek.activeFragments();

    renderTable(ns, "Stanek Fragments", frags, true);
}

export async function charge(ns, args) {
    const [action, id = "all", ramPct = 50] = args,
        frags = await ns.stanek.activeFragments(),
        hostRamReserved = getHomeRamReserved(ns),
        hostRamMax = await ns.getServerMaxRam("home"),
        hostRamUsed = await ns.getServerUsedRam("home"),
        hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed,
        scriptRam = await ns.getScriptRam("stanek.js"),
        threads = Math.floor((hostRamAvail / scriptRam) * (ramPct / 100));

    await ns.print(frags);
    while (true) {
        for (const f of frags) {
            if (
                (id !== "all" && f.id !== id)
                || f.limit > 1
            ) {
                continue;
            }

            ns.print(`INFO: Charging fragment ${f.id}`);
            await ns.stanek.chargeFragment(f.x, f.y);

            const fc = await ns.stanek.getFragment(f.x, f.y);

            ns.print(`INFO: ... now has ${fc.numCharge} charge(s)`);
        }

        await ns.sleep(200);
    }
}

export async function store(ns, args) {
    const [action] = args,
        file = "stanek.txt",
        frags = ns.stanek.activeFragments();

    await ns.write(file, JSON.stringify(frags), "w");
    await ns.tprintf(`INFO: Stored Stanek fragments placement to '${file}'`);
}

export async function place(ns, args) {
    const [action] = args,
        file = "stanek.txt",
        frags = JSON.parse((await ns.fileExists(file))
            ? await ns.read(file)
            : ""),
        fragsCount = frags.length;
    let fi = 0;

    for (const f of frags) {
        fi++;
        const placed = await ns.stanek.placeFragment(f.x, f.y, f.rotation, f.id);
        await ns.tprintf(`${(placed) ? "INFO" : "ERROR"}: Fragment ${fi} of ${fragsCount} (${f.id}) placement ${(placed) ? "succeeded" : "failed"}`);
    }
}

/**
 * @param data
 * @param args
 * @returns {*[]}
 */
export function autocomplete(data, args) {
    const t = this,
        [action = null, a1 = null, a2 = null] = args,
        excludedMethods = [
            "main",
            "autocomplete"
        ],
        actions = Object.getOwnPropertyNames(t).filter(function (p) {
            return (typeof t[p] === "function" && !excludedMethods.includes(p));
        });
    let ac = [],
        a1Choices, a2Choices;

    switch (action) {
        case "charge":
            a1Choices = ["all"];
            a2Choices = Array(10).fill().map((_, i) => (i + 1) * 10);
            if (a1 === null || !a1Choices.includes(a1)) {
                ac = a1Choices;
            } else if (a2 === null || !a2Choices.includes(a2)) {
                ac = a2Choices;
            }
            break;

        case "active":
        case "store":
        case "place":
            break;

        default:
            ac = actions;
    }

    return ac;
}


/*

[
{"id":6,"x":1,"y":4,"highestCharge":1.1875,"numCharge":14583,"rotation":2,"shape":[[true,true,true,true]],"type":4,"power":2,"limit":1,"effect":"+x% hack() power"},
{"id":7,"x":4,"y":0,"highestCharge":1.1875,"numCharge":14583,"rotation":3,"shape":[[true,false,false],[true,true,true]],"type":5,"power":0.5,"limit":1,"effect":"+x% grow() power"},
{"id":25,"x":3,"y":3,"highestCharge":1.1875,"numCharge":14583,"rotation":2,"shape":[[true,false,false],[true,true,true]],"type":14,"power":0.5,"limit":1,"effect":"+x% reputation from factions and companies"},
{"id":1,"x":3,"y":0,"highestCharge":1.1875,"numCharge":14583,"rotation":1,"shape":[[true,true,false],[false,true,true]],"type":6,"power":1,"limit":1,"effect":"+x% hacking skill"},
{"id":0,"x":0,"y":0,"highestCharge":1.1875,"numCharge":14583,"rotation":1,"shape":[[false,true,true],[true,true,false]],"type":6,"power":1,"limit":1,"effect":"+x% hacking skill"},
{"id":5,"x":1,"y":0,"highestCharge":1.1875,"numCharge":14583,"rotation":0,"shape":[[true,true,true],[false,true,false]],"type":3,"power":1.3,"limit":1,"effect":"+x% faster hack(), grow(), and weaken()"},
{"id":106,"x":0,"y":2,"highestCharge":0,"numCharge":0,"rotation":0,"shape":[[true,false,false],[true,true,true],[true,false,false]],"type":18,"power":1.1,"limit":99,"effect":"1.1x adjacent fragment power"}
]

 */