/* Explanatory model of the documented design, not an IOS or Packet Tracer emulator. */
(function (root) {
  'use strict';
  const devices = {
    staff: { name: 'PC-STAFF', type: 'Endpoint', vlan: 10, address: 'DHCP · 192.168.10.21–254', gateway: '192.168.10.1', connection: 'SW1 F0/2', detail: 'Staff endpoint in its own broadcast domain.' },
    student: { name: 'PC-STUDENT', type: 'Endpoint', vlan: 20, address: 'DHCP · 192.168.20.21–254', gateway: '192.168.20.1', connection: 'SW1 F0/3', detail: 'Student endpoint. R1 routes traffic between this VLAN and the other VLANs.' },
    guest: { name: 'PC-GUEST', type: 'Endpoint', vlan: 30, address: 'DHCP · 192.168.30.21–254', gateway: '192.168.30.1', connection: 'SW2 F0/2', detail: 'Guest traffic crosses the inter-switch bundle to reach R1. The baseline has no guest isolation ACL.' },
    management: { name: 'PC-MGMT', type: 'Endpoint', vlan: 99, address: 'DHCP · 192.168.99.31–254', gateway: '192.168.99.1', connection: 'SW2 F0/3', detail: 'Management endpoint. A separate VLAN does not prevent other routed VLANs from reaching it.' },
    sw1: { name: 'SW1-DIST', type: 'Cisco 2960-24TT', address: '192.168.99.11/24', gateway: '192.168.99.1', connection: 'G0/1 → R1 · F0/23–24 → SW2', detail: 'Distribution switch, documented PVST root primary for VLANs 10, 20, 30 and 99. Switches at Layer 2; R1 handles inter-VLAN routing.' },
    sw2: { name: 'SW2-ACCESS', type: 'Cisco 2960-24TT', address: '192.168.99.12/24', gateway: '192.168.99.1', connection: 'F0/23–24 → SW1', detail: 'Access switch for guest and management PCs. Two LACP member links form one logical Port-channel 1 trunk.' },
    r1: { name: 'R1-INTERNAL', type: 'Cisco 2911', address: 'VLAN gateways .1 · WAN 203.0.113.1/30', gateway: 'Default route → 203.0.113.2', connection: 'G0/0 → SW1 · G0/1 → R2', detail: 'Router-on-a-stick gateway and DHCP server. Routes internal VLANs through subinterfaces on one physical trunk.' },
    r2: { name: 'R2-ISP', type: 'Cisco 2911', address: '203.0.113.2/30 · 198.51.100.1/24', gateway: 'Internal return routes → 203.0.113.1', connection: 'G0/0 → R1 · G0/1 → server', detail: 'Simulated ISP. Four static routes send replies back to the internal VLANs through R1. No real Internet connection is represented.' },
    external: { name: 'EXT-SERVER', type: 'Server-PT', address: '198.51.100.10/24', gateway: '198.51.100.1', connection: 'R2 G0/1', detail: 'Static external test endpoint. The documented demonstration uses IP-based ping and traceroute, not DNS or a web service.' }
  };
  const endpoints = ['staff', 'student', 'guest', 'management', 'external'];
  const toRouter = {
    staff: ['staff', 'sw1', 'r1'], student: ['student', 'sw1', 'r1'],
    guest: ['guest', 'sw2', 'sw1', 'r1'], management: ['management', 'sw2', 'sw1', 'r1'],
    external: ['external', 'r2', 'r1']
  };
  function route(source, destination, members = [true, true], reply = false) {
    if (!endpoints.includes(source) || !endpoints.includes(destination)) throw new Error('Choose a known endpoint.');
    if (members.length !== 2 || members.some(value => typeof value !== 'boolean')) throw new Error('Two Boolean member states are required.');
    let nodes = source === destination ? [source] : [...toRouter[source], ...toRouter[destination].slice(0, -1).reverse()];
    if (reply) nodes = nodes.slice().reverse();
    const crossesBundle = nodes.some((node, i) => i && [node, nodes[i - 1]].sort().join('-') === 'sw1-sw2');
    const activeMembers = members.filter(Boolean).length;
    return { source, destination, reply, nodes, crossesBundle, activeMembers, reachable: !crossesBundle || activeMembers > 0, local: source === destination };
  }
  function explain(result, index) {
    const id = result.nodes[index];
    if (!id) throw new Error('Step is outside the route.');
    if (result.local) return 'The source and destination are the same endpoint. No network link is needed.';
    if (index === 0) return `${devices[id].name} sends toward its default gateway, ${devices[id].gateway}. This is a conceptual packet walk, not an executed ping.`;
    if (index === result.nodes.length - 1) return `${devices[id].name} is the destination of this ${result.reply ? 'reply' : 'forward'} path. Actual delivery requires a working lab; this page does not test it.`;
    if (id === 'r1') {
      const next = result.nodes[index + 1];
      return next === 'r2' ? 'R1 uses its default route: 0.0.0.0/0 via 203.0.113.2. The packet leaves G0/1 toward the simulated ISP.' : 'R1 selects the destination VLAN’s connected subnet and sends through its 802.1Q subinterface. Inter-VLAN routing is permitted in the baseline; there is no filtering ACL.';
    }
    if (id === 'r2') return result.nodes[index + 1] === 'r1' ? 'R2 uses the internal /24 return route via 203.0.113.1. A return route is necessary for the round trip.' : 'R2 forwards onto its connected external LAN, 198.51.100.0/24, through G0/1.';
    const previous = result.nodes[index - 1], next = result.nodes[index + 1];
    if ([previous, next].includes(id === 'sw1' ? 'sw2' : 'sw1')) return `${devices[id].name} switches the tagged VLAN traffic across Port-channel 1. ${result.activeMembers} member link${result.activeMembers === 1 ? ' is' : 's are'} enabled in this illustration; one flow does not use both links at once.`;
    return `${devices[id].name} switches within the VLAN between an access port and the R1 trunk. The switch does not route between VLANs.`;
  }
  const model = { devices, endpoints, route, explain };
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.NetworkModel = model;
})(typeof globalThis === 'object' ? globalThis : this);
