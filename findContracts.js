/** @param {NS} ns */
import * as commonUtil from "./util.common.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";

export async function main(ns) {
    // list, read, data, tries, attempt
    let contracts = [];
    for (let host of targetUtil.list(ns)) {
        let hostContracts = ns.ls(host.host).filter(file => file.substr(-4) === ".cct");
        if (hostContracts.length > 0) {
            contracts.push({"host":host.host, "available contracts":hostContracts.toString().split(",")});
        }
    }

    tableUtil.renderTable(ns, "CONTRACTS", contracts, true);
    //ns.tprint(contracts);

    /*
    for (let [i,match] of Object.entries(contracts)) {
        for (let [j,contract] of Object.entries(match["available contracts"])) {
            let output = "\n" +
                "Host:  " + match["host"] + "\n" +
                "File:  " + contract + "\n";
                //"Type:  " + ns.getContractType(contract, match["host"]) + "\n" +
                //"Tries: " + ns.getNumTriesRemaining(contract, match["host"]) + "\n" +
                //"Desc:  " + ns.getContractDescription(contract, match["host"]) + "\n" +
                //"Data:  " + ns.getContractData(contract, match["host"]) + "\n\n";
            ns.tprintf(output);
        }
    }
    */
}