export const servicePackages = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    price: '225 (sedans)',
    description: 'For commuters, base families, and daily drivers that are mostly fine but no longer feel clean, this gets the car back to sharp without turning a small problem into a full reset.',
    bestFor: 'Vehicles with light dirt, light interior buildup, and owners who want routine upkeep before crumbs, dust, and road film get out of hand.',
    themeStyle: 'blue' as const,
    features: [
      'Foam hand wash',
      'Wheels and tires cleaned',
      'Door jambs wiped',
      'Interior vacuum and light wipe-down',
      'Streak-free glass inside and out'
    ],
    priceNote:
      'Typical price depends on vehicle size and buildup. Sedans start at $225. Larger vehicles and SUVs/trucks cost more. Final price is confirmed before work begins.'
  },
  {
    id: 'deep-reset',
    title: 'Deep Reset',
    price: '400 (sedans)',
    description: 'For family haulers, commuter cars, and hard-used vehicles that have gotten away from you, this is the full reset that brings the interior and gloss back toward factory-fresh.',
    bestFor: 'Vehicles with noticeable grime, neglected cracks and crevices, light stains, or interiors that need a real baseline reset before maintenance makes sense again.',
    themeStyle: 'lime' as const,
    highlight: true,
    features: [
      'Pre-wash foam and two-bucket contact wash',
      'Iron remover and clay decontamination on paint',
      'Full interior vacuum, crevice work, and thorough wipe-down',
      'Fabric seat and carpet cleaning with extraction, as safely possible',
      'Short-term spray protection on paint and wheels for improved gloss and easier washing'
    ],
    priceNote:
      'Typical price depends on size, condition, and buildup. Sedans start at $400. SUVs, trucks, and heavily soiled vehicles are priced higher. Final price is confirmed before work begins.'
  }
];
