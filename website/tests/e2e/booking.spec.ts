import { expect, test } from '@playwright/test';

const availabilityUrl = '**/functions/v1/booking-availability**';
const createBookingUrl = '**/functions/v1/create-booking';

test.beforeEach(async ({ page }) => {
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
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Selected booking time is no longer available.' }),
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
});
