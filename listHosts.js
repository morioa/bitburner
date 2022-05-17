/** @param {NS} ns **/
export function listHosts(ns, host, hostList) {
	if (hostList.indexOf(host) == -1) {
		hostList.push(host);
		ns.scan(host).forEach(host => listHosts(ns, host, hostList));
	}
	return hostList;
}