# Optional manual checks

[Back to project](../README.md) · [Evidence and status](../evidence/README.md) · [Short demonstration](../docs/demo-walkthrough.md)

These are the original manual command sequences, retained for someone who wants to explore or rebuild the lab. They are not automated tests and their presence does not mean they have been run. Device-by-device retesting was skipped during portfolio refinement; the evidence register is the single source of result status.

## Choose a small demonstration

The [guided tour](../docs/demo-walkthrough.md) uses PC-GUEST to show addressing and the external packet path, then explains one switch's EtherChannel output. There is no need to run every file to understand the project. You can also use the labelled historical screenshots without device access.

## Full command reference

| Target | File | Inspect |
|---|---|---|
| Internal PCs and external endpoint | [PC-tests.md](PC-tests.md) | Addresses, gateways, inter-VLAN and external reachability |
| R1-INTERNAL | [R1 commands](R1-INTERNAL-tests.ios) | VLAN subinterfaces, DHCP pools/bindings, default route |
| R2-ISP | [R2 commands](R2-ISP-tests.ios) | Transit/external interfaces and return routes |
| SW1-DIST | [SW1 commands](SW1-DIST-tests.ios) | VLANs, trunks, LACP, STP, access-port settings |
| SW2-ACCESS | [SW2 commands](SW2-ACCESS-tests.ios) | VLANs, trunks, LACP, STP, access-port settings |

Open the matching device CLI, authenticate if necessary, and enter commands individually. The scripts start with `enable`; complete that prompt before proceeding. They contain read-only inspection and diagnostic commands, plus terminal pagination settings. See the [build guide](../docs/build-guide.md#lab-credentials-and-access) for the documented script credentials and the unresolved saved-lab access caveat.

Use actual DHCP addresses instead of assuming `.21` or `.31`. Packet Tracer PCs use `tracert`; router CLI uses `traceroute`. If filters or `terminal length 0` are unsupported, use full output and page through it. Do not mark an unsupported command successful.

## Interpret results precisely

| Check | Expected observation | What it does not establish |
|---|---|---|
| PC address and DHCP binding | Correct subnet, gateway, excluded-range handling, and matching lease | Address alone does not prove DHCP delivery |
| Gateway/remote ping | Reply from the specified endpoint | Pinging R1's own subinterface does not prove a client path |
| Traceroute | Routed path toward the external server | Switches do not appear as IP hops |
| `show vlan brief` | Correct VLANs and access-port assignments | Active trunk membership is checked separately |
| `show interfaces trunk` | Native 999, expected VLAN list, trunk forwarding | Does not prove reachability of every endpoint |
| `show etherchannel summary` | Po1 up/in use, both members bundled with LACP | Does not prove failover was tested |
| `show spanning-tree vlan ...` | Expected root and port roles per VLAN | Root configuration alone does not establish current election state |
| `show port-security interface ...` | Intended maximum, sticky learning, and violation mode | Does not prove an unauthorized MAC was blocked |
| `show clock` | Device clock state | Historical script date is not the actual capture date |

For an optional SSH check from PC-MGMT, use `ssh -l admin 192.168.99.11` and the documented lab credential only if it matches your copy. A successful session is stronger evidence than an `ip ssh version 2` configuration line. No successful SSH login is claimed in the current evidence register.

The original scripts include filtered security settings in their output; those are configuration inspection. They do not trigger port-security or BPDU Guard events. The [optional member-link failure exercise](../docs/demo-walkthrough.md#optional-link-failure-demonstration) is separate because it temporarily changes interface state.

Record any new observations using the [evidence instructions](../evidence/README.md#adding-evidence-later). Keep original report evidence separate from new captures.
