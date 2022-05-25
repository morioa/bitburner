/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as isUtil from "./util.is.js"

export async function main(ns) {
	let moneyThresh = (isUtil.numberValid(ns, ns.args[0]))
		? ns.args[0]
		: 1;

	// start the watcher
	ns.run(commonUtil.getWatcherScript(ns), 1, "new", 1, moneyThresh);
	// This tells the watcher to auto-attack when ----^
	// a new target is found, so that is why the launch
	// of the first attack wave below is commented out,
	// as there is no need to trigger it as the watcher
	// will handle it automatically. If you do not want
	// the watcher to handle it automatically, then
	// remove the last argument and uncomment the
	// launch of the first attack below or run attacks
	// manually via the Terminal.

	// launch first attack wave
	//ns.run(commonUtil.getAttackScript(ns), 1, 4, 2, 0);

	// purchase scripts
	ns.run(commonUtil.getScriptsPurchaseScript(ns));

	// purchase servers
	// Uncomment this if in early game where you do not
	// gain funds quickly, otherwise later in the game
	// it's best to wait to buy the servers until we
	// have purchased all scripts from the darkweb --
	// it's easily affordable and will yield a LOT more
	// attackable targets quickly.
	//ns.run(commonUtil.getServerPurchaseScript(ns));
}
