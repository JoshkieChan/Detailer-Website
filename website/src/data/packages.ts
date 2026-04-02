export const servicePackages = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    price: '99',
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
      'Typical price depends on vehicle size, condition, and buildup. Smaller, well-kept vehicles stay closer to the starting point; larger or harder-used vehicles land higher. Final price is confirmed before work begins.'
  },
  {
    id: 'deep-reset',
    title: 'Deep Reset',
    price: '199',
    description: 'For family haulers, commuter cars, and hard-used vehicles that have gotten away from you, this is the full reset that brings the interior and gloss back toward factory-fresh.',
    bestFor: 'Vehicles with noticeable grime, neglected cracks and crevices, light stains, or interiors that need a real baseline reset before maintenance makes sense again.',
    themeStyle: 'lime' as const,
    highlight: true,
    features: [
      'Pre-wash and two-bucket contact wash',
      'Iron and clay decontamination on paint',
      'Full interior vacuum, crevice work, and wipe-down',
      'Stain treatment on seats and carpets, as safely possible',
      'Sealant on paint, plastics, and wheels'
    ],
    priceNote:
      'Typical price depends on size, condition, pet hair, and stain level. Cleaner sedans stay closer to the starting point; larger vehicles and heavier buildup run higher. Final price is confirmed before work begins.'
  },
  {
    id: 'new-car',
    title: 'New Car Protection',
    price: '349',
    description: 'For new purchases, freshly detailed vehicles, and owners who want to stay ahead of Oak Harbor weather, this locks in gloss and makes routine cleanup easier.',
    bestFor: 'New or already-clean vehicles that do not need heavy correction but do need a stronger protection step before daily driving takes its toll.',
    themeStyle: 'purple' as const,
    features: [
      'Deep exterior clean and decontamination',
      'Light one-step gloss polish, no heavy correction',
      'Durable 1-year paint sealant applied to painted surfaces',
      'Wheel faces and glass protected'
    ],
    priceNote:
      'Typical price depends on vehicle size and how much prep the paint needs before protection goes on. Cleaner, smaller vehicles stay closer to the starting point; larger vehicles or surfaces needing more prep run higher. Final price is confirmed before work begins.'
  }
];
