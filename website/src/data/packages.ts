export const servicePackages = [
  {
    id: 'maintenance',
    title: 'Maintenance',
    price: '99',
    description: 'A thorough inside-out refresh to keep your daily driver looking crisp.',
    themeStyle: 'blue' as const,
    features: [
      'Foam hand wash',
      'Wheel and tire clean',
      'Door jambs wiped',
      'Interior vacuum and light wipe-down',
      'Streak-free glass inside and out'
    ]
  },
  {
    id: 'deep-reset',
    title: 'Deep Reset',
    price: '199',
    description: 'Our signature detail. Restores your interior and gloss back toward factory fresh.',
    themeStyle: 'lime' as const,
    highlight: true,
    features: [
      'Pre-wash and two-bucket contact wash',
      'Iron/fallout and clay decontamination on paint',
      'Thorough interior vacuum, crevice work, and wipe-down',
      'Stain treatment on seats and carpets (as safely possible)',
      'Protective sealant on paint, plastics, and wheels'
    ]
  },
  {
    id: 'new-car',
    title: 'New Car Protection',
    price: '349',
    description: 'Perfect for new or newly-detailed vehicles. Adds gloss and protection against the PNW elements.',
    themeStyle: 'purple' as const,
    features: [
      'Deep exterior clean and decontamination',
      'Light one-step gloss enhancement polish (no heavy correction)',
      'Durable 1-year paint sealant applied to painted surfaces',
      'Wheel faces and glass protected'
    ]
  }
];
