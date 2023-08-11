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

export function getAttackLogFile(ns) {
    return "attack.txt";
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
            hostsConns.push({host:host, connections:ns.scan(host).filter(h => h.indexOf(getHostPurchasedPrefix(ns)) < 0)});
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
    const allProcesses = ns.ps(host);
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

export function formatNumber(ns, number, formatTo = "shorthand", includeMoneySymbol = false) {
    if (number == undefined) {
        return false;
    }

    const multiplier = {
        q: 10**15, //Math.pow(10, 15),
        t: 10**12, //Math.pow(10, 12),
        b: 10**9,  //Math.pow(10, 9),
        m: 10**6,  //Math.pow(10, 6),
        k: 10**3   //Math.pow(10, 3)
    };

    const convert = {
        shorthand: function(ns, number) {
            for (let [k,v] of Object.entries(multiplier)) {
                let calcVal = number.valueOf() / v;
                if (calcVal >= 1 || k === "k") {
                    number = (calcVal).toFixed(3) + k;
                    break;
                }
            }
            return number;
        },
        raw: function(ns, number, lastChar) {
            return number.substring(0, number.length - 1).valueOf() * multiplier[lastChar];
        }
    }

    number = number.toString().replace(/[$,]/g, "");  // convert $1,000,000.000k to 1000000.000k
    const lastChar = number.substr(-1);
    const isShorthand = multiplier.hasOwnProperty(lastChar);

    if ((formatTo === "raw" && isShorthand) ||
        (formatTo === "shorthand" && !isShorthand)) {
        number = convert[formatTo](ns, number, lastChar);
    } else if (formatTo === "shorthand" && isShorthand) {
        number = convert["raw"](ns, number, lastChar);
        number = convert["shorthand"](ns, number);
    }

    if (includeMoneySymbol) {
        number = "$" + number;
    }

    return number;
}

export function formatNumberArrayOfObjectsColumns(ns, arr, cols, formatTo = "shorthand", includeMoneySymbol = false) {
    let formattedObjArr = [];
    for (let [k,v] of Object.entries(arr)) {
        for (let col of cols) {
            if (v.hasOwnProperty(col)) {
                v[col] = formatNumber(ns, v[col], formatTo, includeMoneySymbol);
            }
        }
        formattedObjArr.push(v);
    }

    return formattedObjArr;
}

export function getHomeRamReserved(ns) {
    const watcherRamCost = ns.getScriptRam(getWatcherScript(ns));
    const purchaseServersRamCost = ns.getScriptRam(getServerPurchaseScript(ns));
    const findTargetsRamCost = ns.getScriptRam("findTargets.js");

    return Math.ceil(
        (watcherRamCost * 3) + (purchaseServersRamCost) + (findTargetsRamCost * 3) + 8
    );
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
    const term = doc.getElementById('terminal');
    if (term == undefined) {
        return;
    }
    if (elemId === null) {
        elemId = `custom_temp_elem_${getRandomIntInclusive(ns, 0,9999)}`;
        term.insertAdjacentHTML("beforeend", `<p id="${elemId}" class="jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz" style="color: #999999;">working...</p>`);
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
    const lineChar = "=";
    const titleLine = `==[ ${title.toUpperCase()} ]==`;
    const messageLine = `>>>  ${message}  <<<`;
    const lineLength = (titleLine.length > messageLine.length)
        ? titleLine.length
        : messageLine.length;
    const output = `WARN:
    
${titleLine}${lineChar.repeat(lineLength - titleLine.length)}
${messageLine}
${lineChar.repeat(lineLength)}
    `;
    ns.tprintf(output);
}

export function getLastAttackParams(ns) {
    const params = (ns.fileExists(getAttackLogFile(ns)))
        ? ns.read(getAttackLogFile(ns))
        : '';

    return (params === "")
        ? {"from":null, "model":null, "target":null}
        : JSON.parse(params);
}
