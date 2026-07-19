# Campsite local network + edge server

High-priority R&D track. Connectivity at Ram Das Puri is poor, but the app needs to
deliver updates, notifications, and messaging **during the event**. The model is the
one used on cruise ships and airplanes: an on-site local network with a local server
that serves and syncs content even when there is no internet.

> Status: R&D / design. No implementation yet. This doc defines the target
> architecture so backend and sync decisions ([BACKEND.md](BACKEND.md)) account for it
> from the start.

## Problem

- Cell and internet coverage at camp is unreliable.
- Attendees still need: current/updated program, announcements, notifications, messaging,
  and work-group communication — throughout the week.
- Cloud push (APNs/FCM) and cloud APIs require internet and will frequently be unavailable.

## Target architecture

```
                 (intermittent internet)
   Cloud backend  <───────────────────────┐
   (source of truth)                       │  store-and-forward sync
                                           │  when internet is available
                                           ▼
                             ┌───────────────────────────┐
                             │  Camp edge server (on-site)│
                             │  - local API + content     │
                             │  - local realtime (WS/SSE) │
                             │  - replica DB / cache       │
                             └─────────────┬──────────────┘
                                           │  camp Wi-Fi
                 ┌─────────────┬───────────┼───────────┬─────────────┐
              Router A      Router B     Router C    Router D     ... (mesh around camp)
                 │             │            │            │
              attendee     attendee     attendee     attendee   devices (native app / PWA)
```

- **Mesh of routers** around the camp providing Wi-Fi coverage (e.g. OpenWRT / commodity
  mesh APs) on one SSID.
- **Edge server**: a small always-on box on the camp LAN (mini PC / Raspberry Pi class),
  running a local instance of the backend API + a replica/cache of the current event's
  data + a local realtime channel.
- Devices prefer the **local edge server** when the internet path is down, and fall back
  to (or reconcile with) the **cloud** when internet is available.

## How the app uses it

1. **Discovery.** On launch / network change, the app resolves a base URL in order:
   - cloud API (if reachable),
   - the camp edge server, discovered via a fixed local hostname (e.g. `http://solstice.local`
     via mDNS/Bonjour), a fixed LAN IP, DHCP option, or a captive-portal handshake.
   - fully offline (local cache only).
2. **Content updates.** Program changes, announcements, teacher/menu updates are pulled
   from whichever server answers, using the same versioned-bundle mechanism as the cloud.
3. **Notifications on LAN.** Since APNs/FCM need internet, on-site notifications use:
   - an in-app **realtime connection** (WebSocket/SSE) to the edge server for live
     announcements while the app is open, and
   - **locally scheduled notifications** (Capacitor Local Notifications) derived from the
     synced agenda/announcements so reminders fire even with the app closed and no internet.
4. **Messaging / work groups.** Messages send to the edge server, which relays on the LAN
   in realtime and **store-and-forwards** to the cloud when internet returns (and vice
   versa), so conversations survive connectivity gaps.

## Sync & consistency

- Cloud is the **canonical** source of truth; the edge server holds a working replica for
  the active event.
- **Bidirectional store-and-forward**: edge ⇄ cloud reconcile opportunistically when
  internet is present.
- Conflict policy: last-write-wins per record initially; consider per-field merge or CRDTs
  for messaging if ordering/duplication becomes a problem.
- Content flows cloud → edge → device; user-generated data (messages, registrations,
  agenda) flows device → edge → cloud.

## Onboarding attendees

- Captive-portal landing page on the camp Wi-Fi that points to install/open the app and
  explains "you're on camp network — updates work here without cell signal."
- Clear in-app indicator of the current connection mode: **Internet / Camp network / Offline**.

## Hardware / ops (to scope)

- Router/mesh hardware and coverage plan for the camp footprint.
- Edge server hardware, power (solar/generator resilience), and physical security.
- Bandwidth of the camp's uplink (if any) for edge↔cloud reconciliation windows.
- Who operates it on-site during the event.

## Open decisions

- Discovery mechanism (mDNS vs fixed IP vs captive portal — likely a combination).
- Whether the edge server runs the same backend platform as the cloud or a purpose-built
  lightweight relay.
- Security model on the LAN (auth still required; no impersonation over local network).
- Scale target (expected simultaneous devices at peak).
