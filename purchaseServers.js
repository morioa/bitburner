/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";

const defaultRam = 2048;
const useAttackRamThreshold = 32;

export async function main(ns) {
    ns.disableLog("ALL");
    ns.enableLog("purchaseServer");

    const attackScript = commonUtil.getAttackScript(ns);
    const hackScript = commonUtil.getHackScript(ns);
    const hackScriptRamCost = commonUtil.getHackScriptRamCost(ns);

    let target = targetUtil.getLastHackableHost(ns).host;
    let ram = defaultRam;
    let repurchase;

    if (ns.args[0] != undefined) {
        switch (ns.args[0]) {
            case "help":
                showHelp(ns);
                break;
            case "cost":
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

    if (ram < hackScriptRamCost) {
        ns.tprint(`New server must have at least ${hackScriptRamCost} RAM to run hack script`);
        ns.exit();
    }

    repurchase = (isUtil.numberEqual(ns, ns.args[1], 1));
    let owned = commonUtil.listHostsOwned(ns);
    ns.print(owned);

    let i = 0;
    let iPrev = i;
    let action = "purchase";
    let nsfTerminal = false;
    while (i < ns.getPurchasedServerLimit()) {
        let servers = ns.getPurchasedServers();
        let hostname = commonUtil.getHostPurchasedPrefix(ns) + i;
        let serverExists = (servers.includes(hostname));

        ns.print(`Handling server '${hostname}'`);
        ns.print(`Server '${hostname}' ${(serverExists) ? 'exists' : 'does not exist'}`);

        if (serverExists && (!repurchase || ns.getServerMaxRam(hostname) >= ram)) {
            // Skip if not repurchase and the server exists, or the server has equal
            // or more RAM than the repurchase order
            let msg = (!repurchase)
                ? `Server '${hostname}' already exists -- SKIPPING`
                : `Server '${hostname}' already has ${ram} RAM -- SKIPPING`;
            ns.tprint(msg);
            ++i;
            continue;
        }

        let moneyAvail = ns.getServerMoneyAvailable("home");
        let moneyAvailVerbose = commonUtil.formatNumber(ns, moneyAvail, "shorthand", true);
        let serverCost = (!repurchase)
            ? ns.getPurchasedServerCost(ram)
            : ns.getPurchasedServerUpgradeCost(hostname, ram);
        let serverCostVerbose = commonUtil.formatNumber(ns, serverCost, "shorthand", true);

        // Check if we have enough money to purchase a server
        if (moneyAvail > serverCost) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with n threads
            //  4. Increment our iterator to indicate that we've bought a new server
            if (repurchase && serverExists) {
                ns.killall(hostname);
                //ns.deleteServer(hostname);
            }

            if (!serverExists) {
                ns.tprint(`Buying server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                ns.purchaseServer(hostname, ram);
            } else {
                ns.tprint(`Upgrading server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                action = "upgrade";
                ns.upgradePurchasedServer(hostname, ram);
            }

            if (ram < useAttackRamThreshold) {
                await ns.scp(hackScript, hostname);
                ns.exec(hackScript, hostname, Math.floor(ram / commonUtil.getHackScriptRamCost(ns)), target);
            }
            nsfTerminal = false;
            ++i;
        } else {
            ns.print(`Insufficient funds (${moneyAvailVerbose} / ${serverCostVerbose}) -- SLEEPING`);
            if (!nsfTerminal) {
                ns.tprint(`Insufficient funds to buy server '${hostname}' -- WAITING`);
                nsfTerminal = true;
            }
            if (iPrev !== i && ram >= useAttackRamThreshold) {
                iPrev = i;
                let ap = commonUtil.getLastAttackParams(ns);
                await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
            }
            await ns.sleep(10000);
        }
    }

    ns.tprint(`Completed purchase of ${i} servers with ${ram} RAM`);

    if (ram >= useAttackRamThreshold) {
        let ap = commonUtil.getLastAttackParams(ns);
        await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
    }
}

function showServerPurchaseTable(ns) {
    let servers = ns.getPurchasedServers();
    let server = commonUtil.getHostPurchasedPrefix(ns) + 24;
    let serverExists = (servers.includes(server));
    let maxRam = ns.getPurchasedServerMaxRam();
    let maxServers = ns.getPurchasedServerLimit();
    let costs = [];
    for (let i = 1; Math.pow(2, i) <= maxRam; i++) {
        let ram = Math.pow(2, i);
        let serverCostOne = (!serverExists) ? ns.getPurchasedServerCost(ram) : ns.getPurchasedServerUpgradeCost(server, ram);
        let serverCostMax = serverCostOne * maxServers;
        if (serverCostOne < 0) {
            continue;
        }
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
    let output = `
This script will allow you to display a cost breakdown of servers by
amount of RAM or to purchase the max number of servers (${ns.getPurchasedServerLimit()}) with the
requested amount of RAM. If there are insufficient funds to cover the
cost when purchasing, the script will continue to run in the background
until the necessary funds exist and all servers have been purchased.

Usage:   run ${commonUtil.getServerPurchaseScript(ns)} [arg1] [arg2]

arg1     [optional] Can be the strings 'help' (to show this help) or
         'cost' (to show the server purchase cost sheet), or it can
         be a numeric value for the amount of RAM per server that will
         be purchased (must be a power of 2... eg. 2, 8, 16, 1024...
         2^20 = 1048576 max). Default ${defaultRam} RAM if not passed.
 
         NOTE: A value for arg1 MUST be passed if a value of arg2 is
         passed.
 
arg2     [optional] [Boolean] Can be '1' or 'true' to flag for the
         repurchase all servers to have the amount of RAM passed
         for arg1. The repurchase action will only be acted upon for
         servers that have less RAM than what is passed for arg1.
 
Examples:

    To show this help:
         run ${commonUtil.getServerPurchaseScript(ns)} help
 
    To show the server purchase cost sheet:
         run ${commonUtil.getServerPurchaseScript(ns)} cost
 
    To purchase any remaining servers with 1024 GB of RAM:
         run ${commonUtil.getServerPurchaseScript(ns)} 1024
 
    To repurchase all servers with less than 4096 GB of RAM:
         run ${commonUtil.getServerPurchaseScript(ns)} 4096 1
    `;
    ns.tprintf(output);
    ns.exit();
}
