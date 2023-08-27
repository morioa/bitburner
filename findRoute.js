/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
    let host = ns.args[0];
    if (host == undefined) {
        host = null;
    }
    let routes = commonUtil.listHostsConnections(ns, host);

    await tableUtil.renderTable(ns, "ROUTES", routes, true);
    //ns.tprint(routes);
}