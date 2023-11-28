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
        scripts = [
            {file: "fattack.js"},
            {file: "_fgrow.js"},
            {file: "_fhack.js"},
            {file: "_fweaken.js"}
        ],
        utils = ["util.common.js", "util.target.js"];
    let myhosts = listHostsOwned(ns, true, true),
        targets = list(ns, targetMoneyMin, 1).sort((a,b) => b.moneyMax - a.moneyMax),
        attackers = getHostsDetails(ns, myhosts, scripts).sort((a,b) => b.maxRam - a.maxRam);

    if (ns.kill("watcher.js", "home", "new", 1, 1)) {  // prevent auto-attack using old attack script
        if (ns.fileExists("attack.txt", "home")) {
            ns.rm("attack.txt");  // remove attack config file just in case
        }
        ns.exec("watcher.js", "home", 1, "new", 0, 1); // continue to watch for new hosts to breach
    }


    if (!attackRemaining) {
        myhosts.forEach(function (host) {
            for (let script of killScripts) {
                ns.scriptKill(script, host);
            }
        });

        attackers.forEach(function (a) {
            if (a.host !== "home") {
                for (let script of scripts) {
                    ns.scp(script.file, a.host);
                }

                for (let util of utils) {
                    ns.scp(util, a.host);
                }
            }

            if (targets.length > 0) {
                let target = targets.shift();
                ns.exec(scripts[0].file, a.host, 1, target.host);
            }
        });
    } else {
        ns.tprintf(`INFO: Attacking remaining hosts with at least ${formatMoney(ns, targetMoneyMin)} max money from "home"`);

        attackers.forEach(function (a) {
            const procs = ns.ps(a.host);
            procs.forEach(function (p) {
                if (p.filename === "fattack.js") {
                    targets = targets.filter(t => t.host !== p.args[0]);
                    return;
                }
            });
        });

        targets.forEach(function (t) {
            ns.exec(scripts[0].file, "home", 1, t.host);
        });
    }
}

function getHostsDetails(ns, hosts, scripts) {
    const scriptsRam = scripts.reduce((acc, curr) => acc + ns.getScriptRam(curr.file), 0);
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