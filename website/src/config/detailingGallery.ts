export interface GallerySupportingImage {
  id: string;
  src: string;
  alt: string;
}

export interface DetailingGalleryItem {
  id: string;
  title: string;
  vehicle: string;
  serviceTag: string;
  summary: string;
  beforeImage: string;
  afterImage: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel: string;
  afterLabel: string;
  detailPoints: string[];
  supportingImages: GallerySupportingImage[];
}

export const detailingGallerySupportingImages: GallerySupportingImage[] = [
  {
    id: 'hood-dust-before',
    src: '/images/gallery/subaru-outback-hood-dust-before.jpg',
    alt: 'Dust sitting across the hood of a black Subaru Outback before detailing.',
  },
  {
    id: 'rear-glass-before',
    src: '/images/gallery/subaru-outback-rear-glass-before.jpg',
    alt: 'Dust and residue on the rear glass and paint of a Subaru Outback before detailing.',
  },
  {
    id: 'driver-cabin-after',
    src: '/images/gallery/subaru-outback-driver-cabin-after.jpg',
    alt: 'Clean Subaru Outback driver cabin after the interior reset.',
  },
  {
    id: 'console-after',
    src: '/images/gallery/subaru-outback-console-after.jpg',
    alt: 'Clean Subaru Outback center console after the detailing reset.',
  },
  {
    id: 'wheel-after',
    src: '/images/gallery/subaru-outback-wheel-after.jpg',
    alt: 'Clean Subaru Outback wheel after the detailing reset.',
  },
  {
    id: 'garage-front-after',
    src: '/images/gallery/subaru-outback-full-wheel-after.jpg',
    alt: 'Clean Subaru Outback front angle in the garage after detailing.',
  },
  {
    id: 'garage-rear-after',
    src: '/images/gallery/subaru-outback-cargo-after.jpg',
    alt: 'Clean Subaru Outback rear angle in the garage after detailing.',
  },
];

export const detailingGalleryItems: DetailingGalleryItem[] = [
  {
    id: 'rear-floor-reset',
    title: 'Rear floor reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Interior reset',
    summary: 'Pet hair, debris, and buildup cleared out so the rear cabin feels clean again.',
    beforeImage: '/images/gallery/subaru-outback-rear-floor-before.jpg',
    afterImage: '/images/gallery/subaru-outback-rear-floor-after.jpg',
    beforeAlt: 'Dirty rear floor area in a Subaru Outback with visible pet hair and debris before detailing.',
    afterAlt: 'Clean rear floor area in the Subaru Outback after the detailing reset.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Lifted pet hair and loose debris from the rear footwell.',
      'Restored the carpeted area to a clean baseline for everyday use.',
      'Finished with a sharper, more intentional interior handoff.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'wheel-after'),
  },
  {
    id: 'center-console-reset',
    title: 'Center console reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Storage reset',
    summary: 'Storage area cleared, cleaned, and handed back ready for normal use.',
    beforeImage: '/images/gallery/subaru-outback-console-before.jpg',
    afterImage: '/images/gallery/subaru-outback-console-after.jpg',
    beforeAlt: 'Center console storage area in a Subaru Outback filled with loose items before detailing.',
    afterAlt: 'Clean Subaru Outback center console after the storage area was reset.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Removed clutter and wiped down high-touch interior surfaces.',
      'Cleaned the storage well so it felt ready to use again right away.',
      'Brought the console area back in line with the rest of the cabin.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'wheel-after'),
  },
  {
    id: 'wheel-detail-reset',
    title: 'Wheel detail reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Exterior finish',
    summary: 'Heavy brake dust and road film cleaned off for a noticeably sharper finish.',
    beforeImage: '/images/gallery/subaru-outback-wheel-before.jpg',
    afterImage: '/images/gallery/subaru-outback-wheel-after.jpg',
    beforeAlt: 'Subaru Outback wheel covered in brake dust and road film before detailing.',
    afterAlt: 'Finished Subaru Outback wheel after brake dust and road film were removed.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Cut through built-up brake dust and road grime on the face of the wheel.',
      'Brought back contrast in the finish for a cleaner exterior handoff.',
      'Helped the whole vehicle read cleaner at a glance.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'wheel-after'),
  },
];
