import {getHomeRamReserved} from "./util.common";

/** @param {NS} ns **/
export async function main(ns) {
    await ns.disableLog("ALL");

    const target = ns.args[0],
        attacker = await ns.getHostname(),
        reservedRam = (attacker === "home") ? getHomeRamReserved(ns) : 0,
        scripts = {
            p: { file: "fattack.js" },
            g: { file: "_fgrow.js",   mult: 0.004 }, // raises security level by this amt per thread
            h: { file: "_fhack.js",   mult: 0.002 }, // successful hack raises security level by this amt
            w: { file: "_fweaken.js", mult: 0.05  }  // lowers security level by this amt per thread
        },
        gRam = await ns.getScriptRam(scripts.g.file),
        hRam = await ns.getScriptRam(scripts.h.file),
        wRam = await ns.getScriptRam(scripts.w.file),
        nextBatchDelayOffset = 4000,
        nextBatchDelayThreshold = nextBatchDelayOffset / 2;
    let pLock = false,
        wTime, gTime, hTime, nowTime, diffTime,
        wThreads1, wThreads2, gThreads, hThreads,
        wThreads1Calc, wThreads2Calc, gThreadsCalc, hThreadsCalc,
        wThreadsMax, gThreadsMax, hThreadsMax,
        wDelay1, wDelay2, gDelay, hDelay, delay,
        gPct, hPct,
        nextBatchDelay = 0,
        batchCounter = 0,
        batchRam = 0,
        batchFailure = false,
        batch, batches = [];

        await ns.tprintf(`INFO: Attacking target ${target} from ${attacker}`);

    outerLoop: while (true) {
        while (batches.length > 0) {
            nowTime = Date.now();
            diffTime = Math.abs(batches[0].end - nowTime);
            if (batches[0].end < nowTime) { // batch ended already so remove it
                batches.shift();
                continue;
            } else if (diffTime <= nextBatchDelayThreshold) {
                delay = diffTime + 100;
                ns.print(`Within delay threshold -- WAITING (${delay} ms)`);
                await ns.sleep(delay);
                continue outerLoop;
            }

            break;
        }

        let player = await ns.getPlayer(),
            server = await ns.getServer(target),
            usableRam = await ns.getServerMaxRam(attacker) - await ns.getServerUsedRam(attacker) - reservedRam,
            nowSec = Math.floor(await ns.getServerSecurityLevel(target)),
            minSec = await ns.getServerMinSecurityLevel(target),
            nowMoney = await ns.getServerMoneyAvailable(target),
            maxMoney = await ns.getServerMaxMoney(target),
            primed = (pLock || (nowSec === minSec && nowMoney === maxMoney)),
            action = (primed) ? "Attacking" : "Priming";

        //ns.print(server);
        ns.print(`nowSecRaw: ${await ns.getServerSecurityLevel(target)}, nowSec: ${nowSec}, minSec: ${minSec}`);
        ns.print(`nowMoney: ${nowMoney}, maxMoney: ${maxMoney}`);

        gPct = await ns.formulas.hacking.growPercent(server, 1, player);
        hPct = await ns.formulas.hacking.hackPercent(server, player) * 100;

        wTime = Math.ceil(await ns.formulas.hacking.weakenTime(server, player));
        gTime = Math.ceil(await ns.formulas.hacking.growTime(server, player));
        hTime = Math.ceil(await ns.formulas.hacking.hackTime(server, player));

        gThreadsMax = Math.floor(usableRam / gRam);
        hThreadsMax = Math.floor(usableRam / hRam);
        wThreadsMax = Math.floor(usableRam / wRam);

        gThreads = Math.ceil(5 / (gPct - 1));
        hThreads = Math.ceil(50 / hPct);
        wThreads1 = Math.ceil((hThreads * scripts.h.mult) / scripts.w.mult); // remediate hack
        wThreads2 = Math.ceil((gThreads * scripts.g.mult) / scripts.w.mult); // remediate grow

        gThreadsCalc = (gThreads <= gThreadsMax) ? gThreads : gThreadsMax;
        hThreadsCalc = (hThreads <= hThreadsMax) ? hThreads : hThreadsMax;
        wThreads1Calc = (wThreads1 <= wThreadsMax) ? wThreads1 : wThreadsMax;
        wThreads2Calc = (wThreads2 <= wThreadsMax) ? wThreads2 : wThreadsMax;

        ns.print(`gThreads: ${gThreads}/${gThreadsMax} :: ${gThreadsCalc}`);
        ns.print(`hThreads: ${hThreads}/${hThreadsMax} :: ${hThreadsCalc}`);
        ns.print(`wThreads1: ${wThreads1}/${wThreadsMax} :: ${wThreads1Calc}`);
        ns.print(`wThreads2: ${wThreads2}/${wThreadsMax} :: ${wThreads2Calc}`);

        wDelay1 = 0;
        wDelay2 = 2000;
        gDelay = (wTime - gTime) + 1000;
        hDelay = (wTime - hTime) - 1000;
        nextBatchDelay = wDelay2 + nextBatchDelayOffset;
        //ns.print(`wDelay1: ${wDelay1}, wDelay2: ${wDelay2}, gDelay: ${gDelay}, hDelay: ${hDelay}`);

        batchRam = (gThreadsCalc * gRam) + (hThreadsCalc * hRam) + ((wThreads1Calc + wThreads2Calc) * wRam);

        if (primed && usableRam < batchRam) {
            if (batchCounter === 0) {
                await ns.tprintf(`ERROR: Insufficient RAM to start first batch -- need ${batchRam}, have ${usableRam} -- ENDING [${attacker}]`);
                ns.exit();
            } else {
                ns.print(`Insufficient RAM to start new batch -- need ${batchRam}, have ${usableRam} -- WAITING`);
                await ns.sleep(10000);
                continue;
            }
        }

        batchCounter++;
        nowTime = Date.now();
        batch = {
            "id": batchCounter,
            "action": action.toLowerCase(),
            "start": nowTime,
            "end": nowTime + wTime + wDelay2
        };
        batches.push(batch);
        ns.print(`${action} server, batch ${batchCounter}`);

        if (primed) {
            pLock = true;
            batchFailure = (
                !await ns.exec(scripts.w.file, attacker, wThreads1, target, wDelay1) ||
                !await ns.exec(scripts.w.file, attacker, wThreads2, target, wDelay2) ||
                !await ns.exec(scripts.g.file, attacker, gThreads, target, gDelay) ||
                !await ns.exec(scripts.h.file, attacker, hThreads, target, hDelay)
            );
        } else {
            gThreads = (gThreads <= gThreadsMax) ? gThreads : gThreadsMax;
            wThreads1 = (wThreads1 <= wThreadsMax) ? wThreads1 : wThreadsMax;
            wThreads2 = (wThreads2 <= wThreadsMax) ? wThreads2 : wThreadsMax;

            if (nowSec > minSec) {
                wThreads1 = Math.floor((nowSec - minSec) / scripts.w.mult) + 2;
                wThreads1 = (wThreads1 <= wThreadsMax) ? wThreads1 : wThreadsMax;
                batchFailure = (!await ns.exec(scripts.w.file, attacker, wThreads1, target, wDelay1));
            }

            if (nowMoney < maxMoney) {
                batchFailure = (
                    /*!await ns.exec(scripts.w.file, attacker, wThreads2, target, wDelay2) ||*/
                    !await ns.exec(scripts.g.file, attacker, gThreads, target, gDelay)
                );
            }

            nextBatchDelay += wTime;
        }

        if (batchFailure) {
            await ns.tprintf(`ERROR: Failed to start ${action.toLowerCase()} -- ENDING [${attacker}]`);
            ns.exit();
        }

        await ns.sleep(nextBatchDelay);
    }
}
