export const servicePackages = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    price: '225 (sedans)',
    description: 'For commuters, base families, and daily drivers that are mostly fine but no longer feel clean, this gets the car back to sharp without turning a small problem into a full reset.',
    bestFor: 'Regular upkeep: foam wash + two-bucket, wheels and tires cleaned and dressed, light door jamb wipe, interior vacuum and light wipe, streak-free glass.',
    themeStyle: 'blue' as const,
    features: [
      'Foam pre‑wash and two‑bucket contact wash',
      'Wheels and tires cleaned and dressed',
      'Door jambs wiped (light level)',
      'Interior vacuum and light wipe‑down of high‑touch areas',
      'Streak‑free glass inside and out'
    ],
    priceNote:
      'Typical price depends on vehicle size and buildup. Sedans start at $225. Larger vehicles and SUVs/trucks cost more. Final price is confirmed before work begins.'
  },
  {
    id: 'deep-reset',
    title: 'Deep Reset',
    price: '400 (sedans)',
    description: 'For family haulers, commuter cars, and hard-used vehicles that have gotten away from you, this is the full reset that brings the interior and gloss back toward factory-fresh.',
    bestFor: 'One-time intensive detail: iron + clay decontamination, deep wheel and barrel cleaning, full interior vacuum and crevice/brush work, fabric extraction where safe, interior protection, ceramic glass treatment.',
    themeStyle: 'lime' as const,
    highlight: true,
    features: [
      'Pre‑wash foam and two‑bucket contact wash',
      'Iron remover and clay decontamination on paint',
      'Deep wheel and tire cleaning, including inner barrels',
      'Full interior vacuum plus crevice and brush work on plastics and seams',
      'Fabric seat and carpet cleaning with extraction, where safely possible',
      'Interior plastic/trim protection',
      'Glass deep clean plus ceramic glass treatment'
    ],
    priceNote:
      'Typical price depends on size, condition, and buildup. Sedans start at $400. SUVs, trucks, and heavily soiled vehicles are priced higher. Final price is confirmed before work begins.'
  }
];
