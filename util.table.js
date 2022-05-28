/** @param {NS} ns **/

const paddingSize = 1;
const paddingChar = " ";
const intersectChar = "+";
const horizLineChar = "-";
const vertLineChar = "|";

export function renderTable(ns, title, data, compact = false) {
    if (data.length === 0) {
        ns.tprintf("WARNING: No data to render");
        ns.exit();
    }

    let columns = {}, maxLengths = {};

    // find max lengths
    for (let idx in data) {
        let dataObj = data[idx];
        for (let key in dataObj) {
            let length = dataObj[key].toString().length;
            if (maxLengths[key] == undefined || length > maxLengths[key]) {
                maxLengths[key] = length;
            }

            if (parseInt(idx) === 0) {
                columns[key] = key;
                length = key.toString().length;
                if (maxLengths[key] == undefined || length > maxLengths[key]) {
                    maxLengths[key] = length;
                }
            }
        }
    }

    // build table
    let output = drawTableTitle(ns, title) + drawTableLine(ns, compact, maxLengths, columns, true);
    for (let dataObj of data) {
        output += drawTableLine(ns, compact, maxLengths, dataObj);
    }

    if (compact) {
        output += drawTableBorder(ns, maxLengths);
    }

    ns.tprintf(output);
}

function drawTableTitle(ns, title) {
    let maxLengths = [title.length];
    return "\n" + drawTableBorder(ns, maxLengths) + drawTableLine(ns, true, maxLengths, [title]);
}

function drawTableLine(ns, compact, maxLengths, data, isHeader = false) {
    let output = "";

    if (isHeader) {
        output += drawTableBorder(ns, maxLengths);
    }

    output += vertLineChar;

    for (let col in data) {
        let value = data[col].toString();
        let extraPadding = maxLengths[col] - value.length;

        let leftPadding = paddingSize;
        let rightPadding = paddingSize;

        if (value.indexOf("$") >= 0 || isNaN(value) === false) {
            leftPadding += extraPadding;
        } else {
            rightPadding += extraPadding;
        }

        output += paddingChar.repeat(leftPadding) +
            ((isHeader) ? value.toUpperCase() : value) +
            paddingChar.repeat(rightPadding) +
            vertLineChar;
    }

    output += "\n";

    if (isHeader || !compact) {
        output += drawTableBorder(ns, maxLengths);
    }

    return output;
}

function drawTableBorder(ns, maxLengths) {
    let output = intersectChar;

    for (let col in maxLengths) {
        output += horizLineChar.repeat(maxLengths[col] + paddingSize + paddingSize) + intersectChar;
    }

    return output + "\n";
}
