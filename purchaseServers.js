/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";

const defaultRam = 2048;

export async function main(ns) {
    ns.disableLog("ALL");
    ns.enableLog("purchaseServer");

    let hackScript = commonUtil.getHackScript(ns);
    let target = targetUtil.getLastHackableHost(ns).host;
    let ram = defaultRam;
    let price, repurchase;

    if (ns.args[0] != undefined) {
        switch (ns.args[0]) {
            case "help":
                showHelp(ns);
                break;
            case "prices":
                showServerPurchaseTable(ns);
                break;
            default:
                if (isNaN(ns.args[0]) || !isFinite(ns.args[0])) {
                    ns.tprint("Invalid argument");
                    showHelp(ns);
                }
                ram = ns.args[0];
        }
    }

    repurchase = (isUtil.numberEqual(ns, ns.args[1], 1));

    let i = 0;
    while (i < ns.getPurchasedServerLimit()) {
        let servers = ns.getPurchasedServers();
        let server = commonUtil.getHostPurchasedPrefix(ns) + i;
        let serverExists = (servers.includes(server));

        if ((!repurchase && serverExists) ||
            (repurchase && ns.getServerMaxRam(server) >= ram)) {
            // Skip if not repurchase and the server exists, or the server has equal
            // or more RAM than the repurchase order
            ++i;
            continue;
        }

        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with 3 threads
            //  4. Increment our iterator to indicate that we've bought a new server
            if (repurchase && serverExists) {
                ns.killall(server);
                ns.deleteServer(server);
            }

            let hostname = ns.purchaseServer(server, ram);
            await ns.scp(hackScript, hostname);
            ns.exec(hackScript, hostname, Math.floor(ram / commonUtil.getHackScriptRamCost(ns)), target);
            ++i;
        } else {
            await ns.sleep(10000);
        }
    }
}

function showServerPurchaseTable(ns) {
    let maxRam = ns.getPurchasedServerMaxRam();
    let maxServers = ns.getPurchasedServerLimit();
    let costs = [];
    for (let i = 1; Math.pow(2, i) <= maxRam; i++) {
        let ram = Math.pow(2, i);
        let serverCostOne = ns.getPurchasedServerCost(ram);
        let serverCostMax = serverCostOne * maxServers;
        costs.push({
            "ram (in GB)": ram,
            "cost for one": commonUtil.formatNumber(ns, serverCostOne, "shorthand", true),
            "cost for max": commonUtil.formatNumber(ns, serverCostMax, "shorthand", true)
        });
    }

    tableUtil.renderTable(ns, "SERVER COSTS", costs, true);
    ns.exit();
}

function showHelp(ns) {
    let output = "\n\n" +
        "Usage:   run " + commonUtil.getServerPurchaseScript(ns) + " [arg1] [arg2]\n\n" +
        "arg1     [optional] Can be the strings 'help' (to show this help)\n" +
        "         or 'prices' (to show the server purchase price sheet), or\n" +
        "         it can be a numeric value for the amount of RAM per server\n" +
        "         that will be purchased (must be a power of 2... eg. 2, 8,\n" +
        "         16, 1024... 2^20 = 1048576 max). Default " + defaultRam + " RAM if not\n" +
        "         passed.\n\n" +
        "         NOTE: A value for arg1 MUST be passed if a value of arg2 is\n" +
        "         passed.\n\n" +
        "arg2     [optional] [Boolean] Can be '1' or 'true' to flag for the\n" +
        "         repurchase all servers to have the amount of RAM passed\n" +
        "         for arg1. The repurchase action will only be acted upon for\n" +
        "         servers that have less RAM than what is passed for arg1.\n\n" +
        "Examples:\n\n" +
        "    To show this help:\n" +
        "         run " + commonUtil.getServerPurchaseScript(ns) + " help\n\n" +
        "    To show the server purchase price sheet:\n" +
        "         run " + commonUtil.getServerPurchaseScript(ns) + " prices\n\n" +
        "    To purchase any remaining servers with 1024 GB of RAM:\n" +
        "         run " + commonUtil.getServerPurchaseScript(ns) + " 1024\n\n" +
        "    To repurchase all servers with less than 4096 GB of RAM:\n" +
        "         run " + commonUtil.getServerPurchaseScript(ns) + " 4096 1\n\n";

    ns.tprintf(output);
    ns.exit();
}
