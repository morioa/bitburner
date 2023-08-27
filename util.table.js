import {getRandomIntInclusive} from "./util.common.js";

const paddingSize = 1,
    paddingChar = " ",
    intersectChar = "+",
    horizLineChar = "-",
    vertLineChar = "|",
    tableColor = "#FFFF00";

/**
 * Render a table in HTML format or fixed-width text
 * @param ns
 * @param title
 * @param data
 * @param useDom
 */
export function renderTable(ns, title, data, useDom = false) {
    if (data.length === 0) {
        ns.tprintf("WARNING: No data to render");
        ns.exit();
    }

    let doc = eval("document"),
        term = doc.getElementById("terminal") ?? null;

    if (term === null) {
        useDom = false;
    }

    if (useDom) {
        let li = doc.createElement("li"),
            table = doc.createElement("table"),
            caption = table.createCaption(),
            dataKeys = Object.keys(data[0]);

        table.id = "custom_elem_" + getRandomIntInclusive(ns, 0,9999);
        table.className = "jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz";
        table.style.border = "1px solid " + tableColor;
        table.style.borderCollapse = "collapse";
        table.style.margin = "10px 0";
        caption.style.borderWidth = "1px 1px 0 1px";
        caption.style.borderStyle = "solid";
        caption.style.borderColor = tableColor;
        caption.style.textAlign = "left";
        caption.style.padding = "1px 6px";
        caption.style.color = tableColor;
        caption.innerHTML = title.toUpperCase();

        //term.insertAdjacentHTML("beforeend", "<table id='" + elemId + "' class='jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz' style=''></table>");

        generateTable(ns, doc, table, data);
        generateTableHead(ns, doc, table, dataKeys);

        table.insertBefore(caption, table.firstChild);
        li.appendChild(table);
        term.appendChild(li);
        li.scrollIntoView();

        return;
    }

    let columns = {}, maxLengths = {};

    // find max lengths
    for (let idx in data) {
        let dataObj = data[idx];
        for (let key in dataObj) {
            let length = dataObj[key].toString().length;
            if (maxLengths[key] === undefined || length > maxLengths[key]) {
                maxLengths[key] = length;
            }

            if (parseInt(idx) === 0) {
                columns[key] = key;
                length = key.toString().length;
                if (maxLengths[key] === undefined || length > maxLengths[key]) {
                    maxLengths[key] = length;
                }
            }
        }
    }

    // build table
    let output = drawTableTitle(ns, title) + drawTableLine(ns, maxLengths, columns, true);
    for (let dataObj of data) {
        output += drawTableLine(ns, maxLengths, dataObj);
    }

    output += drawTableBorder(ns, maxLengths);

    ns.tprintf(output);
}

function drawTableTitle(ns, title) {
    let maxLengths = [title.length];
    return "\n" + drawTableBorder(ns, maxLengths) + drawTableLine(ns, maxLengths, [title]);
}

function drawTableLine(ns, maxLengths, data, isHeader = false) {
    let output = "";

    if (isHeader) {
        output += drawTableBorder(ns, maxLengths);
    }

    output += vertLineChar;

    for (let col in data) {
        let value = data[col].toString(),
            extraPadding = maxLengths[col] - value.length,
            leftPadding = paddingSize,
            rightPadding = paddingSize;

        if (value.indexOf("$") >= 0 ||
            isNaN(value) === false ||
            value.match(/\$?\d+\.\d{3}[kmbtq]?/) !== null
        ) {
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

    if (isHeader) {
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

function generateTableHead(ns, doc, table, data) {
    let thead = table.createTHead(),
        row = thead.insertRow();
    for (let key of data) {
        let text = doc.createTextNode(key.toUpperCase()),
            th = doc.createElement("th");
        th.className = "jss16653 MuiTypography-root MuiTypography-body1";
        th.style.border = "1px solid " + tableColor;
        th.style.padding = "1px 6px";
        th.style.color = tableColor;
        th.style.textAlign = "left";
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(ns, doc, table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (let key in element) {
            let value = element[key].toString(),
                cell = row.insertCell();
            cell.className = "jss16653 MuiTypography-root MuiTypography-body1";
            cell.style.borderWidth = "0 1px";
            cell.style.borderStyle = "solid";
            cell.style.borderColor = tableColor;
            cell.style.padding = "0 6px";
            cell.style.color = tableColor;
            if (value.indexOf("$") >= 0 ||
                isNaN(value) === false ||
                value.match(/\$?\d+\.\d{3}[kmbtq]?/) !== null
            ) {
                cell.style.textAlign = "right";

                if (key.toLowerCase().indexOf("money") >= 0) {
                    //value = ns.nFormat(value, "($0.000a)");
                }
            }
            let text = doc.createTextNode(value);
            cell.appendChild(text);
        }
    }
}
