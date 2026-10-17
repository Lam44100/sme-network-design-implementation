# A short tour of the network

[Back to project](../README.md) · [Existing evidence](../evidence/README.md) · [Build guide](build-guide.md)

Use this as a GitHub reading tour, a live presentation guide, or a 2–3-minute screen-recording storyboard. It does not require checking all four devices. No video or new failover capture is included in this edition.

## Show the project without running tests

1. Open the [topology diagram](../assets/topology.png). Point out the four user roles, R1's VLAN gateways, the two-link switch bundle, and the external server.
2. Follow a guest packet: **PC-GUEST → SW2 → SW1 → R1 → R2 → EXT-SERVER**. Explain that R2's return routes complete the round trip.
3. Open the [original SW2 trunk screenshot](../evidence/screenshots/report-sw2-trunk.png) and point out native VLAN 999 and allowed VLANs `10,20,30,99,999`.
4. Open the [original EtherChannel screenshot](../evidence/screenshots/report-sw2-etherchannel.png). Explain `Po1(SU)`, LACP, and both physical ports marked `(P)`. This shows the historical bundled state; it is not a recorded link-failure test.
5. End with one tradeoff: the bundle can provide a remaining member link, but R1 and SW1 are still single points of failure. Link the [case study](case-study.md) for more detail.

## Optional live demonstration

Open a copy of [the lab](../lab/enterprise-network.pkt) in Packet Tracer. Read the [access note](build-guide.md#lab-credentials-and-access) before relying on the saved device credentials. Use **Realtime** mode and let interfaces settle.

On **PC-GUEST → Desktop → Command Prompt**, run these commands one at a time:

```text
ipconfig
ping 192.168.30.1
ping 198.51.100.10
tracert 198.51.100.10
```

Explain the address, mask, and gateway shown by `ipconfig`. A correct address alone does not prove DHCP supplied it; DHCP mode and R1 bindings provide stronger evidence. A successful external ping from this PC exercises the inter-switch path and both routers. Traceroute exposes routed hops rather than the Layer 2 switches.

For a short inter-VLAN example, use PC-STUDENT's actual IP from `ipconfig` and ping it from PC-STAFF. The original tests also permit guest-to-management communication; do not describe that behavior as security isolation.

If presenting CLI output, choose only one switch and run `show etherchannel summary` and `show interfaces trunk` after entering privileged EXEC. If access or a command fails, explain the result or show the labelled historical screenshot instead of claiming the live test passed.

## Recording storyboard

| Time | Screen | Explanation |
|---|---|---|
| 0:00–0:25 | README and topology | “This group-project lab separates four user roles into VLANs and connects them to a simulated external network.” |
| 0:25–0:55 | PC-GUEST IP settings and `ipconfig`, or design table | Explain subnet, gateway, and the DHCP design; identify historical material when used |
| 0:55–1:30 | External ping/traceroute, if run | Follow the path through the switches and two routers; describe only the observed result |
| 1:30–2:00 | SW2 EtherChannel/trunk output or recovered evidence | Explain native/allowed VLANs and the two bundled member ports |
| 2:00–2:30 | Case study and evidence register | Explain one limitation and distinguish group implementation from portfolio refinements |

Record only the relevant Packet Tracer window. Keep text readable, hide unrelated windows and personal paths, and label original report screenshots as historical. Publish the recording link only after recording and checking it. This storyboard is ready to use without inventing a video URL or a successful result.

## Optional link-failure demonstration

This exercise is **not performed or measured in the retained evidence**. It changes only a disposable lab copy and can replace the EtherChannel segment of a longer presentation.

1. Save a copy outside the public repository. Confirm both members are bundled using `show etherchannel summary` on SW2 and establish a successful PC-GUEST-to-`198.51.100.10` baseline.
2. On SW2, enter:

   ```text
   configure terminal
   interface fastEthernet0/23
   shutdown
   end
   show etherchannel summary
   ```

3. Repeat the external ping from PC-GUEST. That PC is on SW2, so this path actually crosses the bundle. An ordinary staff-to-student ping on SW1 would not test it. Capture the actual member state and ping result, including any loss; do not promise zero loss or production convergence times.
4. Restore the member even if the test fails:

   ```text
   configure terminal
   interface fastEthernet0/23
   no shutdown
   end
   show etherchannel summary
   ```

5. Allow negotiation to settle. Confirm both members are bundled again and repeat the cross-switch ping. Do not save a failed or shutdown state over the distributed lab. Close the disposable copy without saving if restoration cannot be confirmed.

For other optional checks and evidence recording, see the [manual test guide](../tests/README.md).
