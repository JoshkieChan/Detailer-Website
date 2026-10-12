import { expect, test } from '@playwright/test';

const availabilityUrl = '**/functions/v1/booking-availability**';
const createBookingUrl = '**/functions/v1/create-booking';

test('calendar loads availability beyond the initial year', async ({ page }) => {
  const months: string[] = [];
  await page.route(availabilityUrl, route => {
    const month = new URL(route.request().url()).searchParams.get('month') || '';
    months.push(month);
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      unavailableDates: ['2027-11-05'], intervalsByDate: {}, nextAvailableOpening: null,
    }) });
  });
  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await page.getByLabel(/Vehicle size/i).selectOption('sedan');
  await page.getByLabel('Location', { exact: true }).selectOption('garage');
  for (let i=0; i<13; i++) await page.getByRole('button', { name: 'Go to next month' }).click();
  await expect.poll(() => months.includes('2027-11')).toBe(true);
  await expect(page.getByLabel('November 5, 2027', { exact: true })).toBeDisabled();
  await expect(page.getByLabel('November 6, 2027', { exact: true })).toBeEnabled();
});

test('failed photo uploads retry without creating another booking', async ({ page }) => {
  let creates = 0;
  let uploads = 0;
  await page.route(createBookingUrl, route => {
    creates++;
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({
      bookingId: 'booking-photo', confirmationToken: 'test-capability', helcimDepositUrl: 'https://payments.example/deposit',
    }) });
  });
  await page.route('**/functions/v1/booking-photos', route => {
    uploads++;
    expect(route.request().postData()).toContain('test-capability');
    return route.fulfill({ status: uploads === 1 ? 503 : 200, contentType: 'application/json', body: '{}' });
  });
  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await page.getByLabel(/Vehicle size/i).selectOption('sedan');
  await page.getByLabel('Location', { exact: true }).selectOption('garage');
  await page.getByLabel(/October 9, 2026/i).click();
  await page.getByRole('button', { name: /08:00 to 11:00/i }).click();
  await page.getByLabel(/Full name/i).fill('Jane Detail');
  await page.getByLabel(/Phone number/i).fill('3605551234');
  await page.getByLabel(/Email address/i).fill('jane@example.com');
  await page.getByLabel(/Address \/ service location/i).fill('123 Oak St, Oak Harbor, WA');
  await page.locator('#photo-upload').setInputFiles({ name: 'vehicle.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgo=', 'base64') });
  await page.getByRole('button', { name: /Pay 20% Deposit/i }).click();
  await expect(page.getByRole('alert')).toContainText('Your booking was saved');
  await page.getByRole('button', { name: 'Retry photo upload' }).click();
  await expect(page).toHaveURL('https://payments.example/deposit');
  expect(creates).toBe(1);
  expect(uploads).toBe(2);
});

test('unsupported photo files are rejected before submission', async ({ page }) => {
  await page.goto('/booking');
  await page.locator('#photo-upload').setInputFiles({ name: 'script.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>') });
  await expect(page.getByText('Choose up to five JPEG, PNG, or WebP photos, each 5 MB or smaller.')).toBeVisible();
  await expect(page.getByText('script.svg', { exact: true })).toHaveCount(0);
});

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T16:00:00Z'));
  await page.route('https://payments.example/**', route => route.fulfill({ body: 'Payment redirect intercepted by test.' }));
  await page.route('https://nominatim.openstreetmap.org/**', route => route.fulfill({ contentType: 'application/json', body: '[]' }));
  await page.route(availabilityUrl, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        unavailableDates: [],
        intervalsByDate: {},
        nextAvailableOpening: {
          date: '2026-10-09',
          startTime: '08:00',
          label: '08:00 to 13:00',
          serviceLabel: 'Maintenance Detail',
        },
      }),
    });
  });
});

test('add-ons update pricing and submit recomputed booking payload', async ({ page }) => {
  let bookingPayload: Record<string, unknown> | null = null;

  await page.route(createBookingUrl, async (route) => {
    bookingPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        bookingId: 'booking-1',
        helcimDepositUrl: 'https://payments.example/deposit',
        totalToday: 115.65,
      }),
    });
  });

  await page.goto('/booking');
  await page.getByRole('button', { name: /Deep Reset Detail/i }).click();
  await page.getByLabel(/Vehicle size/i).selectOption('largeSuvTruck');
  await page.getByLabel('Location', { exact: true }).selectOption('mobile');
  await page.getByRole('button', { name: /Light paint correction/i }).click();

  await expect(page.getByText('Add-ons selected')).toBeVisible();
  await expect(page.getByText('$300.00')).toBeVisible();

  await page.getByLabel(/October 9, 2026/i).click();
  await page.getByRole('button', { name: /08:00 to 20:00/i }).click();
  await page.getByLabel(/Full name/i).fill('Jane Detail');
  await page.getByLabel(/Phone number/i).fill('3605551234');
  await page.getByLabel(/Email address/i).fill('jane@example.com');
  await page.getByLabel(/Address \/ service location/i).fill('123 Oak St, Oak Harbor, WA');
  await page.getByRole('button', { name: /Pay 20% Deposit/i }).click();

  await expect.poll(() => bookingPayload).not.toBeNull();
  expect(bookingPayload).toMatchObject({
    packageId: 'deepReset',
    vehicleType: 'largeSuvTruck',
    locationType: 'mobile',
    selectedAddOns: ['paintProtection'],
    service_date: '2026-10-09',
    start_time: '08:00',
    service_duration_minutes: 840,
  });
});

test('server-side booking validation errors are shown to the customer', async ({ page }) => {
  await page.route(createBookingUrl, async (route) => {
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Selected booking time is no longer available.', code: 'SLOT_UNAVAILABLE' }),
    });
  });

  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await page.getByLabel(/Vehicle size/i).selectOption('sedan');
  await page.getByLabel('Location', { exact: true }).selectOption('garage');
  await page.getByLabel(/October 9, 2026/i).click();
  await page.getByRole('button', { name: /08:00 to 11:00/i }).click();
  await page.getByLabel(/Full name/i).fill('Jane Detail');
  await page.getByLabel(/Phone number/i).fill('3605551234');
  await page.getByLabel(/Email address/i).fill('jane@example.com');
  await page.getByLabel(/Address \/ service location/i).fill('123 Oak St, Oak Harbor, WA');
  await page.getByRole('button', { name: /Pay 20% Deposit/i }).click();

  await expect(page.getByText('Selected booking time is no longer available.')).toBeVisible();
  await expect(page.getByRole('button', { name: /08:00 to 11:00/i })).not.toHaveClass(/selected/);
});

test('Sunday and occupied start times are disabled', async ({ page }) => {
  await page.route(availabilityUrl, route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify({ unavailableDates: [], nextAvailableOpening: null, intervalsByDate: {
      '2026-10-09': [{ date: '2026-10-09', startTime: '08:00', endTime: '11:00', blockedUntil: '11:00', source: 'booking', totalDurationMinutes: 180 }],
    } }),
  }));
  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await page.getByLabel(/Vehicle size/i).selectOption('sedan');
  await page.getByLabel('Location', { exact: true }).selectOption('garage');
  await expect(page.getByLabel('October 11, 2026', { exact: true })).toBeDisabled();
  await page.getByLabel('October 9, 2026', { exact: true }).click();
  await expect(page.getByRole('button', { name: /08:00 to 11:00/i })).toBeDisabled();
  await expect(page.getByRole('button', { name: /11:00 to 14:00/i })).toBeEnabled();
});
