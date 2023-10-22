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
 * @param replace
 */
export function renderTable(ns, title, data, useDom = false, replace = false) {
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
        let reactElem = React.createElement(
                'li',
                {
                    className: "MuiListItem-root jss13034 MuiListItem-gutters MuiListItem-padding css-1578zj2 custom-table",
                    style: {
                        marginTop: "auto"
                    }
                },
                reactTable(ns, title, data)
            );
        ns.tprintRaw(reactElem);

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

function reactTable(ns, title, data)
{
    return React.createElement(
        'table',
        {
            id: "custom_elem_" + getRandomIntInclusive(ns, 0,9999),
            className: "jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz",
            style: {
                border: "1px solid " + tableColor,
                borderCollapse: "collapse",
                margin: "10px 0"
            }
        },
        [
            reactCaption(ns, title),
            reactTableHead(ns, Object.keys(data[0])),
            reactTableBody(ns, data)
        ]
    );
}

function reactCaption(ns, title)
{
    return React.createElement(
        'caption',
        {
            style: {
                borderWidth: "1px 1px 0 1px",
                borderStyle: "solid",
                borderColor: tableColor,
                textAlign: "left",
                padding: "1px 6px",
                color: tableColor
            }
        },
        title.toUpperCase()
    );
}

function reactTableHead(ns, keys)
{
    return React.createElement(
        'thead',
        {},
        React.createElement(
            'tr',
            {},
            reactTableHeadCells(ns, keys)
        )
    );
}

function reactTableHeadCells(ns, keys)
{
    let reactElems = [];
    for (const key in keys) {
        reactElems.push(React.createElement(
            'th',
            {
                className: "jss16653 MuiTypography-root MuiTypography-body1",
                style: {
                    border: "1px solid " + tableColor,
                    padding: "1px 6px",
                    color: tableColor,
                    textAlign: "left"
                },
            },
            keys[key]
        ));
    }
    return reactElems;
}

function reactTableBody(ns, data)
{
    return React.createElement(
        'tbody',
        {},
        reactTableRows(ns, data)
    );
}

function reactTableRows(ns, data)
{
    let reactElems = [],
        i = 0;
    while (i < data.length) {
        reactElems.push(React.createElement(
            'tr',
            {},
            reactTableCells(ns, data[i])
        ));
        i++;
    }
    return reactElems;
}

function reactTableCells(ns, data)
{
    let reactElems = [];

    for (const key in data) {
        data[key] = data[key].toString();
        let props = {
            className: "jss16653 MuiTypography-root MuiTypography-body1",
            style: {
                borderWidth: "0 1px",
                borderStyle: "solid",
                borderColor: tableColor,
                padding: "0 6px",
                color: tableColor
            }
        };

        if (data[key].indexOf("$") >= 0 ||
            isNaN(data[key]) === false ||
            data[key].match(/\$?\d+\.\d{3}[kmbtq]?/) !== null
        ) {
            props.style.textAlign = "right";
        }

        reactElems.push(React.createElement(
            'td',
            props,
            data[key]
        ));
    }
    return reactElems;
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
