/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

const defaultRam = 2048;

export async function main(ns) {
	let hackScript = commonUtil.getHackScript(ns);
	let target = targetUtil.getLastHackableHost(ns).host;
	let ram = defaultRam;
	let price, repurchase;

	if (ns.args[0] != undefined) {
		switch (ns.args[0]) {
			case "help":
				showHelp(ns);
				ns.exit();
				break;
			case "prices":
				showServerPurchaseTable(ns);
				ns.exit();
				break;
			default:
				ram = ns.args[0];
		}
	}

	repurchase = ns.args[1];
	repurchase = (repurchase == undefined 
	|| (repurchase.toString().toLowerCase() !== "true" 
	&& Number(repurchase) !== 1)) 
		? 0
		: 1;

	if (repurchase) {
		let servers = ns.getPurchasedServers();
		for (let server of servers) {
			if (ns.getServerMaxRam(server) >= ram) {
				// Only repurchase if the new server will have more RAM
				continue;
			}
			ns.killall(server);
			ns.deleteServer(server);
		}
	}

	let i = commonUtil.getNextHostPurchasedId(ns);

	while (i < ns.getPurchasedServerLimit()) {
		// Check if we have enough money to purchase a server
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
			// If we have enough money, then:
			//  1. Purchase the server
			//  2. Copy our hacking script onto the newly-purchased server
			//  3. Run our hacking script on the newly-purchased server with 3 threads
			//  4. Increment our iterator to indicate that we've bought a new server
			let hostname = ns.purchaseServer(commonUtil.getNextHostPurchasedName(ns), ram);
			await ns.scp(hackScript, hostname);
			ns.exec(hackScript, hostname, Math.floor(ram / commonUtil.getHackScriptRamCost(ns)), target);
			i++;
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
			"cost for one": commonUtil.formatMoney(ns, serverCostOne),
			"cost for max": commonUtil.formatMoney(ns, serverCostMax)
		});
	}

	tableUtil.renderTable(ns, "SERVER COSTS", costs, true);
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

	ns.tprint(output);
}
