/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";

export async function main(ns) {
	// launch first attack wave
	ns.run(commonUtil.getAttackScript(ns), 4, 2, 0);

	// start the watcher
	ns.run(commonUtil.getWatcherScript(ns));

	// run purchase script to purchase scripts
	ns.run(commonUtil.getScriptsPurchaseScript(ns));

	// run purchase script to purchase servers
	// uncomment this if in early game where you do not gain
	// funds quickly, otherwise later in the game it's best
	// to wait to buy the servers until we have purchased
	// all scripts from the darkweb -- it's easily affordable
	// and will yield a LOT more attackable targets quickly
	//ns.run(commonUtil.getServerPurchaseScript(ns));
}
