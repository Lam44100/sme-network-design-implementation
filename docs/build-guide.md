# Open or rebuild the lab

[Back to project](../README.md) · [Design and port map](design.md) · [Guided tour](demo-walkthrough.md)

## Open the existing project

Download and extract the repository, then use **File → Open** in Cisco Packet Tracer to select [enterprise-network.pkt](../lab/enterprise-network.pkt). Work on a copy when experimenting.

The original file opened in Packet Tracer **9.0.0.0810** on 16 October 2026. Opening the file confirms that this application can load it; the saved device configurations and end-to-end operation were not fully retested. The original authoring version is not established by the retained records.

Use Realtime mode and allow interfaces and switching protocols to settle. Green links indicate link state, not complete routing, DHCP, or security verification. Follow the [short demonstration](demo-walkthrough.md) or inspect [existing evidence](../evidence/README.md) without running a new test suite.

## Lab credentials and access

The **configuration scripts** define these public classroom credentials:

| Access | Credential |
|---|---|
| Console | `cisco` |
| Privileged EXEC (`enable`) | `class` |
| SSH | Username `admin`, password `admin` |

These values are examples for an isolated simulator, not real secrets to reuse elsewhere. During the limited opening check, a console attempt on R1 did not authenticate with the documented console password; its cause was not established and no credentials were changed. The saved `.pkt` has not been reconciled with the scripts, so do not assume its access settings match this table. If access differs, use a separate rebuild from the scripts instead of overwriting the supplied lab. Preserve the original for comparison.

## Rebuild from the configuration scripts

This is the documented build procedure, not a newly executed rebuild result.

1. Create a new Packet Tracer project with two **2911** routers, two **2960-24TT** switches, four **PC-PT** clients, and one **Server-PT**.
2. Name them exactly as shown in the [design](design.md#topology-and-roles).
3. Cable the nine links in the [port map](design.md#cabling-and-switch-ports). Use straight-through cables for PC-to-switch and router-to-switch links; use crossover or the automatic cable tool for like-device links and the direct router-to-server connection.
4. On fresh devices, answer `no` to the initial configuration dialog if shown. Enter the scripts in this order: [SW1](../configs/SW1-DIST.ios), [SW2](../configs/SW2-ACCESS.ios), [R1](../configs/R1-INTERNAL.ios), [R2](../configs/R2-ISP.ios).
5. Enter commands in manageable blocks. The files include `enable`, configuration-mode transitions, RSA generation, and the save command. Respond to interactive prompts before continuing; accept the default destination when `copy running-config startup-config` asks for it. On an already-configured device, authenticate before pasting the remaining commands.
6. On all four PCs, choose **Desktop → IP Configuration → DHCP**. On EXT-SERVER set `198.51.100.10`, mask `255.255.255.0`, and gateway `198.51.100.1`.
7. Save the new project under a different filename. If desired, run the [optional checks](../tests/README.md), save device startup configurations, and reopen your project to check persistence.

The configurations preserve the assignment's historical device-clock setting. Record the actual date of any new test in its evidence note; do not use the device clock as the capture timestamp.

## If a command is rejected

Check the device model, interface names, and the IOS `?` help first. Record the exact error and any adaptation in your own lab copy. Do not silently replace LACP with a static channel or change the topology just to suppress an error; those would change what the project demonstrates.

Some Packet Tracer versions implement only a subset of IOS commands. If a test's `| section` or combined `| include` filter is rejected, use the full `show running-config` output. If `terminal length 0` is unavailable, page through output using Space. Keep skipped or unsupported commands separate from successful results.

The scripts use `crypto key generate rsa general-keys modulus 1024`. If the model uses interactive RSA generation, consult its CLI help and record the accepted form. Never claim that generated keys or SSH access work solely because the command appears in a script.

## Troubleshooting reference

| Symptom | Inspect first |
|---|---|
| DHCP address missing or wrong | PC DHCP setting, access VLAN, allowed trunk VLANs, R1 subinterface, DHCP pool |
| Gateway works but another VLAN fails | Destination IP, subnet mask/default gateway, destination access VLAN, R1 subinterfaces |
| External ping fails | R1 default route, R2 return routes, external host gateway |
| EtherChannel member not bundled | Both ends' LACP mode, native/allowed VLANs, speed and duplex |
| SSH login fails | Documented versus saved credentials, SVI reachability, local user, domain, keys, VTY configuration |
| First ping loses a packet | Allow ARP resolution, then repeat; retain both attempts if recording results |

These are diagnostic suggestions. The report's historical troubleshooting narrative is discussed separately in the [case study](case-study.md#troubleshooting-recorded-in-the-original-report).
