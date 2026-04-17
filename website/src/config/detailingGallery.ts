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
];
