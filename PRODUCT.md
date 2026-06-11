# Product

## Register

product

## Users

Attendees of the 3HO Summer Solstice Sadhana festival, June 19–27, 2026, at Ram Das Puri (near Española, New Mexico). A multigenerational, international community (program labels activities in English and Spanish). They use the app on their phones while walking around an outdoor camp: direct high-desert sunlight, dusty hands, often one-handed, with limited connectivity and battery that must last days between charges.

Job to be done: "What's happening now or next, where is it, and which sessions do I want to attend?" Secondary jobs: look up camp logistics (meals, showers, first aid, code of conduct), find a venue on the map, review White Tantric Yoga guidelines.

## Product Purpose

An offline-first PWA companion guide for the festival. It replaces the printed booklet with a searchable program (119 activities), local favorites and personal agenda (IndexedDB), an offline info hub, and a zoomable camp map. There is no backend and no login; everything works on the device once installed to the home screen.

Success looks like: an attendee answers a schedule/where/how question in under ten seconds, offline, in full sunlight, without losing their saved agenda.

## Brand Personality

Serene and luminous. Calm, clear, generous whitespace; spiritual but restrained. The celebration ("Chardi Kala — A Celebration of Joy") comes from the content itself — teacher names and photos, mantras, the rhythm of the days — not from decorative effects. Three words: serene, luminous, trustworthy.

## Anti-references

- Festival-hype aesthetics: stacked gradients, glassmorphism on every card, neon saturation, decorative blur orbs.
- Corporate SaaS dashboard styling: metric heroes, gradient CTAs, growth-marketing copy.
- New-age visual clutter: low-contrast pastel-on-pastel text, mystical ornamentation, busy backgrounds competing with content.

## Design Principles

1. **Sunlight-first legibility.** High contrast beats elegance. Muted grays and translucent surfaces fail outdoors; text earns its darkness.
2. **Offline is the product.** Never regress the installed offline flow. All state is local; cache versions bump with every visible change.
3. **Calm hierarchy.** One focal point per screen. The schedule is the star; chrome and decoration recede.
4. **Thumb-first.** Primary actions live in the bottom half of the screen; touch targets are at least 44×44px; one-handed use is the default.
5. **Battery respect.** Minimal animation, no expensive blur/filters at scroll time, light assets. The device must survive a week of camp.

## Accessibility & Inclusion

- WCAG AA contrast (4.5:1 body text, 3:1 large text) — treated as a floor, not a target, because of outdoor sunlight use.
- Multigenerational readability: generous base type sizes, no critical info below 14px.
- Touch targets ≥44×44px with spacing between adjacent targets.
- `prefers-reduced-motion` respected on any animation.
- Fully functional offline once added to the home screen (the install hint is a first-class flow).
- Preserve 3HO terminology exactly: WTY®, White Tantric Yoga®, Sadhana, Gurdwara, Ram Das Puri.
