/**
 * Valid solvers:
 *     buySell
 *     caesarCipher
 *     overlappingIntervals
 *     rleCompression
 *
 * @param ns
 * @returns {Promise<void>}
 */

import * as isUtil from "./util.is.js";

export async function main(ns) {
    let input;

    //input = [33,91,155,154,133,41,23,141,83,108,168,123,115,72];
    //await buySell(ns, input);

    //input = ["TRASH FLASH PRINT QUEUE LOGIN", 8];
    //await caesarCipher(ns, input);

    //input = [[3,11],[21,27],[4,14],[1,4],[18,22],[8,12],[2,4],[24,34],[22,29],[11,18],[15,25]];
    //await overlappingIntervals(ns, input);

    //input = "AAAAARRRRRRRRRlllllYYYXjjjjjjjJJJQ000000WWWoGWssssAaa221n666ttttttt";
    //await rleCompression(ns, input);

    input = "6ERLRCn853k7M992te559AZxnRnhb508Rjuhhhhe65185941bwB";
    input = "5aaabb450723abb";
    await lzDecompress(ns, input);
}

// solver functions

export async function buySell(ns, input) {
    ns.tprint(input);

    let currAction = "buy";
    let totalProfit = 0;
    let bsChain = [];

    let i = 0, j = 0;
    while (i < input.length) {
        switch (currAction) {
            case "buy":
                i = findNextSmallestKey(ns, input, i);
                j = findNextBiggestKey(ns, input, i);
                if (i === j) {
                    // there is no more to buy/sell
                    i = input.length;
                    break;
                }
                totalProfit -= input[i];
                bsChain.push("buy: " + input[i] + "; calc: " + totalProfit);
                currAction = "sell";
                break;

            case "sell":
            default:
                i = findNextBiggestKey(ns, input, i);
                totalProfit += input[i];
                bsChain.push("sell: " + input[i] + "; calc: " + totalProfit);
                currAction = "buy";
        }
        i++;
    }
    totalProfit = (totalProfit > 0)
        ? totalProfit
        : 0;

    ns.tprint(bsChain);
    ns.tprint("Total profit: " + totalProfit);
}

export async function caesarCipher(ns, input) {
    const lShift = input[1];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let output = "";

    for (let i = 0; i < input[0].length; i++) {
        let inChar = input[0][i];
        if (inChar === ' ') {
            output += inChar;
            continue;
        }

        let inCharPos = alphabet.indexOf(inChar);
        let outCharPos = (inCharPos < lShift)
            ? alphabet.length - (lShift - inCharPos)
            : inCharPos - lShift;
        output += alphabet.charAt(outCharPos);
    }

    ns.tprint(input);
    ns.tprint(output);
}

export async function overlappingIntervals(ns, input) {
    ns.tprint(input);
    let output = [];
    while (true) {
        input.forEach(rI => {
            if (output.length === 0) {
                output[0] = rI;
            } else {
                let o = 0;
                let inRange = false;
                output.forEach(rO => {
                    if (inRange) {
                        return;
                    }

                    let rILeftIn = (rO[0] < rI[0] && rI[0] < rO[1]);
                    let rIRightIn = (rO[0] < rI[1] && rI[1] < rO[1]);

                    // if rILeftIn and rIRightIn then it is entirely within this out range
                    // if rILeftIn and not rIRightIn then expand out right range
                    if (rILeftIn && !rIRightIn) {
                        output[o][1] = rI[1];
                    }
                    // if not rILeftIn and rIRightIn then expand out left range
                    if (!rILeftIn && rIRightIn) {
                        output[o][0] = rI[0];
                    }

                    if (rILeftIn || rIRightIn) {
                        inRange = true;
                    }

                    o++;
                });

                if (!inRange) {
                    output[output.length] = rI;
                }
            }
        });
        await ns.sleep(200);

        if (JSON.stringify(input) === JSON.stringify(output)) {
            ns.tprint(output);
            return;
        }

        input = output;
        output = [];
    }
}

export async function rleCompression(ns, input) {
    let prevChar = "";
    let ctr = 0;
    let output = "";
    for (let i = 0; i < input.length; i++) {
        let char = input.charAt(i);

        if (i === 0) {
            prevChar = char;
            ctr++;
            continue;
        }

        if (char === prevChar && (ctr + 1) < 10) {
            ctr++;

            if (i + 1 === input.length) {
                output += ctr + prevChar;
            }
        } else {
            output += ctr + prevChar;
            ctr = 1;
            prevChar = char;
        }
    }
    ns.tprint(input);
    ns.tprint(output);
}

export async function lzDecompress(ns, input) {
    ns.tprint(input);
    let output = "";

    for (let i = 0; i < input.length; i++) {
        let L = input.charAt[i];
        let LInt = parseInt(L);
        let D1 = input.substr(i+1, LInt);
        let D2 = input.charAt(i+1);
        let LNext = (i+1+LInt < input.length) ? input.charAt(i+1+LInt) : null;

        if (!isUtil.numberValid(ns, LNext)) {

        }
    }
}

// support functions

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

