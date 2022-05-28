/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

const nodesLimit = 30;
const nodeUpgradeLevelLimit = 199;
const nodeUpgradeRamLimit = 6;
const nodeUpgradeCoreLimit = 15;

export async function main(ns) {
    ns.disableLog("getServerMoneyAvailable");
    ns.disableLog("sleep");

    while (ns.hacknet.numNodes() < nodesLimit) {
        let cost = ns.hacknet.getPurchaseNodeCost();
        while (myMoney(ns) < cost) {
            ns.print("Need " + commonUtil.formatMoney(ns, cost) + " to buy a new node (" + commonUtil.formatMoney(ns, myMoney(ns)) + ")");
            await ns.sleep(5000);
        }
        ns.hacknet.purchaseNode();
    }

    let numNodes = ns.hacknet.numNodes();

    ns.tprintf("Hacknet nodes count: " + numNodes);

    ns.tprintf("Upgrading nodes [LEVEL => " + (nodeUpgradeLevelLimit + 1) + "]");
    for (let i = 0; i < numNodes; i++) {
        let cost = ns.hacknet.getLevelUpgradeCost(i, nodeUpgradeLevelLimit);
        if (!isFinite(cost)) {
            continue;
        }
        while (myMoney(ns) < cost) {
            ns.print("Need " + commonUtil.formatMoney(ns, cost) + " to fully upgrade node level (" + commonUtil.formatMoney(ns, myMoney(ns)) + ")");
            await ns.sleep(5000);
        }
        ns.hacknet.upgradeLevel(i, nodeUpgradeLevelLimit);
    }
    ns.tprintf("INFO: All nodes fully upgraded to max level");

    ns.tprintf("Upgrading nodes [RAM => " + Math.pow(2, nodeUpgradeRamLimit) + "]");
    for (let i = 0; i < numNodes; i++) {
        let cost = ns.hacknet.getRamUpgradeCost(i, nodeUpgradeRamLimit);
        if (!isFinite(cost)) {
            continue;
        }
        while (myMoney(ns) < cost) {
            ns.print("Need " + commonUtil.formatMoney(ns, cost) + " to fully upgrade node RAM (" + commonUtil.formatMoney(ns, myMoney(ns)) + ")");
            await ns.sleep(5000);
        }
        ns.hacknet.upgradeRam(i, nodeUpgradeRamLimit);
    }
    ns.tprintf("INFO: All nodes fully upgraded to max RAM");

    ns.tprintf("Upgrading nodes [CORES => " + (nodeUpgradeCoreLimit + 1) + "]");
    for (let i = 0; i < numNodes; i++) {
        let cost = ns.hacknet.getCoreUpgradeCost(i, nodeUpgradeCoreLimit);
        if (!isFinite(cost)) {
            continue;
        }
        while (myMoney(ns) < cost) {
            ns.print("Need " + commonUtil.formatMoney(ns, cost) + " to fully upgrade node cores (" + commonUtil.formatMoney(ns, myMoney(ns)) + ")");
            await ns.sleep(5000);
        }
        ns.hacknet.upgradeCore(i, nodeUpgradeCoreLimit);
    }
    ns.tprintf("INFO: All nodes fully upgraded to max cores");
}

function myMoney(ns) {
    return ns.getServerMoneyAvailable("home");
}