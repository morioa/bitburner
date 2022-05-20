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

    let hosts = ["home","n00dles","joesguns"];
    for (let host of hosts) {
        let matched = (commonUtil.listHostsOther(ns).indexOf(host) >= 0);
        ns.tprint("Host: '" + host + "' " + ((matched) ? "matched" : "not matched"));
    }

    //commonUtil.showNotice(ns, "New target exists: fulcrumassets");

	//await ns.sleep(30000);
}
