/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
	//ns.tprint("First hackable host: " + targetUtil.getFirstHackableHost(ns).host);
	//ns.tprint("Last hackable host: " + targetUtil.getLastHackableHost(ns).host);
	//ns.tprint("Owned breach apps: " + breachUtil.countOwned(ns));
	//ns.tprint("My hacking level: " + ns.getHackingLevel());
	//ns.tprint("computek hacking level req: " + ns.getServerRequiredHackingLevel("computek"));
	/*
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(commonUtil.listHostsOwned(ns));
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(commonUtil.listHostsOther(ns));
	ns.tprint("--------------------------------------------------------------------------------");
	ns.tprint(commonUtil.getNextHostPurchasedName(ns));
	*/

    //tableUtil.renderTable(ns, targetUtil.getTargetDetails(ns, 'n00dles'));
    //let processes = commonUtil.findProcessByName(ns, commonUtil.getHackScript(ns));
    //tableUtil.renderTable(ns, processes);

    //let host = "syscore";
    //ns.tprint((processes !== null && processes.filter(p => p.args[0] === host).length > 0) ? "found" : "not found");

    //ns.tprint(commonUtil.listHosts(ns, "home", []));

    //commonUtil.showNotice(ns, "New target exists: fulcrumassets");

	//await ns.sleep(30000);

    /*
    let data = [81,105,127,119,101,173,148,155,33,81,156,162,76,83,54,19,83,186,78,39,168,191,139,74,141,120,96,20,145,143,98,143,117,2];
    let currAction = "buy";
    let totalProfit = 0;
    let bsChain = [];

    let i = 0, j = 0;
    while (i < data.length) {
        switch (currAction) {
            case "buy":
                i = findNextSmallestKey(ns, data, i);
                j = findNextBiggestKey(ns, data, i);
                if (i === j) {
                    // there is no more to buy/sell
                    i = data.length;
                    break;
                }
                totalProfit -= data[i];
                bsChain.push("buy: " + data[i] + "; calc: " + totalProfit);
                currAction = "sell";
                break;

            case "sell":
            default:
                i = findNextBiggestKey(ns, data, i);
                totalProfit += data[i];
                bsChain.push("sell: " + data[i] + "; calc: " + totalProfit);
                currAction = "buy";
        }
        i++;
    }
    totalProfit = (totalProfit > 0)
        ? totalProfit
        : 0;

    ns.tprint(bsChain);
    ns.tprint("Total profit: " + totalProfit);
    */

    ns.tprint(ns.getOwnedSourceFiles());
}

function findNextSmallestKey(ns, data, startFrom) {
    for (let i = startFrom; i < data.length - 1; i++) {
        if (data[i] < data[i + 1]) {
            return i;
        }
    }
    return startFrom;
}

function findNextBiggestKey(ns, data, startFrom) {
    for (let i = startFrom; i < data.length - 1; i++) {
        if (data[i] > data[i + 1]) {
            return i;
        }
    }
    return startFrom;
}

