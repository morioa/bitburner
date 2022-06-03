/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
import * as breachUtil from "./util.breach.js";
import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import * as isUtil from "./util.is.js";
import {getRandomIntInclusive} from "./util.common.js";

export async function main(ns) {
    /*
    let data = [70,100,5,198,50,29,180,162,39,187,145,48,51,35];
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

    /*
    const tableChars = {
        tlc: "╔", ti:  "╦", trc: "╗",
        li:  "╠", mi:  "╬", ri:  "╣",
        blc: "╚", bi:  "╩", brc: "╝",
        hl:  "═", vl:  "║", s:   " "
    };

    const output = "\n\n" +
        tlCornerChar + horizLineChar.repeat(4) + trCornerChar + "\n" +
        vertLineChar + spaceChar.repeat(4) + vertLineChar + "\n" +
        vertLineChar + spaceChar.repeat(4) + vertLineChar + "\n" +
        blCornerChar + horizLineChar.repeat(4) + brCornerChar + "\n\n";
    ns.tprint(output);
    */

    /*
    let output = "WARN:\n\n" +
        "+---------+\n" +
        "| TARGETS |\n" +
        "+----------+--------------+--------------+---------------+------------------+---------------+--------+--------------+--------------+\n" +
        "| HOST     | MONEYMAX     | MONEYAVAIL   | SECURITYLEVEL | SECURITYLEVELMIN | HASROOTACCESS | MAXRAM | HACKLEVELREQ | PORTSOPENREQ |\n" +
        "+----------+--------------+--------------+---------------+------------------+---------------+--------+--------------+--------------+\n" +
        "| ecorp    | 149975329800 |  85725918471 |            50 |               33 | true          |      0 |         1117 |            5 |\n" +
        "| megacorp | 167686662442 | 121232588853 |            67 |               33 | true          |      0 |         1219 |            5 |\n" +
        "| ecorp    | 149975329800 |  85725918471 |            50 |               33 | true          |      0 |         1117 |            5 |\n" +
        "| megacorp | 167686662442 | 121232588853 |            67 |               33 | true          |      0 |         1219 |            5 |\n" +
        "| ecorp    | 149975329800 |  85725918471 |            50 |               33 | true          |      0 |         1117 |            5 |\n" +
        "| megacorp | 167686662442 | 121232588853 |            67 |               33 | true          |      0 |         1219 |            5 |\n" +
        "| ecorp    | 149975329800 |  85725918471 |            50 |               33 | true          |      0 |         1117 |            5 |\n" +
        "| megacorp | 167686662442 | 121232588853 |            67 |               33 | true          |      0 |         1219 |            5 |\n" +
        "+----------+--------------+--------------+---------------+------------------+---------------+--------+--------------+--------------+\n\n\n";
    ns.tprintf(output);

    output = "WARN:\n\n" +
        "╔═════════╗\n" +
        "║ TARGETS ║\n" +
        "╠═════════╩╦══════════════╦══════════════╦═══════════════╦══════════════════╦═══════════════╦════════╦══════════════╦══════════════╗\n" +
        "║ HOST     ║ MONEYMAX     ║ MONEYAVAIL   ║ SECURITYLEVEL ║ SECURITYLEVELMIN ║ HASROOTACCESS ║ MAXRAM ║ HACKLEVELREQ ║ PORTSOPENREQ ║\n" +
        "╠══════════╬══════════════╬══════════════╬═══════════════╬══════════════════╬═══════════════╬════════╬══════════════╬══════════════╣\n" +
        "║ ecorp    ║ 149975329800 ║  85725918471 ║            50 ║               33 ║ true          ║      0 ║         1117 ║            5 ║\n" +
        "║ megacorp ║ 167686662442 ║ 121232588853 ║            67 ║               33 ║ true          ║      0 ║         1219 ║            5 ║\n" +
        "║ ecorp    ║ 149975329800 ║  85725918471 ║            50 ║               33 ║ true          ║      0 ║         1117 ║            5 ║\n" +
        "║ megacorp ║ 167686662442 ║ 121232588853 ║            67 ║               33 ║ true          ║      0 ║         1219 ║            5 ║\n" +
        "║ ecorp    ║ 149975329800 ║  85725918471 ║            50 ║               33 ║ true          ║      0 ║         1117 ║            5 ║\n" +
        "║ megacorp ║ 167686662442 ║ 121232588853 ║            67 ║               33 ║ true          ║      0 ║         1219 ║            5 ║\n" +
        "║ ecorp    ║ 149975329800 ║  85725918471 ║            50 ║               33 ║ true          ║      0 ║         1117 ║            5 ║\n" +
        "║ megacorp ║ 167686662442 ║ 121232588853 ║            67 ║               33 ║ true          ║      0 ║         1219 ║            5 ║\n" +
        "╚══════════╩══════════════╩══════════════╩═══════════════╩══════════════════╩═══════════════╩════════╩══════════════╩══════════════╝\n";
    ns.tprintf(output);
    */

    /*
    let mountains = [
        { name: "Monte Falco", height: 1658, place: "Parco Foreste Casentinesi" },
        { name: "Monte Falterona", height: 1654, place: "Parco Foreste Casentinesi" },
        { name: "Poggio Scali", height: 1520, place: "Parco Foreste Casentinesi" },
        { name: "Pratomagno", height: 1592, place: "Parco Foreste Casentinesi" },
        { name: "Monte Amiata", height: 1738, place: "Siena" }
    ];
    tableUtil.renderTable(ns, "mountains", mountains, 1);

    await ns.sleep(100);

    let doc = eval("document");
    let term = doc.getElementById("terminal");
    let elemId = "custom_elem_" + getRandomIntInclusive(ns, 0,9999);

    term.insertAdjacentHTML("beforeend", "<table id='" + elemId + "' class='jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz' style='border: 1px solid #FFFF00; border-collapse: collapse;'></table>");

    let table = doc.getElementById(elemId);
    let data = Object.keys(mountains[0]);

    generateTable(doc, table, mountains);
    generateTableHead(doc, table, data);
    doc.getElementById(elemId).scrollIntoView();
    */

    /*
    let doc = eval("document");
    let term = doc.getElementById("terminal");
    ns.tprint(term.tagName);
    */

    ns.tprint(ns);

    //ns.tprint(commonUtil.formatNumber(ns, ns.args[0], ns.args[1], ns.args[2]));

    /*
    const allTargets = targetUtil.list(ns, 0, 1);
    tableUtil.renderTable(
        ns,
        "TARGETS",
        commonUtil.formatNumberArrayOfObjectsColumns(
            ns,
            allTargets,
            ["moneyMax","moneyAvail"],
            "shorthand",
            true),
        true
    );
    */

    /*
    let hosts = commonUtil.listHosts(ns, "home", []);
    let servers = [];
    let reportCols = ["hostname","hasAdminRights","backdoorInstalled"];
    hosts.forEach(host => {
        let server = ns.getServer(host);
        if (server.purchasedByPlayer) {
            return;
        }

        let reported = {};
        Object.keys(server).filter(prop => {
            if (reportCols.includes(prop)) {
                reported[prop] = server[prop];
            }
        })
        reported = Object.assign({"hostname":null}, reported);
        servers.push(reported);
        //servers.push(server);
    });

    //ns.tprint(servers);
    tableUtil.renderTable(ns, "servers", servers, 1);
    */
}

function generateTableHead(doc, table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = doc.createElement("th");
        th.className = 'jss16653 MuiTypography-root MuiTypography-body1';
        th.style.border = '1px solid #FFFF00';
        th.style.padding = '1px 6px';
        th.style.color = '#FFFF00';
        th.style.textAlign = 'left';
        let text = doc.createTextNode(key.toUpperCase());
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(doc, table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (let key in element) {
            let cell = row.insertCell();
            cell.className = 'jss16653 MuiTypography-root MuiTypography-body1';
            //cell.style.border = '1px solid #FFFF44';
            cell.style.borderWidth = '0 1px';
            cell.style.borderStyle = 'solid';
            cell.style.borderColor = '#FFFF00';
            cell.style.padding = '0 6px';
            cell.style.color = '#FFFF00';
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
