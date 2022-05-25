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
    let contract = contracts[0];
    ns.tprint(contract);

    let contractFile = contract["contracts"][0];
    let output = "\n\n" +
        "Contract file: " + contractFile + "\n" +
        "Contract type: " + ns.getContractType(contractFile, contract["host"]) + "\n" +
        "Contract remaining tries: " + ns.getNumTriesRemaining(contractFile, contract["host"]) + "\n" +
        "Contract description: " + ns.getContractDescription(contractFile, contract["host"]) + "\n" +
        "Contract data: " + ns.getContractData(contractFile, contract["host"]) + "\n\n";
    ns.tprint(output);
    */
}