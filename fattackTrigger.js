import {getHomeRamReserved, listHostsOwned, formatMoney} from "./util.common";
import {list} from "./util.target";

/** @param {NS} ns **/
export async function main(ns) {
    const [attackRemaining = 0, targetMoneyMin = 1000000000] = ns.args,
        killScripts = [
            "_fgrow.js",
            "_fhack.js",
            "_fweaken.js",
            "_chesterTheMolester.js",
            "_grow.js",
            "_hack.js",
            "_weaken.js",
            "fattack.js"
        ],
        scripts = {
            p: { file: "fattack.js" },
            g: { file: "_fgrow.js" },
            h: { file: "_fhack.js" },
            w: { file: "_fweaken.js" }
        },
        utils = ["util.common.js", "util.target.js"];
    let myhosts = listHostsOwned(ns, true, true),
        targets = list(ns, targetMoneyMin, 1).sort((a,b) => b.moneyMax - a.moneyMax),
        attackers = getHostsDetails(ns, myhosts, scripts).sort((a,b) => b.maxRam - a.maxRam);

    if (await ns.kill("watch.js", "home", "hackable", 1, 1)) {  // prevent auto-attack using old attack script
        if (await ns.fileExists("attack.txt", "home")) {
            await ns.rm("attack.txt");  // remove attack config file just in case
        }
        await ns.exec("watch.js", "home", 1, "hackable", 0, 1); // continue to watch for new hosts to breach
    }

    if (!attackRemaining) {
        for (const h of myhosts) {
            for (const s of killScripts) {
                await ns.scriptKill(s, h);
            }
        }

        for (const a of attackers) {
            if (a.host !== "home") {
                for (const [k, s] of Object.entries(scripts)) {
                    await ns.scp(s.file, a.host);
                }

                for (const u of utils) {
                    await ns.scp(u, a.host);
                }
            }

            if (targets.length > 0) {
                let target = targets.shift();
                await ns.exec(scripts.p.file, a.host, 1, target.host);
            }
        }
    } else {
        await ns.tprintf(`INFO: Attacking remaining hosts with at least ${formatMoney(ns, targetMoneyMin)} max money from "home"`);

        outer: for (const a of attackers) {
            const procs = await ns.ps(a.host);
            for (const p of procs) {
                if (p.filename === "fattack.js") {
                    await ns.tprint(p);
                    targets = targets.filter(t => t.host !== p.args[0]);
                    continue outer;
                }
            }
        }

        for (const t of targets) {
            await ns.exec(scripts.p.file, "home", 1, t.host);
        }
    }
}

export function getHostsDetails(ns, hosts, scripts) {
    const scriptsRam = ns.getScriptRam(scripts.p.file) +
        ns.getScriptRam(scripts.g.file) +
        ns.getScriptRam(scripts.h.file) +
        ns.getScriptRam(scripts.w.file);
    let hostsDetails = [];

    for (let host of hosts) {
        let server = ns.getServer(host),
            hostDetails = {
                "host": host,
                "maxRam": server.maxRam
            };

        if (host === "home") {
            hostDetails.maxRam -= getHomeRamReserved(ns);
        }

        if (hostDetails.maxRam < scriptsRam) {
            continue;
        }

        hostsDetails.push(hostDetails);
    }

    return hostsDetails;
}