/** @param {NS} ns **/
import * as commonUtil from "./util.common.js";
//import * as breachUtil from "./util.breach.js";
//import * as targetUtil from "./util.target.js";
import * as tableUtil from "./util.table.js";
import {
    formatNumber,
    getHomeRamReserved,
    getWatcherScript,
    listHosts,
    listHostsConnections,
    listHostsOwned
} from "./util.common";
import {list} from "./util.target";
import {renderTable} from "./util.table.js";
//import * as isUtil from "./util.is.js";
//import {getRandomIntInclusive} from "./util.common.js";

export async function main(ns) {

    const work = await ns.singularity.getCurrentWork();
    await ns.tprint(work);
    const graftingTime = await ns.grafting.getAugmentationGraftTime("BLADE-51b Tesla Armor: IPU Upgrade");
    await ns.tprint(graftingTime);
    await ns.tprint(graftingTime - (work.cyclesWorked * 200));


    /*
    const gi = ns.gang.getGangInformation(),
        ogi = ns.gang.getOtherGangInformation(),
        gotoWarThreshold = 0.95;
    await ns.tprint(gi);
    await ns.tprint(ogi);

    for (const [k,v] of Object.entries(ogi)) {
        await ns.tprint(k);
        await ns.tprint(await ns.gang.getChanceToWinClash(k));
    }
    */

    /*

    {
        "Slum Snakes":{
            "power":2008.8030977444037,
            "territory":0.1428571428571459
        },
        "Tetrads":{
            "power":5745.115912717831,
            "territory":0
        },
        "The Syndicate":{
            "power":5854.467652261293,
            "territory":0
        },
        "The Dark Army":{
            "power":5787.278469816288,
            "territory":0
        },
        "Speakers for the Dead":{
            "power":3938.454423421231,
            "territory":0
        },
        "NiteSec":{
            "power":5683.584972820967,
            "territory":0
        },
        "The Black Hand":{
            "power":19067.257791915723,
            "territory":0.8571428571428541
        }
    }

    */

    /*
    await ns.tprint("INFO: Testing");

    const [ramPct = 50] = ns.args,
        hostRamReserved = getHomeRamReserved(ns),
        hostRamMax = await ns.getServerMaxRam("home"),
        hostRamUsed = await ns.getServerUsedRam("home"),
        hostRamAvail = hostRamMax - hostRamReserved - hostRamUsed,
        scriptRam = await ns.getScriptRam("stanek.js"),
        threads = Math.floor((hostRamAvail / scriptRam) * (ramPct / 100));

    await ns.tprint(`WARN:    RAM Pct: ${ramPct}`);
    await ns.tprint(`WARN:  Ram Avail: ${hostRamAvail}`);
    await ns.tprint(`WARN: Script RAM: ${scriptRam}`);
    await ns.tprint(`WARN:    Threads: ${threads}`);
    */

    /*
    await ns.tprint(Object.getOwnPropertyNames(this));
    const t = this;

    let methods = Object.getOwnPropertyNames(t).filter(function (p) {
        return (typeof t[p] === "function" && !["main","autocomplete"].includes(p));
    });

    await ns.tprint(methods);
    */

    /*
    const frags = ns.stanek.activeFragments();
    await ns.tprint(frags);
    for (const f of frags) {
        if (f.limit > 1) {
            await ns.tprintf(`Fragment ${f.id} cannot be charged -- SKIPPING`);
            continue;
        }

        ns.tprintf(`INFO: Charging fragment ${f.id}`);
        await ns.stanek.chargeFragment(f.x, f.y);

        const fc = await ns.stanek.getFragment(f.x, f.y);

        ns.tprintf(`INFO: ... now has ${fc.numCharge} charge(s)`);
    }
    */

    /*
    const karmaRaw = ns.heart.break();
    let karma = (karmaRaw < 0)
        ? Math.ceil(karmaRaw)
        : (karmaRaw > 0)
            ? Math.floor(karmaRaw)
            : karmaRaw;

    await ns.tprintf(karmaRaw);
    await ns.tprintf(karma);

    await ns.tprint(ns.getPurchasedServers());
    */

    //ns.tprint(ns.getBitNodeMultipliers());

    /*
    let procs = ns.ps("home");
    procs.forEach(function (p) {
        if (p.filename === "watch.js" && p.args[0] === "hashes") {
            ns.tprint(p);
            return;
        }
    });
    */

    //ns.tprint(commonUtil.listHostsConnections(ns, 'fulcrumassets'));

    //ns.tprint(commonUtil.listHostsOther(ns));
    //ns.tprint(ns.getPurchasedServers());
    //ns.tprint(commonUtil.listHostsOwned(ns, true, true));
    //ns.tprint(commonUtil.listHosts(ns).filter(h => h.includes("hacknet-")));

    //ns.tprint(`Karma: ${ns.heart.break()}`);
    //ns.tprint(ns.getCrimeStats('kills'));

    //ns.tprint(commonUtil.formatTime(ns, 248542));

    /*
    const server = ns.getServer("CSEC");
    ns.tprint(server.backdoorInstalled);
    */

    /*
    const name = "NWO",
        company = ns.getCompany(name),
        faction = ns.getFaction(name);

    ns.tprint(name);
    ns.tprint(company);
    ns.tprint(faction);
    */

    /*
    commonUtil.working(ns);
    await ns.sleep(5000);

    // working element cleanup
    for (let i = 0; i <= 9999; i++) {
        let elemId = `custom_temp_elem_${i}`;
        if (undefined != document.getElementById(elemId)) {
            document.getElementById(elemId).remove();
            return;
        }
    }
    */

    //ns.tprint(await ns.singularity.getFactionRep(ns.getPlayer().factions[5]));

    /*
    const params = commonUtil.getLastAttackParams(ns);
    ns.tprint(params);
    */

    /* *
    // trying to get unclickable achievement
    let doc = eval("document"),
        unc = doc.getElementById("unclickable");

    unc.setAttribute('ref', 'unclickable');
    //await ns.sleep(5000);
    unc.style.display = "block";
    unc.style.visibility = "visible";
    unc.style.backgroundColor = "#00000";
    unc.style.color = "#FF0000";
    unc.onmousedown = () => {
        this.style.display = "none";
        this.style.visibility = "hidden";
    }

    /* */

    /*
    let homeRamMax = ns.getServerMaxRam("home");
    let homeRamReserved = Math.ceil(ns.getScriptRam(getWatcherScript(ns)) * 3) + 8;
    ns.tprint(homeRamMax);
    ns.tprint(homeRamReserved);
    */

    /*
    const script = "test.js";
    const host = "home";
    const iLimit = 5;
    let i = ns.args[0];

    if (i == undefined) {
        // initialize
        ns.print("Initializing instances");
        for (i = 1; i <= iLimit; i++) {
            if (!ns.isRunning(script, host, i)) {
                ns.print(`Starting instance: ${i}`);
                ns.exec(script, host, 1, i);
            }
        }

        if (i === iLimit) {
            ns.pprint(`Instance limit reached: ${iLimit}`);
        }

        // verify running
        ns.print("Verifying instances");
        for (i = 1; i <= iLimit; i++) {
            ns.print(`Instance ${i} is running: `, ns.isRunning(script, host, i));
        }
    } else {
        ns.tprint("Sleeping");
        await ns.sleep(10000);
    }
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
    tableUtil.renderTable(ns, "MOUNTAINS", mountains);
    */

/*
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

    //ns.tprint(targetUtil.getUnbreachedHosts(ns));

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

export function generateTableHead(doc, table, data) {
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

export function getCompanyRep(ns) {
    ns.tprint("Called getCompanyRep");
}

export function getFactionRep(ns) {
    ns.tprint("Called getFactionRep");
}

export function getHostsDetails(ns, hosts, scripts) {
    const scriptsRam = scripts.reduce((acc, curr) => acc + ns.getScriptRam(curr.file), 0);
    let hostsDetails = [];

    for (let host of hosts) {
        let server = ns.getServer(host),
            hostDetails = {
                "host": host,
                "maxRam": server.maxRam
            };

        if (host === "home") {
            hostDetails.maxRam -= getHomeRamReserved(ns);
        }

        if (hostDetails.maxRam < scriptsRam) {
            continue;
        }

        hostsDetails.push(hostDetails);
    }

    return hostsDetails;
}