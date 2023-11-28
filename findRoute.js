/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
    let [host = null] = ns.args,
        routes = commonUtil.listHostsConnections(ns, host);

    await tableUtil.renderTable(ns, "ROUTES", routes, true);
}