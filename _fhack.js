/** @param {NS} ns */
export async function main(ns) {
    const target = ns.args[0],
        delay = ns.args[1];
    await ns.sleep(delay);
    await ns.hack(target);
}