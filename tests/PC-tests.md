# Packet Tracer PC Test Commands

These are optional manual procedures, not fresh test results. The original reports record successful PC tests, but raw endpoint outputs were not retained. See the [evidence register](../evidence/README.md) for status and the [guided tour](../docs/demo-walkthrough.md) for a shorter demonstration.

Run these from each PC: `Desktop > Command Prompt`.

## PC-STAFF, VLAN 10

Expected DHCP range: `192.168.10.21` through `192.168.10.254`  
Expected gateway: `192.168.10.1`

```text
ipconfig
ping 192.168.10.1
ping 192.168.20.21
ping 198.51.100.10
tracert 198.51.100.10
```

If PC-STUDENT did not receive `192.168.20.21`, replace `192.168.20.21` with the actual PC-STUDENT IP address.

## PC-STUDENT, VLAN 20

Expected DHCP range: `192.168.20.21` through `192.168.20.254`  
Expected gateway: `192.168.20.1`

```text
ipconfig
ping 192.168.20.1
ping 192.168.10.21
ping 198.51.100.10
tracert 198.51.100.10
```

If PC-STAFF did not receive `192.168.10.21`, replace `192.168.10.21` with the actual PC-STAFF IP address.

## PC-GUEST, VLAN 30

Expected DHCP range: `192.168.30.21` through `192.168.30.254`  
Expected gateway: `192.168.30.1`

```text
ipconfig
ping 192.168.30.1
ping 192.168.99.31
ping 198.51.100.10
tracert 198.51.100.10
```

If PC-MGMT did not receive `192.168.99.31`, replace `192.168.99.31` with the actual PC-MGMT IP address.

## PC-MGMT, VLAN 99

Expected DHCP range: `192.168.99.31` through `192.168.99.254`  
Expected gateway: `192.168.99.1`

```text
ipconfig
ping 192.168.99.1
ping 192.168.30.21
ping 192.168.99.11
ping 192.168.99.12
ping 198.51.100.10
tracert 198.51.100.10
```

If PC-GUEST did not receive `192.168.30.21`, replace `192.168.30.21` with the actual PC-GUEST IP address.

## EXT-SERVER or EXT-PC

Use static addressing:

```text
IP address: 198.51.100.10
Subnet mask: 255.255.255.0
Default gateway: 198.51.100.1
```

Then run:

```text
ipconfig
ping 198.51.100.1
ping 203.0.113.1
ping 192.168.10.1
ping 192.168.20.1
ping 192.168.30.1
ping 192.168.99.1
```

## Pass/Fail Interpretation

- DHCP test passes if every internal PC is in DHCP mode and receives an address, mask, and gateway appropriate to its VLAN; match the lease to R1's DHCP binding output when recording evidence.
- Gateway test passes if each PC can ping its own default gateway.
- Inter-VLAN test passes if VLAN 10 can ping VLAN 20, and VLAN 30 can ping VLAN 99.
- External routing test passes if an internal PC can ping and trace route to `198.51.100.10`.
- Management test passes if PC-MGMT can ping `192.168.99.11` and `192.168.99.12`.

Guest-to-management reachability is an expected baseline behavior, not an enforced isolation policy. The external destination is simulated; these tests do not demonstrate Internet or DNS access. Initial ARP resolution can affect an early ping; report the actual attempts and any retries.
