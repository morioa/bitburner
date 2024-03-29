import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";

const defaultRam = 2048;
const useAttackRamThreshold = 32;

/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("ALL");
    ns.enableLog("purchaseServer");

    const attackScript = commonUtil.getAttackScript(ns),
        hackScript = commonUtil.getHackScript(ns),
        hackScriptRamCost = commonUtil.getHackScriptRamCost(ns),
        autoAttack = (!ns.scriptRunning("fattack.js", "home"));

    let target = targetUtil.getLastHackableHost(ns).host,
        ram = defaultRam,
        upgrade;

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

    upgrade = (isUtil.numberEqual(ns, ns.args[1], 1));
    let owned = commonUtil.listHostsOwned(ns);
    ns.print(owned);

    let i = 0,
        iPrev = i,
        action = "purchase",
        nsfTerminal = false;
    while (i < ns.getPurchasedServerLimit()) {
        let servers = ns.getPurchasedServers(),
            hostname = commonUtil.getHostPurchasedPrefix(ns) + i,
            serverExists = (servers.includes(hostname));

        ns.print(`Handling server '${hostname}'`);
        ns.print(`Server '${hostname}' ${(serverExists) ? 'exists' : 'does not exist'}`);

        if (serverExists && (!upgrade || ns.getServerMaxRam(hostname) >= ram)) {
            // Skip if not upgrade and the server exists, or the server has equal
            // or more RAM than the upgrade order
            let msg = (!upgrade)
                ? `Server '${hostname}' already exists -- SKIPPING`
                : `Server '${hostname}' already has ${ram} RAM -- SKIPPING`;
            ns.tprint(msg);
            ++i;
            continue;
        }

        let moneyAvail = ns.getServerMoneyAvailable("home"),
            moneyAvailVerbose = commonUtil.formatNumber(ns, moneyAvail, "shorthand", true),
            serverCost = (!upgrade)
                ? ns.getPurchasedServerCost(ram)
                : ns.getPurchasedServerUpgradeCost(hostname, ram),
            serverCostVerbose = commonUtil.formatNumber(ns, serverCost, "shorthand", true);

        // Check if we have enough money to purchase a server
        if (moneyAvail > serverCost) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with n threads
            //  4. Increment our iterator to indicate that we've bought a new server
            if (upgrade && serverExists && autoAttack) {
                ns.killall(hostname);
            }

            if (!serverExists) {
                ns.tprint(`Buying server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                ns.purchaseServer(hostname, ram);
            } else {
                ns.tprint(`Upgrading server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                action = "upgrade";
                ns.upgradePurchasedServer(hostname, ram);
            }

            if (autoAttack && ram < useAttackRamThreshold) {
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
            if (iPrev !== i) {
                iPrev = i;
                if (autoAttack && ram >= useAttackRamThreshold) {
                    let ap = commonUtil.getLastAttackParams(ns);
                    await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
                }
            }
            await ns.sleep(10000);
        }
    }

    ns.tprint(`Completed purchase of ${i} servers with ${ram} RAM`);

    if (autoAttack && ram >= useAttackRamThreshold) {
        let ap = commonUtil.getLastAttackParams(ns);
        await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
    }
}

/** @param {NS} ns */
function showServerPurchaseTable(ns) {
    let maxServers = ns.getPurchasedServerLimit(),
        servers = ns.getPurchasedServers(),
        server = commonUtil.getHostPurchasedPrefix(ns) + (maxServers - 1),
        serverExists = (servers.includes(server)),
        maxRam = ns.getPurchasedServerMaxRam(),
        costs = [];
    for (let i = 1; Math.pow(2, i) <= maxRam; i++) {
        let ram = Math.pow(2, i),
            serverCostOne = (!serverExists) ? ns.getPurchasedServerCost(ram) : ns.getPurchasedServerUpgradeCost(server, ram),
            serverCostMax = serverCostOne * maxServers;
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

export function autocomplete(data, args) {
    return ["help","cost",524288,1048576];
}

/** @param {NS} ns */
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
         upgrade all servers to have the amount of RAM passed
         for arg1. The upgrade action will only be acted upon for
         servers that have less RAM than what is passed for arg1.
 
Examples:

    To show this help:
         run ${commonUtil.getServerPurchaseScript(ns)} help
 
    To show the server purchase cost sheet:
         run ${commonUtil.getServerPurchaseScript(ns)} cost
 
    To purchase any remaining servers with 1024 GB of RAM:
         run ${commonUtil.getServerPurchaseScript(ns)} 1024
 
    To upgrade all servers with less than 4096 GB of RAM:
         run ${commonUtil.getServerPurchaseScript(ns)} 4096 1
    `;
    ns.tprintf(output);
    ns.exit();
}
