/** @param {NS} ns **/

export function getInitScript(ns) {
    return "init.js";
}

export function getScriptsPurchaseScript(ns) {
    return "purchaseScripts.js";
}

export function getServerPurchaseScript(ns) {
    return "purchaseServers.js";
}

export function getWatcherScript(ns) {
    return "watcher.js";
}

export function getAttackScript(ns) {
    return "attack.js";
}

export function getHackScript(ns) {
    return "_chesterTheMolester.js";
}

export function getHackScriptRamCost(ns) {
    return ns.getScriptRam(getHackScript(ns));
}

export function getHostPurchasedPrefix(ns) {
    return "pserv-";
}

export function getLastHostPurchasedId(ns) {
    let hosts = listHostsOwned(ns, false);

    if (hosts.length === 0) {
        return -1;
    }

    return hosts[hosts.length - 1].substring(hosts[hosts.length - 1].lastIndexOf("-") + 1);
}

export function getNextHostPurchasedId(ns) {
    return Number(getLastHostPurchasedId(ns)) + 1;
}

export function getNextHostPurchasedName(ns) {
    return getHostPurchasedPrefix(ns) + getNextHostPurchasedId(ns);
}

export function listHosts(ns, host, hostList) {
    if (hostList.indexOf(host) == -1) {
        hostList.push(host);
        ns.scan(host).forEach(host => listHosts(ns, host, hostList));
    }
    return hostList;
}

export function listHostsConnections(ns, targetHost = null) {
    let hostsConns = [];
    for (let host of listHosts(ns, "home", [])) {
        if (host.indexOf(getHostPurchasedPrefix(ns)) >= 0) {
            continue;
        }

        if (targetHost === null || targetHost === host) {
            hostsConns.push({"host":host, "connections":ns.scan(host).filter(h => h.indexOf(getHostPurchasedPrefix(ns)) < 0)});
        }
    }
    return hostsConns;
}

export function listHostsOwned(ns, includeHome = true) {
    let hosts = [];

    if (includeHome) {
        hosts.push("home");
    }

    return hosts.concat(ns.getPurchasedServers());
}

export function listHostsOther(ns) {
    return listHosts(ns, "home", []).filter(host => !listHostsOwned(ns).includes(host));
}

export function findProcessByName(ns, name, host, kill = false) {
    let allProcesses = ns.ps(host);
    let processes = [];
    for (let process of allProcesses) {
        if (process.filename === name) {
            if (kill) {
                ns.kill(process.pid, host);
            } else {
                processes.push(process);
            }
        }
    }

    if (processes.length > 0) {
        return processes;
    }

    return null;
}

export function formatMoney(ns, money) {
    return "$" + parseInt(money).toString().replace(/(.)(?=(\d{3})+$)/g,'$1,');
}

export function getHomeRamReserved(ns) {
    let homeRamMax = ns.getServerMaxRam("home");
    let homeRamReserved = 0;
    if (homeRamMax >= 8192) {
        homeRamReserved = Math.ceil(ns.getScriptRam(getWatcherScript(ns)) * 3) + 8;
    } else if (homeRamMax > 1024) {
        homeRamReserved = 64;
    } else if (homeRamMax > 32) {
        homeRamReserved = 8;
    }
    return homeRamReserved;
}

export function upperFirstLetter(ns, str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getRandomIntInclusive(ns, min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function working(ns, elemId = null) {
    const doc = eval("document");
    if (elemId === null) {
        elemId = "custom_temp_elem_" + getRandomIntInclusive(ns, 0,9999);
        doc.getElementById('terminal').insertAdjacentHTML("beforeend", "<p id='" + elemId + "' class='jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz' style='color: #999999;'>working...</p>");
        doc.getElementById(elemId).scrollIntoView();
        return elemId;
    } else {
        doc.getElementById(elemId).remove();
    }
}

export function play(ns, sound) {
    const script = "play.js";
    const ramAvail = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
    const ramReq = ns.getScriptRam(script);

    if (ramAvail > ramReq) {
        ns.run(script, 1, sound);
    }
}

export function showNotice(ns, message, title = "notice") {
    let lineChar = "=";
    let titleLine = "==[ " + title.toUpperCase() + " ]==";
    let messageLine = ">>>  " + message + "  <<<";
    let lineLength = (titleLine.length > messageLine.length)
        ? titleLine.length
        : messageLine.length;

    let output = "WARN:\n\n" +
        titleLine + lineChar.repeat(lineLength - titleLine.length) + "\n" +
        messageLine + "\n" +
        lineChar.repeat(lineLength) + "\n\n";
    ns.tprintf(output);
}
