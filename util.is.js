import * as commonUtil from "./util.common";

/** @param {NS} ns **/

export function valueEqual(ns, val1, val2) {
    return (
        val1 != undefined &&
        val2 != undefined &&
        val1 === val2
    );
}

export function numberEqual(ns, num1, num2, finiteConstraint = true) {
    return (
        numberValid(ns, num1, finiteConstraint) &&
        numberValid(ns, num2, finiteConstraint) &&
        parseInt(num1, 10) === parseInt(num2, 10)
    );
}

export function numberGreater(ns, num1, num2, finiteConstraint = true) {
    return (
        numberValid(ns, num1, finiteConstraint) &&
        numberValid(ns, num2, finiteConstraint) &&
        parseInt(num1, 10) > parseInt(num2, 10)
    );
}

export function numberGreaterOrEqual(ns, num1, num2, finiteConstraint = true) {
    return (
        numberValid(ns, num1, finiteConstraint) &&
        numberValid(ns, num2, finiteConstraint) &&
        parseInt(num1, 10) >= parseInt(num2, 10)
    );
}

export function numberLess(ns, num1, num2, finiteConstraint = true) {
    return (
        numberValid(ns, num1, finiteConstraint) &&
        numberValid(ns, num2, finiteConstraint) &&
        parseInt(num1, 10) < parseInt(num2, 10)
    );
}

export function numberLessOrEqual(ns, num1, num2, finiteConstraint = true) {
    return (
        numberValid(ns, num1, finiteConstraint) &&
        numberValid(ns, num2, finiteConstraint) &&
        parseInt(num1, 10) <= parseInt(num2, 10)
    );
}

export function numberValid(ns, num, finiteConstraint = true) {
    return (num != undefined && !isNaN(num) && (finiteConstraint && isFinite(num)));
}

export function arrayEqual(ns, arr1, arr2) {
    return (JSON.stringify(arr1) === JSON.stringify(arr2));
}

export function entityTypeValid(ns, entityType) {
    let validEntityTypes = ["company","faction"];
    return (entityType != undefined && validEntityTypes.includes(entityType));
}
