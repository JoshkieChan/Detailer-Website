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
    id: 'hero-image',
    src: '/images/gallery/section-3-after.png',
    alt: 'Featured detailing result',
  },
  {
    id: 'grid-1',
    src: '/images/gallery/grid-1.jpg',
    alt: 'Front cabin area',
  },
  {
    id: 'grid-2',
    src: '/images/gallery/grid-2.jpg',
    alt: 'Cargo area',
  },
  {
    id: 'grid-3',
    src: '/images/gallery/grid-3.jpg',
    alt: 'Driver controls',
  },
  {
    id: 'grid-4',
    src: '/images/gallery/grid-4.jpg',
    alt: 'Rear seat area',
  },
  {
    id: 'grid-5',
    src: '/images/gallery/grid-5.jpg',
    alt: 'Exterior side profile',
  },
  {
    id: 'grid-6',
    src: '/images/gallery/grid-6.png',
    alt: 'Wheel close-up',
  },
];

export const detailingGalleryItems: DetailingGalleryItem[] = [
  {
    id: 'rear-floor-reset',
    title: 'Rear floor reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Interior reset',
    summary: 'Pet hair, debris, and buildup cleared out so the rear cabin feels clean again.',
    beforeImage: '/images/gallery/section-1-before.jpg',
    afterImage: '/images/gallery/section-1-after.png',
    beforeAlt: 'Dirty rear floor area in a Subaru Outback with visible pet hair and debris before detailing.',
    afterAlt: 'Clean rear floor area in the Subaru Outback after the detailing reset.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Lifted pet hair and loose debris from the rear footwell.',
      'Restored the carpeted area to a clean baseline for everyday use.',
      'Finished with a sharper, more intentional interior handoff.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'grid-1'),
  },
  {
    id: 'center-console-reset',
    title: 'Center console reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Storage reset',
    summary: 'Storage area cleared, cleaned, and handed back ready for normal use.',
    beforeImage: '/images/gallery/section-2-before.jpg',
    afterImage: '/images/gallery/section-2-after.jpg',
    beforeAlt: 'Center console storage area in a Subaru Outback filled with loose items before detailing.',
    afterAlt: 'Clean Subaru Outback center console after the storage area was reset.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Removed clutter and wiped down high-touch interior surfaces.',
      'Cleaned the storage well so it felt ready to use again right away.',
      'Brought the console area back in line with the rest of the cabin.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'grid-1'),
  },
  {
    id: 'wheel-detail-reset',
    title: 'Wheel detail reset',
    vehicle: 'Subaru Outback',
    serviceTag: 'Exterior finish',
    summary: 'Heavy brake dust and road film cleaned off for a noticeably sharper finish.',
    beforeImage: '/images/gallery/section-3-before.jpg',
    afterImage: '/images/gallery/section-3-after.png',
    beforeAlt: 'Subaru Outback wheel covered in brake dust and road film before detailing.',
    afterAlt: 'Finished Subaru Outback wheel after brake dust and road film were removed.',
    beforeLabel: 'Before',
    afterLabel: 'After',
    detailPoints: [
      'Cut through built-up brake dust and road grime on the face of the wheel.',
      'Brought back contrast in the finish for a cleaner exterior handoff.',
      'Helped the whole vehicle read cleaner at a glance.',
    ],
    supportingImages: detailingGallerySupportingImages.filter(img => img.id !== 'grid-1'),
  },
];
