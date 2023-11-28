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
import {getFunctionCallerName} from "./util.common.js";

export async function main(ns) {
    let input;

    /* *
    input = 23285299;
    await generateIP(ns, input);

    /* *
    input = [2, [95,52,104,22,182,111,39,183,117,114,17,112,120,57,187,7,192,11,115,115,15,62,101,163,121,42,59]];
    await buySell(ns, input);

    /* *
    input = ["MEDIA ENTER LOGIC SHIFT VIRUS", 15];
    await caesarCipher(ns, input);

    /* *
    input = ["FLASHPRINTQUEUEPOPUPLOGIN", "HARDWARE"];
    await vCipherDecrypt(ns, input);

    /* *
    input = [[7,15],[5,11],[19,20],[3,6],[20,29],[10,20],[6,15],[9,16],[14,18],[23,32],[13,21],[17,24],[3,11]];
    await overlappingIntervals(ns, input);

    /* *
    input = "IIIIII55555ff00TTTTTTTTsssscccccccccccccp666666uZCCWWWWAHHxxFa3uu1111111111cc";
    await rleCompression(ns, input);

    /* *
    input = "2FO620786F3P4U2299xZ2sLJOcF131478125492tjEEZAR5734q33j45";
    await lzDecompress(ns, input);

    /* *
    input = "OiqjEef0gWf7gWf77VDFd6ooooooooooo8oo8oo82oo8oo82ou7S7S7Sm77S7S77S7S76B7fBbS7lfBwYU";
    await lzCompress(ns, input);

    /* *
    input = 849589523;
    await maxPrimeFactor(ns, input);

    /* *
    input = 62;
    await totalWaysToSum(ns, input);

    /* *
    input = generateGrid(4, 4);
    await uniquePaths(ns, input);

    /* *
    input = [
        [0,0,0,0,0,1],
        [0,0,0,0,0,1],
        [0,0,0,1,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,0,0,0,1,1],
        [0,0,0,0,0,0],
        [0,0,1,0,0,0],
        [1,0,0,0,0,0]
    ];
    await uniquePaths(ns, input);

    /* */
    input = [
        [22,49,29,13,33,47,26,24],
        [ 6,11,28,50,18, 5, 9, 3],
        [ 9,35, 6,40, 7,35,21, 2],
        [43,39,14,24,46, 8,27, 7],
        [39, 6, 9,47,33,49,47,50]
    ];
    await spiralizeMatrix(ns, input);

    /* */
}

// solver functions

export async function generateIP(ns, input) {
    input = "" + input;

    const l = input.length;
    let summary = [],
        result = [],
        check = input;

    summary['input'] = input;

    // Check for string size
    if (l > 12 || l < 4) {
        document.write("Not Valid IP Address");
    }

    // Generating different combinations.
    for (let i = 1; i < l - 2; i++) {
        for (let j = i + 1; j < l - 1; j++) {
            for (let k = j + 1; k < l; k++) {
                check = check.substring(0, k) + "."
                    + check.substring(k, check.length);
                check = check.substring(0, j) + "."
                    + check.substring(j, check.length);
                check = check.substring(0, i) + "."
                    + check.substring(i, check.length);

                // Check for the validity of combination
                if (isValidIP(check)) {
                    result.push(check);
                }

                check = input;
            }
        }
    }

    summary['result'] = JSON.stringify(result);
    showSummary(ns, summary);
}

export async function buySell(ns, input) {
    let summary = [],
        currAction = "buy",
        maxTrans = Infinity,
        totalProfit = 0,
        bsChain = [];

    summary['input'] = JSON.stringify(input);

    if (typeof input[1] === 'object') {
        ns.tprintf("WARN: maxTrans is currently not implemented");
        maxTrans = parseInt(input[0]);
        input = input[1];
    }

    ns.tprint(`maxTrans: ${maxTrans}`);
    ns.tprint(`input: ${input}`);

    let i = 0, j = 0;
    while (i < input.length) {
        switch (currAction) {
            case "buy":
                i = findNextSmallestKey(ns, input, i);
                j = findNextBiggestKey(ns, input, i);
                if (i === j) {
                    // there is no more to buy/sell
                    //ns.tprint(`i: ${i}, j: ${j}, valAt: ${input[i]}`);
                    i = input.length;
                    break;
                }
                totalProfit -= input[i];
                bsChain.push("\nbuy: " + input[i] + "; calc: " + totalProfit);
                currAction = "sell";
                break;

            case "sell":
            default:
                i = findNextBiggestKey(ns, input, i);
                totalProfit += input[i];
                bsChain.push("\nsell: " + input[i] + "; calc: " + totalProfit);
                currAction = "buy";
        }
        i++;
    }
    totalProfit = (totalProfit > 0)
        ? totalProfit
        : 0;

    summary['chain'] = bsChain;
    summary['result'] = totalProfit;
    showSummary(ns, summary);
}

export async function caesarCipher(ns, input) {
    const lShift = input[1],
        alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let summary = [],
        output = "";

    summary['input'] = JSON.stringify(input);

    for (let i = 0; i < input[0].length; i++) {
        let inChar = input[0][i];
        if (inChar === ' ') {
            output += inChar;
            continue;
        }

        let inCharPos = alphabet.indexOf(inChar),
            outCharPos = (inCharPos < lShift)
                ? alphabet.length - (lShift - inCharPos)
                : inCharPos - lShift;
        output += alphabet.charAt(outCharPos);
    }

    summary['result'] = output;
    showSummary(ns, summary);
}

export async function overlappingIntervals(ns, input) {
    let summary = [],
        output = [];

    input = input.sort(function(a,b) {
        return a[0]-b[0]
    });

    summary['input'] = JSON.stringify(input);

    while (true) {
        input.forEach(rI => {
            if (output.length === 0) {
                output[0] = rI;
            } else {
                let o = 0,
                    inRange = false;
                output.forEach(rO => {
                    if (inRange) {
                        return;
                    }

                    let rILeftIn = (rO[0] <= rI[0] && rI[0] <= rO[1]),
                        rIRightIn = (rO[0] <= rI[1] && rI[1] <= rO[1]);

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
            summary['result'] = JSON.stringify(output);
            showSummary(ns, summary);
            return;
        }

        input = output;
        output = [];
    }
}

export async function rleCompression(ns, input) {
    let summary = [],
        prevChar = "",
        ctr = 0,
        output = "";

    summary['input'] = JSON.stringify(input);

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

            if (i + 1 === input.length) {
                output += ctr + prevChar;
            }
        }
    }

    summary['result'] = output;
    showSummary(ns, summary);
}

export async function lzDecompress(ns, input) {
    let summary = [],
        output = "", op = "",
        readNext = true,
        L, rewind, rewindTo;

    summary['input'] = input;

    for (let i = 0; i < input.length; i++) {
        L = parseInt(input.charAt(i));
        //ns.tprint(`L: ${L}`);

        if (L === 0) {
            readNext = !readNext;
            continue;
        }

        if (readNext) {
            op = input.substr(i+1, L);
            //ns.tprint(`op: ${op}`);
            i += L;
        } else {
            rewind = parseInt(input.charAt(i+1));
            rewindTo = output.length - rewind;

            //ns.tprint(`rewind: ${rewind}`);
            //ns.tprint(`rewindTo: ${rewindTo}`);

            if (L > rewind) {
                op = output.substring(rewindTo, output.length).repeat(L).substr(0, L);
                //ns.tprint(`op: ${op}`);
            } else {
                op = output.substr(rewindTo, L);
                //ns.tprint(`op: ${op}`);
            }

            i++;
        }

        output += op;
        readNext = !readNext;
    }

    summary['result'] = output;
    showSummary(ns, summary);
}

export async function lzCompress(ns, input) {

}

export async function vCipherDecrypt(ns, input) {
    let summary = [],
        pt = input[0],
        kwr = input[1],
        kw = input[1],
        ab = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        res = "";

    summary['input'] = JSON.stringify(input);

    while (kw.length < pt.length) {
        kw += kwr;
    }

    kw = kw.substring(0, pt.length);

    summary['plaintext'] = pt;
    summary['keyword'] = kw;

    for (let i = 0; i < pt.length; i++) {
        let ptChar = pt.charAt(i),
            kwChar = kw.charAt(i),
            ptLoc = ab.indexOf(ptChar),
            kwLoc = ab.indexOf(kwChar),
            resLoc = ptLoc + kwLoc;

        /*
        ns.tprint({
            "ptChar": ptChar,
            "kwChar": kwChar,
            "ptLoc": ptLoc,
            "kwLoc": kwLoc,
            "resLoc": resLoc
        });
        */

        if (resLoc > (ab.length - 1)) {
            resLoc -= ab.length;
        }

        res += ab.charAt(resLoc);

        /*
        ns.tprint({
            "resLoc_recalc": resLoc,
            "res": res
        });
        */
    }

    summary['result'] = res;
    showSummary(ns, summary);
}

export async function maxPrimeFactor(ns, input) {
    let summary = [],
        n = input,
        maxPrime = -1;

    summary['input'] = input;

    while (n % 2 === 0) {
        n = n / 2;
        maxPrime = 2;
    }

    while (n % 3 === 0) {
        n = n / 3;
        maxPrime = 3;
    }

    for (let i = 5; i <= Math.sqrt(n); i += 6) {
        while (n % i === 0) {
            maxPrime = i;
            n = n / i;
        }
        while (n % (i + 2) === 0) {
            maxPrime = i + 2;
            n = n / (i + 2);
        }
    }

    summary['result'] = (n > 4) ? n : maxPrime;
    showSummary(ns, summary);
}

export async function spiralizeMatrix(ns, input) {
    const ds = "rdlu",
        inputSize = input.length * input[0].length;
    let summary = [],
        d = ds[0],
        usedXY = [],
        xMin = 0, xMax = input[0].length - 1, x = xMin, currX, nextX,
        yMin = 0, yMax = input.length - 1, y = yMin, currY, nextY,
        result = [];

    summary['input'] = JSON.stringify(input);

    while (usedXY.indexOf(y + "," + x) === -1) {
        result.push(input[y][x]);
        usedXY.push(y + "," + x);

        currX = x;
        currY = y;

        do {
            if (d === "r") {
                nextX = x + 1;
                if (nextX <= xMax && usedXY.indexOf(y + "," + nextX) === -1) {
                    x++;
                } else {
                    d = nextStr(ds, d);
                    yMin++;
                }
            }

            if (d === "d") {
                nextY = y + 1;
                if (nextY <= yMax && usedXY.indexOf(nextY + "," + x) === -1) {
                    y++;
                } else {
                    d = nextStr(ds, d);
                    xMax--;
                }
            }

            if (d === "l") {
                nextX = x - 1;
                if (nextX >= xMin && usedXY.indexOf(y + "," + nextX) === -1) {
                    x--;
                } else {
                    d = nextStr(ds, d);
                    yMax--;
                }
            }

            if (d === "u") {
                nextY = y - 1;
                if (nextY >= yMin && usedXY.indexOf(nextY + "," + x) === -1) {
                    y--;
                } else {
                    d = nextStr(ds, d);
                    xMin++;
                }
            }

            await ns.sleep(1);
        } while (currX === x && currY === y && result.length < inputSize);

        await ns.sleep(1);
    }

    summary['result'] = JSON.stringify(result);
    showSummary(ns, summary);
}

export async function hammingBinToInt(ns, input) {
    // 00000000010000001000101110001011
}

export async function totalWaysToSum(ns, input) {
    let summary = [],
        count = numberOfWays(input, input - 1);

    summary['input'] = input;
    summary['result'] = count;
    showSummary(ns, summary);
}

export async function uniquePaths(ns, input) {
    let summary = [],
        r = input.length,
        c = input[0].length,
        res = uniquePathHelper(0, 0, r, c, input);

    summary['input'] = JSON.stringify(input);
    summary['result'] = res;
    showSummary(ns, summary);
}


// support functions

function isValidIP(ip) {
    // Splitting by "."
    let ips = [],
        ex = "";

    for (let i = 0; i < ip.length; i++) {
        if (ip[i] === '.') {
            ips.push(ex);
            ex = "";
        } else {
            ex = ex + ip[i];
        }
    }
    ips.push(ex);

    // Checking for the corner cases
    for (let i = 0; i < ips.length; i++) {
        if (ips[i].length > 3
            || parseInt(ips[i]) < 0
            || parseInt(ips[i]) > 255)
            return false;

        if (ips[i].length > 1
            && parseInt(ips[i]) === 0)
            return false;

        if (ips[i].length > 1
            && parseInt(ips[i]) !== 0
            && ips[i][0] === '0')
            return false;
    }

    return true;
}

function findNextSmallestKey(ns, data, startFrom) {
    for (let i = startFrom; i <= data.length - 1; i++) {
        if (data[i] < data[i + 1] || i === data.length - 1) {
            return i;
        }
    }
    return startFrom;
}

function findNextBiggestKey(ns, data, startFrom) {
    for (let i = startFrom; i <= data.length - 1; i++) {
        if (data[i] > data[i + 1] || i === data.length - 1) {
            return i;
        }
    }
    return startFrom;
}

function nextStr(str, currStr) {
    const currIdx = str.indexOf(currStr);
    return (currIdx + 1 === str.length) ? str[0] : str[currIdx + 1];
}

function numberOfWays(N, K) {
    // Base case
    if (N == 0) return 1;
    if (N < 0 || K <= 0) return 0;

    // including and not including K in sum
    return numberOfWays(N - K, K) + numberOfWays(N, K - 1);
}

function generateGrid(x, y) {
    let grid = [];

    for (let r = 0; r < y; r++) {
        grid[r] = [];
        for (let c = 0; c < x; c++) {
            grid[r][c] = 0;
        }
    }

    return grid;
}

function uniquePathHelper(i, j, r, c, A) {
    // boundary condition or constraints
    if(i == r || j == c)
        return 0;

    if(A[i][j] == 1)
        return 0;

    // base case
    if(i == r-1 && j == c-1)
        return 1;

    return uniquePathHelper(i+1, j, r, c, A) + uniquePathHelper(i, j+1, r, c, A);
}

function showSummary(ns, summary) {
    const func = getFunctionCallerName(2),
        lineChar = "=",
        titleLine = `==[ ${func} ]==`,
        lineLength = 80;

    let summaryOutput = "",
        output;

    for (let k in summary) {
        if (typeof summary[k] === 'string' && summary[k].startsWith('[[') && k !== 'result') {
            summary[k] = summary[k].replaceAll('[[', "[\n    [");
            summary[k] = summary[k].replaceAll(']]', "]\n]");
            summary[k] = summary[k].replaceAll('],[', "],\n    [");
        }
        summaryOutput += "\n" + k.toUpperCase() + ": " + summary[k] + "\n";
    }
    output = `
${titleLine}${lineChar.repeat(lineLength - titleLine.length)}
${summaryOutput}
`;
    ns.tprintf(output);
}