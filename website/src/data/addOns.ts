export const detailAddOns = [
  {
    id: 'pet-hair',
    name: 'Excess Pet Hair',
    description: 'For heavy pet hair that needs extra extraction time.',
    price: 40,
  },
  {
    id: 'stain-odor',
    name: 'Heavy Stain / Odor Treatment',
    description: 'For spills, deep staining, or odor issues that require targeted treatment.',
    price: 65,
  },
  {
    id: 'engine-bay',
    name: 'Engine Bay Detail',
    description: 'Safe engine-bay cleaning and dress-down for a cleaner under-hood finish.',
    price: 35,
  },
  {
    id: 'headlight-restoration',
    name: 'Headlight Restoration',
    description: 'Improves clarity on oxidized or faded headlights.',
    price: 80,
  },
  {
    id: 'mobile-convenience',
    name: 'On-Island Mobile Convenience',
    description: 'We bring the setup to your Whidbey Island location when mobile service makes more sense than drop-off.',
    price: 45,
  },
  {
    id: 'seat-carpet-extraction',
    name: 'Seat / Carpet Extraction',
    description: 'For vehicles that need deeper fabric cleaning than a standard wipe-down and vacuum.',
    price: 55,
  },
  {
    id: 'trim-protection',
    name: 'Interior Trim Protection',
    description: 'Adds a cleaner, lower-sheen protective finish to interior plastics after cleaning.',
    price: 30,
  },
  {
    id: 'sealant-refresh',
    name: 'Exterior Sealant Refresh',
    description: 'Extra protection layer for customers who want stronger short-term defense against island weather.',
    price: 45,
  },
] as const;

export type DetailAddOn = (typeof detailAddOns)[number];
