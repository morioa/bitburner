import {
    formatMoney,
    getAttackScript,
    getHackScript,
    getHackScriptRamCost,
    getHostPurchasedPrefix,
    getLastAttackParams,
    getServerPurchaseScript,
    listHostsOwned
} from "./util.common.js";
import {getLastHackableHost} from "./util.target.js";
import {numberEqual} from "./util.is.js";
import {renderTable} from "./util.table.js";

const defaultRam = 2048;
const useAttackRamThreshold = 32;

/** @param {NS} ns */
export async function main(ns) {
    await ns.disableLog("ALL");
    await ns.enableLog("purchaseServer");

    const [a1 = "help", a2 = 0] = ns.args,
        attackScript = getAttackScript(ns),
        hackScript = getHackScript(ns),
        hackScriptRamCost = getHackScriptRamCost(ns),
        autoAttack = (!await ns.scriptRunning("fattack.js", "home")),
        owned = listHostsOwned(ns),
        costs = showServerPurchaseTable(ns, true);

    if (costs.length === 0) {
        await ns.tprintf(`WARNING: You have already purchased all servers with max RAM`);
        ns.exit();
    }

    let upgrade = (numberEqual(ns, a2, 1)),
        target = await getLastHackableHost(ns).host,
        ram = defaultRam;

    switch (ns.args[0]) {
        case "help":
            showHelp(ns);
            break;
        case "next":
            ram = costs.shift()["ram (in GB)"];
            upgrade = 1;
            break;
        case "max":
            ram = costs.pop()["ram (in GB)"];
            upgrade = 1;
            break;
        case "maxAff":
        case "maxaff":
            const ramMaxLv = (costs.filter(c => !c["cost for max"].includes("[[!"))).pop();
            if (ramMaxLv === undefined) {
                await ns.tprintf("ERROR: Insufficient funds to upgrade servers");
                ns.exit();
            }
            ram = ramMaxLv["ram (in GB)"];
            upgrade = 1;
            break;
        case "cost":
            showServerPurchaseTable(ns);
            break;
        default:
            if (isNaN(a1) || !isFinite(a1)) {
                await ns.tprint("Invalid argument");
                showHelp(ns);
            }
            ram = a1;
    }

    if (ram < hackScriptRamCost) {
        await ns.tprintf(`ERROR: New server must have at least ${hackScriptRamCost} RAM to run hack script`);
        ns.exit();
    }

    let i = 0,
        iPrev = i,
        action = "purchase",
        nsfTerminal = false;

    await ns.print(owned);

    while (i < await ns.getPurchasedServerLimit()) {
        let servers = await ns.getPurchasedServers(),
            hostname = getHostPurchasedPrefix(ns) + i,
            serverExists = (servers.includes(hostname));

        await ns.print(`Handling server '${hostname}'`);
        await ns.print(`Server '${hostname}' ${(serverExists) ? 'exists' : 'does not exist'}`);

        /*
        ns.tprintf(`server: ${hostname}`);
        ns.tprintf(`upgrade: ${upgrade}`);
        ns.tprintf(`curr ram: ${ns.getServerMaxRam(hostname)}`);
        ns.tprintf(`target ram: ${ram}`);
        */

        if (serverExists && (!upgrade || ns.getServerMaxRam(hostname) >= ram)) {
            // Skip if not upgrade and the server exists, or the server has equal
            // or more RAM than the upgrade order
            let msg = (!upgrade)
                ? `Server '${hostname}' already exists -- SKIPPING`
                : `Server '${hostname}' already has ${ram} RAM -- SKIPPING`;
            await ns.tprintf(`WARN: ${msg}`);
            ++i;
            continue;
        }

        let moneyAvail = await ns.getServerMoneyAvailable("home"),
            serverCost = (!upgrade || ns.getPurchasedServerUpgradeCost(hostname, ram) < 0)
                ? await ns.getPurchasedServerCost(ram)
                : await ns.getPurchasedServerUpgradeCost(hostname, ram),
            moneyAvailVerbose = formatMoney(ns, moneyAvail),
            serverCostVerbose = formatMoney(ns, serverCost);

        // Check if we have enough money to purchase a server
        if (moneyAvail > serverCost) {
            // If we have enough money, then:
            //  1. Purchase the server
            //  2. Copy our hacking script onto the newly-purchased server
            //  3. Run our hacking script on the newly-purchased server with n threads
            //  4. Increment our iterator to indicate that we've bought a new server
            if (upgrade && serverExists && autoAttack) {
                await ns.killall(hostname);
            }

            if (!serverExists) {
                await ns.tprintf(`INFO: Buying server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                await ns.purchaseServer(hostname, ram);
            } else {
                await ns.tprintf(`INFO: Upgrading server '${hostname}' with ${ram} RAM for ${serverCostVerbose}`);
                action = "upgrade";
                await ns.upgradePurchasedServer(hostname, ram);
            }

            if (autoAttack && ram < useAttackRamThreshold) {
                await ns.scp(hackScript, hostname);
                await ns.exec(hackScript, hostname, Math.floor(ram / getHackScriptRamCost(ns)), target);
            }
            nsfTerminal = false;
            ++i;
        } else {
            await ns.print(`Insufficient funds (${moneyAvailVerbose} / ${serverCostVerbose}) -- SLEEPING`);
            if (!nsfTerminal) {
                await ns.tprintf(`WARN: Insufficient funds to buy server '${hostname}' -- WAITING`);
                nsfTerminal = true;
            }
            if (iPrev !== i) {
                iPrev = i;
                if (autoAttack && ram >= useAttackRamThreshold) {
                    let ap = getLastAttackParams(ns);
                    await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
                }
            }
            await ns.sleep(10000);
        }
    }

    ns.tprintf(`Completed purchase of ${i} servers with ${ram} RAM`);

    if (autoAttack && ram >= useAttackRamThreshold) {
        let ap = getLastAttackParams(ns);
        await ns.run(attackScript, 1, ap.from, ap.model, ap.target);
    }
}

/** @param {NS} ns */
function showServerPurchaseTable(ns, returnOnly = false) {
    let maxServers = ns.getPurchasedServerLimit(),
        servers = ns.getPurchasedServers(),
        server = getHostPurchasedPrefix(ns) + (maxServers - 1),
        serverExists = (servers.includes(server)),
        maxRam = ns.getPurchasedServerMaxRam(),
        costs = [],
        moneyAvail = ns.getServerMoneyAvailable("home");
    for (let i = 1; Math.pow(2, i) <= maxRam; i++) {
        let ram = Math.pow(2, i),
            serverCostOne = (!serverExists) ? ns.getPurchasedServerCost(ram) : ns.getPurchasedServerUpgradeCost(server, ram),
            serverCostMax = serverCostOne * maxServers;
        if (serverCostOne < 0) {
            continue;
        }
        costs.push({
            "ram (in GB)": ram,
            "cost for one": (
                (moneyAvail < serverCostOne)
                    ? "[[!"
                    : ""
            ) + formatMoney(ns, serverCostOne),
            "cost for max": (
                (moneyAvail < serverCostMax)
                    ? "[[!"
                    : ""
            ) + formatMoney(ns, serverCostMax)
        });
    }

    if (returnOnly) {
        return costs;
    }

    renderTable(ns, "Server Costs", costs, true);
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

Usage:   run ${getServerPurchaseScript(ns)} [arg1] [arg2]

arg1     [optional] Can be the strings 'help' (to show this help),
         'cost' (to show the server purchase cost sheet), 'next' (to
         upgrade servers to the next higher amount of RAM), or it can
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
         run ${getServerPurchaseScript(ns)} help
 
    To show the server purchase cost sheet:
         run ${getServerPurchaseScript(ns)} cost
 
    To purchase any remaining servers with 1024 GB of RAM:
         run ${getServerPurchaseScript(ns)} 1024
 
    To upgrade all servers with less than 4096 GB of RAM:
         run ${getServerPurchaseScript(ns)} 4096 1
    `;
    ns.tprintf(output);
    ns.exit();
}
