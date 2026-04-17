export const servicePackages = [
  {
    id: 'maintenance',
    title: 'Maintenance Detail',
    price: '225 (sedans)',
    description: 'For commuters, base families, and daily drivers that already have a decent baseline, this keeps the vehicle sharp with premium upkeep instead of waiting for it to slide backward again.',
    bestFor: 'Premium maintenance: foam pre-wash, careful contact wash, wheels and tires reset, light interior wipe-down, clean glass, and a cleaner handoff that protects the baseline between heavier services.',
    themeStyle: 'blue' as const,
    features: [
      'Foam pre‑wash and two‑bucket contact wash',
      'Wheels and tires cleaned and dressed',
      'Door jambs wiped (light level)',
      'Interior vacuum and light wipe‑down of high‑touch areas',
      'Streak‑free glass inside and out',
      'Built to preserve the value of a clean baseline between resets'
    ],
    priceNote:
      'Typical price depends on vehicle size and buildup. Sedans start at $225. Larger vehicles and SUVs/trucks cost more. Final price is confirmed before work begins.'
  },
  {
    id: 'deep-reset',
    title: 'Deep Reset Detail',
    price: '400 (sedans)',
    description: 'For family haulers, commuter cars, and hard-used vehicles that have gotten away from you, this is the heavier reset built to restore the interior, paint feel, and overall handoff quality.',
    bestFor: 'Heavier restoration-focused detail: decontamination, deep wheel work, extraction where safe, steam-assisted interior resets, and protection-minded finishing that creates a real baseline again.',
    themeStyle: 'lime' as const,
    highlight: true,
    features: [
      'Pre‑wash foam and two‑bucket contact wash',
      'Iron remover and clay decontamination on paint',
      'Deep wheel and tire cleaning, including inner barrels',
      'Full interior vacuum plus crevice and brush work on plastics and seams',
      'Fabric seat and carpet cleaning with extraction, where safely possible',
      'Bissell upholstery extraction and McCulloch steam treatment where safely appropriate',
      'Interior plastic/trim protection',
      'Glass deep clean plus ceramic glass treatment'
    ],
    priceNote:
      'Typical price depends on size, condition, and buildup. Sedans start at $400. SUVs, trucks, and heavily soiled vehicles are priced higher. Final price is confirmed before work begins.'
  }
];
