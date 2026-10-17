# Network design

[Back to project](../README.md) · [Build guide](build-guide.md) · [Evidence register](../evidence/README.md)

This document describes the original configuration scripts and the design documented in the group reports. The portfolio refinement preserves that design. Saved Packet Tracer device state has not been fully reconciled against the scripts.

## Topology and roles

![Documented cabling and addressing](../assets/topology.png)

The image is a cabling plan recovered from the Word report, not a photograph of deployed hardware. The [Mermaid source](../assets/topology.mmd) provides an editable topology representation; it is a separate diagram, not the source of the recovered PNG.

| Device | Model / type | Role |
|---|---|---|
| R1-INTERNAL | Cisco 2911 | VLAN gateways, DHCP, default route to R2 |
| R2-ISP | Cisco 2911 | Simulated ISP and return routing |
| SW1-DIST | Cisco 2960-24TT | Router-facing trunk, LACP bundle, preferred STP root |
| SW2-ACCESS | Cisco 2960-24TT | Guest and management access ports, LACP bundle |
| PC-STAFF / PC-STUDENT | PC-PT | DHCP clients on SW1 |
| PC-GUEST / PC-MGMT | PC-PT | DHCP clients on SW2 |
| EXT-SERVER | Server-PT | Static external test endpoint |

These models appear in the original topology screenshot; the lab was also opened in Packet Tracer 9.0.0.0810 during packaging. Full compatibility testing was not performed.

## VLANs and DHCP

R1 supplies a separate DHCP pool on each directly attached VLAN; no DHCP relay is required. All user subnets use `255.255.255.0`.

| VLAN | Name | Subnet | Gateway | DHCP range |
|---:|---|---|---|---|
| 10 | STAFF_ADMIN | 192.168.10.0/24 | 192.168.10.1 | 192.168.10.21–254 |
| 20 | STUDENT_USER | 192.168.20.0/24 | 192.168.20.1 | 192.168.20.21–254 |
| 30 | GUEST_PUBLIC | 192.168.30.0/24 | 192.168.30.1 | 192.168.30.21–254 |
| 99 | MANAGEMENT | 192.168.99.0/24 | 192.168.99.1 | 192.168.99.31–254 |
| 999 | UNUSED_NATIVE | No routed subnet | None | None |

Addresses `.1–.20` are excluded from user pools; `.1–.30` are excluded from the management pool. Leases need not begin at `.21` or `.31` on an already-used lab. Use each PC's actual `ipconfig` output when demonstrating connectivity.

The four pools retain `dns-server 8.8.8.8` from the assignment. A DHCP option does not establish DNS reachability: use numeric IP addresses for this lab's demonstrated routing scenario.

## Infrastructure addressing

| Device/interface | Address | Purpose |
|---|---|---|
| R1 G0/0.10 / .20 / .30 / .99 | Corresponding VLAN gateway above | Router-on-a-stick |
| R1 G0/0.999 | No IP; `dot1Q 999 native` | Matches native VLAN on SW1 |
| R1 G0/1 | 203.0.113.1/30 | Transit to R2 |
| R2 G0/0 | 203.0.113.2/30 | Transit to R1 |
| R2 G0/1 | 198.51.100.1/24 | External network gateway |
| SW1 VLAN 99 | 192.168.99.11/24 | Switch management |
| SW2 VLAN 99 | 192.168.99.12/24 | Switch management |
| EXT-SERVER | 198.51.100.10/24 | External test destination |

Both switches use `192.168.99.1` as their management default gateway; EXT-SERVER uses `198.51.100.1`.

## Cabling and switch ports

| Link | Interface A | Interface B | Mode |
|---|---|---|---|
| R1 ↔ SW1 | R1 G0/0 | SW1 G0/1 | 802.1Q trunk |
| SW1 ↔ SW2 | SW1 F0/23 | SW2 F0/23 | LACP member |
| SW1 ↔ SW2 | SW1 F0/24 | SW2 F0/24 | LACP member |
| R1 ↔ R2 | R1 G0/1 | R2 G0/0 | Routed transit |
| R2 ↔ EXT-SERVER | R2 G0/1 | Server NIC | Routed external LAN |
| PC-STAFF ↔ SW1 | PC NIC | SW1 F0/2 | Access VLAN 10 |
| PC-STUDENT ↔ SW1 | PC NIC | SW1 F0/3 | Access VLAN 20 |
| PC-GUEST ↔ SW2 | PC NIC | SW2 F0/2 | Access VLAN 30 |
| PC-MGMT ↔ SW2 | PC NIC | SW2 F0/3 | Access VLAN 99 |

Trunks allow VLANs `10,20,30,99,999` and use native VLAN `999`. F0/23–24 form Port-channel 1 with LACP active mode on both switches. Unused ports are access ports in VLAN 999 and administratively shut down.

## Routing and packet path

For a staff-to-student packet, PC-STAFF sends to its default gateway. SW1 carries VLAN 10 traffic to R1; R1 routes it to VLAN 20 and sends it back through the same physical trunk. SW1 delivers it to PC-STUDENT's access port.

For a guest-to-external packet, the path is **PC-GUEST → SW2 → Port-channel 1 → SW1 → R1 → R2 → EXT-SERVER**. R1's default route points to `203.0.113.2`. R2 has four explicit return routes for the internal `/24` networks via `203.0.113.1`.

Return routes are essential: reaching the external server is insufficient if replies cannot find the originating VLAN. No NAT is needed for this closed, explicitly routed simulation. Traceroute shows Layer 3 hops, not the two Layer 2 switches.

## Reliability choices

PVST is configured, with SW1 root primary for VLANs 10, 20, 30, and 99. STP treats the LACP bundle as one logical link. Seeing both member ports bundled does not demonstrate a separate STP alternate path or prove failover performance.

The two FastEthernet member links can distribute different traffic flows; a single flow is not guaranteed their combined bandwidth. One member can provide a remaining path if the other fails. R1, SW1, and the router-facing trunk remain single points of failure. The optional [failure walkthrough](demo-walkthrough.md#optional-link-failure-demonstration) is a procedure, not a recorded result.

## Security and limitations

| Configured control | Intended purpose | Limit |
|---|---|---|
| SSHv2 with local login on VTY 0–4 | Encrypted remote administration | No source ACL; all available VTY ranges were not audited |
| VLAN 99 management addressing | Separate management broadcast domain | No routed isolation from user VLANs |
| Sticky MAC, maximum 1, violation `restrict` | Limit endpoint MAC addresses | Violation behavior has no retained test evidence |
| PortFast and BPDU Guard on access ports | Fast endpoint startup and protection against unexpected BPDUs | Configuration is not proof of a triggered BPDU Guard event |
| Static trunking and DTP disabled | Explicit trunk/access role | Platform command support must be checked when rebuilding |
| Native VLAN 999 and restricted allowed list | Consistent trunk policy | Not an inter-VLAN firewall |
| Unused ports in VLAN 999 and shutdown | Disable unused access points | Does not protect active ports by itself |

EtherChannel member ports explicitly disable PortFast and BPDU Guard. Staff/student and guest/management communication are intentionally allowed by the baseline tests; VLAN segmentation here means broadcast separation, not an enforced access policy.

The scripts preserve classroom credentials, 1024-bit RSA settings, and `service password-encryption`; these are not a modern production-security baseline. The fixed `clock set 12:00:00 2 July 2026` line is an assignment setting, not evidence of when a screenshot was captured. Packet Tracer clock state can also differ after reopening.
