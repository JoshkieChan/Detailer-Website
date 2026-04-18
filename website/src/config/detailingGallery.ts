export interface DetailingGalleryItem {
  id: string;
  title: string;
  support: string;
  beforeLabel: string;
  afterLabel: string;
  beforeImage?: string;
  afterImage?: string;
}

export const detailingGalleryItems: DetailingGalleryItem[] = [
  {
    id: 'daily-driver-reset',
    title: 'Daily Driver Reset',
    support: 'Placeholder slide ready for real before/after images from the studio.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'family-hauler-refresh',
    title: 'Family Hauler Refresh',
    support: 'Use this slot for heavier interior resets once owner photos are added.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'maintenance-return',
    title: 'Maintenance Return Visit',
    support: 'Use this slot for upkeep results that show how the baseline stays sharp.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'interior-deep-reset',
    title: 'Interior Deep Reset',
    support: 'Heavy carpet extraction and steam cleaning for a true baseline.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'exterior-decon-clay',
    title: 'Exterior Decontamination',
    support: 'Deep cleaning and mechanical decon (clay) before protection.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'paint-correction-light',
    title: 'Machine Polish Enhancement',
    support: 'Removing light swirls to bring back clarity and depth.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'ceramic-spray-boost',
    title: 'Ceramic Coating Maintenance',
    support: 'Boosting slickness and water behavior on a previously coated vehicle.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'wheel-well-arch-detailing',
    title: 'Wheel Well & Arch Detail',
    support: 'Cleaning the areas most people skip for a factory-fresh look.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'leather-restoration-treatment',
    title: 'Leather Restoration',
    support: 'Deep cleaning and conditioning of high-traffic seat surfaces.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
  {
    id: 'engine-bay-aesthetics',
    title: 'Engine Bay Aesthetic Wipe-Down',
    support: 'A cleaner look for the parts of the car you rarely see.',
    beforeLabel: 'Before',
    afterLabel: 'After',
  },
];
