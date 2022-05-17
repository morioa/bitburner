/** @param {NS} ns */
import * as common from "./util.common.js";
import * as targets from "./util.targets.js";

export async function main(ns) {
	let hackScript = common.getHackScript(ns);
	let target = targets.getLastHackableHost(ns).host;

	let ramDefault = 2048;
	let ram = ns.args[0];
	if (ram == undefined) {
		ram = ramDefault;
	}

	let repurchase = ns.args[1];
	repurchase = (repurchase == undefined 
	|| (repurchase.toString().toLowerCase() !== "true" 
	&& Number(repurchase) !== 1)) 
		? 0
		: 1;

	if (repurchase) {
		let servers = ns.getPurchasedServers();
		for (var key in servers) {
			if (ns.getServerMaxRam(servers[key]) >= ram) {
				continue;
			}
			ns.killall(servers[key]);
			ns.deleteServer(servers[key]);
		}
	}

	let i = common.getNextHostPurchasedId(ns);

	while (i < ns.getPurchasedServerLimit()) {
		// Check if we have enough money to purchase a server
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
			// If we have enough money, then:
			//  1. Purchase the server
			//  2. Copy our hacking script onto the newly-purchased server
			//  3. Run our hacking script on the newly-purchased server with 3 threads
			//  4. Increment our iterator to indicate that we've bought a new server
			let hostname = ns.purchaseServer(common.getNextHostPurchasedName(ns), ram);
			await ns.scp(hackScript, hostname);
			ns.exec(hackScript, hostname, Math.floor(ram / common.getHackScriptRamCost(ns)), target);
			i++;
		} else {
			await ns.sleep(10000);
		}
	}
}