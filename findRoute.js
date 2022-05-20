/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
	/* TODO */
	let routes = [];

	tableUtil.renderTable(ns, "ROUTES", routes, true);
	//ns.tprint(routes);
}