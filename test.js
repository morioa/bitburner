/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";
import {getRandomIntInclusive} from "./util.common.js";

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

    //ns.tprint(ns.getOwnedSourceFiles());

    /*
    let entityType = "faction";
    let getRep = {
        company: getCompanyRep,
        faction: getFactionRep
    };
    getRep[entityType](ns);
    */

    /*
    let algos = {
        consolidated: [
            {file: "_chesterTheMolester.js", weight: 1.0}
        ],
        loop: [
            {file: "_grow.js", weight: 0.77},
            {file: "_hack.js", weight: 0.08},
            {file: "_weaken.js", weight: 0.15}
        ]
    };
    let algoType = "loop";
    let algo = algos[algoType];
    */

    //ns.tprint(ns.getScriptRam(algo[0].file));
    /*
    for (let file of algo.map(x => x.file)) {
        ns.tprint(file);
    }
    algo.sort((a,b) => a.weight - b.weight);
    */

    /*
    for (const [i,script] of Object.entries(algo)) {
        //ns.tprint(`${i}: ${script.file}`);
        //ns.tprint(isUtil.numberEqual(ns, i, algo.length - 1));
        ns.tprint(`${i} : ${Object.entries(algo).length - 1}`);
    }

    //ns.tprint(algo.reduce((acc, curr) => (acc > ns.getScriptRam(curr.file)) ? acc : ns.getScriptRam(curr.file), 0));

    for (let [k, script] of Object.entries(algos)) {
        for (let file of script.map(x => x.file)) {
            ns.tprint("File: " + file);
        }
    }
    */

    /*
    const tableChars = {
        tlc: "╔",
        trc: "╗",
        blc: "",
        brc: "",
        ti:  "",
        li:  "╠",
        mi:  "",
        ri:  "",
        bi:  "",
        hl:  "═",
        vl:  "║",
        s:   " "
    };

    const output = "\n\n" +
        tlCornerChar + horizLineChar.repeat(4) + trCornerChar + "\n" +
        vertLineChar + spaceChar.repeat(4) + vertLineChar + "\n" +
        vertLineChar + spaceChar.repeat(4) + vertLineChar + "\n" +
        blCornerChar + horizLineChar.repeat(4) + brCornerChar + "\n\n";
    ns.tprint(output);
    */

    /*
    let hosts = targetUtil.list(ns);
    for (const [i, host] of Object.entries(hosts.filter(h => !h.hasRootAccess))) {
        ns.tprint(i,":",host.host);
    }

    for (const [i, host] of Object.entries(hosts)) {
        ns.tprint(i,":",host.host);
    }
    */

    //ns.tprint(targetUtil.getUnbreachedHosts(ns));

    /*
    let mountains = [
        { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
        { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
        { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
        { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
        { name: "Monte Amiata", height: 1738, place: "Siena" }
    ];

    let doc = eval("document");
    let table = doc.querySelector("table");
    let data = Object.keys(mountains[0]);
    generateTable(doc, table, mountains);
    generateTableHead(doc, table, data);
    */

    /*
    const output = "WARN:\n\n" +
        "==[NOTICE]=================================\n" +
        ">>>  Target money reached: $16,000,000  <<<\n" +
        "===========================================\n\n";
    ns.tprintf(output);
    */

    //beep(ns);
    //ns.run("play.js", 1, "drip");

    let workingElemId = commonUtil.working(ns);
    await ns.sleep(2000);
    commonUtil.working(ns, workingElemId);
}

function generateTableHead(doc, table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = doc.createElement("th");
        let text = doc.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(doc, table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (let key in element) {
            let cell = row.insertCell();
            let text = doc.createTextNode(element[key]);
            cell.appendChild(text);
        }
    }
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

function getCompanyRep(ns) {
    ns.tprint("Called getCompanyRep");
}

function getFactionRep(ns) {
    ns.tprint("Called getFactionRep");
}
