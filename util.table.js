import {getRandomIntInclusive} from "./util.common.js";

const colors = {
        bl:  "#000000",
        dgr: "#090909", dgrb: "#333333",
        gr:  "#666666", grb:  "#999999",
        w:   "#CCCCCC", wb:   "#FFFFFF",
        r:   "#990000", rb:   "#FF0000",
        o:   "#CC6600", ob:   "#FF9900",
        y:   "#CCCC00", yb:   "#FFFF00",
        dy:  "#666600", dyb:  "#999900",
        g:   "#00CC00", gb:   "#00FF00",
        dg:  "#006600", dgb:  "#009900",
        ddg: "#000900", ddgb: "#001100",
        c:   "#0099CC", cb:   "#00CCFF",
        lb:  "#3366CC", lbb:  "#6699FF",
        b:   "#0000CC", bb:   "#0000FF",
        db:  "#000033", dbb:  "#000066",
        p:   "#6666CC", pb:   "#9999FF",
        m:   "#9933CC", mb:   "#CC66FF",
        mm:  "#441166", mmb:  "#662299",
        dm:  "#220044", dmb:  "#440066"
    },
    themes = {
        army_green: {
            tableBorderColor: colors.dg,
            tableBgColor: colors.ddg,
            titleBgColor: colors.bl,
            titleColor: colors.ob,
            headerBgColor: colors.ddg,
            headerColor: colors.gb,
            rowMainBgColor: colors.ddg,
            altBgColor: colors.ddgb,
            cellMainColor: colors.dg,
            cellErrorColor: colors.rb,
            cellSpecialColor: colors.cb
        },
        army_gray: {
            tableBorderColor: colors.dgrb,
            tableBgColor: colors.dgr,
            titleBgColor: colors.bl,
            titleColor: colors.ob,
            headerBgColor: colors.dgr,
            headerColor: colors.gb,
            rowMainBgColor: colors.dgr,
            altBgColor: colors.bl,
            cellMainColor: colors.dg,
            cellErrorColor: colors.rb,
            cellSpecialColor: colors.cb
        },
        snow_drift: {
            tableBorderColor: colors.wb,
            tableBgColor: colors.bl,
            titleBgColor: colors.w,
            titleColor: colors.lb,
            headerBgColor: colors.grb,
            headerColor: colors.w,
            rowMainBgColor: colors.grb,
            altBgColor: colors.grb,
            cellMainColor: colors.dgrb,
            cellErrorColor: colors.lb,
            cellSpecialColor: colors.b
        }
    },
    theme = themes.army_gray,
    paddingSize = 1,
    paddingChar = " ",
    intersectChar = "+",
    horizLineChar = "-",
    vertLineChar = "|";

/**
 * Render a table in HTML format or fixed-width text
 * @param ns
 * @param title
 * @param data
 * @param useDom
 * @param replace
 * @param shiftUp
 */
export function renderTable(ns, title, data, useDom = false, replace = false, shiftUp = false) {
    if (data.length === 0) {
        ns.tprintf("WARNING: No data to render");
        ns.exit();
    }

    if (useDom) {
        let table = reactTable(ns, title, data),
            reactElem = React.createElement(
            'li',
            {
                className: "MuiListItem-root jss13034 MuiListItem-gutters MuiListItem-padding css-1578zj2 custom-table",
                style: {
                    marginTop: "0",
                    marginBottom: "0"
                }
            },
            table.rElem
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

function reactTable(ns, title, data) {
    const tableId = "custom_elem_" + getRandomIntInclusive(ns, 0,9999);

    return {
        id: tableId,
        rElem: React.createElement(
            'table',
            {
                id: tableId,
                className: "jss16653 MuiTypography-root MuiTypography-body1 css-cxl1tz",
                style: {
                    border: "1px solid " + theme.tableBorderColor,
                    borderCollapse: "collapse",
                    margin: "10px 0",
                    backgroundColor: theme.tableBgColor
                }
            },
            [
                reactCaption(ns, title),
                reactTableHead(ns, Object.keys(data[0])),
                reactTableBody(ns, data)
            ]
        )
    };
}

function reactCaption(ns, title) {
    return React.createElement(
        'caption',
        {
            style: {
                borderWidth: "1px 1px 0 1px",
                borderStyle: "solid",
                borderColor: theme.tableBorderColor,
                textAlign: "left",
                padding: "1px 6px",
                color: theme.titleColor,
                backgroundColor: theme.titleBgColor
            }
        },
        title.toUpperCase()
    );
}

function reactTableHead(ns, keys) {
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

function reactTableHeadCells(ns, keys) {
    let reactElems = [];
    for (const key in keys) {
        reactElems.push(React.createElement(
            'th',
            {
                className: "jss16653 MuiTypography-root MuiTypography-body1",
                style: {
                    border: "1px solid " + theme.tableBorderColor,
                    padding: "1px 6px",
                    color: theme.headerColor,
                    backgroundColor: theme.headerBgColor,
                    textAlign: "left"
                },
            },
            keys[key]
        ));
    }
    return reactElems;
}

function reactTableBody(ns, data) {
    return React.createElement(
        'tbody',
        {},
        reactTableRows(ns, data)
    );
}

function reactTableRows(ns, data) {
    let reactElems = [],
        i = 0, bgColor;
    while (i < data.length) {
        reactElems.push(React.createElement(
            'tr',
            {
                className: "hoverable-tr",
                style: {
                    backgroundColor: (i % 2 === 0)
                        ? theme.altBgColor
                        : theme.rowMainBgColor
                }
            },
            reactTableCells(ns, data[i])
        ));
        i++;
    }
    return reactElems;
}

function reactTableCells(ns, data) {
    let reactElems = [];

    for (const key in data) {
        data[key] = data[key].toString();
        let props = {
            className: "jss16653 MuiTypography-root MuiTypography-body1",
            style: {
                borderWidth: "0 1px",
                borderStyle: "solid",
                borderColor: theme.tableBorderColor,
                padding: "0 6px",
                color: (
                    data[key] === "false" ||
                    data[key].substr(0, 3) === "[[!" ||
                    data[key].substr(0, 1) === "-"
                )
                    ? theme.cellErrorColor
                    : (
                        data[key] === Infinity ||
                        data[key].includes("Infinity") ||
                        data[key].substr(0, 3) === "[[@"
                    )
                        ? theme.cellSpecialColor
                        : theme.cellMainColor
            }
        };

        if (["[[!", "[[@"].includes(data[key].substr(0, 3))) {
            data[key] = data[key].substr(3, data[key].length - 3);
        }

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
