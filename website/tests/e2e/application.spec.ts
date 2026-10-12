import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const availability = { unavailableDates: [], intervalsByDate: {}, nextAvailableOpening: null };
const routes = ['/', '/detailing', '/services', '/our-work', '/pricing', '/memberships', '/about', '/faq', '/hub', '/systems', '/systems/examples/digital-assets', '/booking', '/privacy', '/terms', '/owner/schedule', '/booking/thanks', '/booking/confirmation'];

async function screenshot(page: Page, name: string) {
  if (!process.env.CAPTURE_SCREENSHOTS) return;
  const directory = resolve('../docs/screenshots');
  await mkdir(directory, { recursive: true });
  await page.screenshot({ path: resolve(directory, name), animations: 'disabled' });
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-05T16:00:00Z'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/functions/v1/booking-availability**', route => route.fulfill({ json: availability }));
});

for (const viewport of [{ width: 1440, height: 1100 }, { width: 375, height: 812 }]) {
  test(`public routes, images, links and layout at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route);
        await expect(page.getByRole('main')).toBeVisible();
        await expect(page.locator('h1').first()).toBeVisible();
        await page.locator('img').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
        await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), route).toBe(true);
        const invalidLinks = await page.locator('a[href]').evaluateAll((links, paths) => links.flatMap(link => {
          const href = link.getAttribute('href') || '';
          if (!href.startsWith('/') || href.startsWith('//')) return [];
          const url = new URL(href, location.origin);
          return paths.includes(url.pathname) || /\.[a-z]+$/i.test(url.pathname) ? [] : [href];
        }), routes);
        expect(invalidLinks, route).toEqual([]);
        if (route === '/our-work') await screenshot(page, viewport.width === 1440 ? 'detailing-desktop.png' : 'detailing-mobile.png');
      });
    }
    expect(errors).toEqual([]);
    await page.goto('/does-not-exist');
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
    await page.getByRole('link', { name: 'Return home', exact: true }).click();
    await expect(page).toHaveURL('/');
  });
}

test('mobile navigation exposes state and closes after navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'Toggle menu' });
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Mobile navigation menu' }).getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveURL('/pricing');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#mobile-navigation')).toHaveAttribute('inert', '');
});

test('owner pricing includes add-ons and totals count multi-day bookings once', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  const booking = { id: 'sample-booking', eventType: 'booking', date: '2026-10-05', startTime: '08:00', endTime: '20:00', customerName: 'Sample Customer', email: 'sample@example.test', phone: '3605550100', packageLabel: 'Deep Reset Detail', paymentStatus: 'paid', calculatedPrice: 800, depositAmount: 100, remainingBalance: 700 };
  await page.route('**/functions/v1/booking-availability**', route => route.fulfill({ json: { events: [booking, { ...booking, date: '2026-10-06', endTime: '10:00' }, { ...booking, id: 'test-booking', date: '2026-10-08', testMode: true, calculatedPrice: 999 }] } }));
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/functions/v1/owner-schedule', route => {
    if (route.request().method() === 'POST') submitted = route.request().postDataJSON();
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto('/owner/schedule');
  await page.getByLabel('Owner passcode').fill('test-only-owner-passcode');
  await page.getByRole('button', { name: 'Unlock owner mode' }).click();
  await expect(page.getByText('Confirmed Booking Value').locator('..')).toContainText('$800.00');
  if (process.env.CAPTURE_SCREENSHOTS) {
    await page.setViewportSize({ width: 1440, height: 1300 });
    await page.locator('.owner-calendar-shell').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 90));
    await screenshot(page, 'owner-desktop.png');
  }
  await page.getByLabel('Customer name', { exact: true }).fill('Sample Customer');
  await page.getByLabel('Email', { exact: true }).fill('sample@example.test');
  await page.getByLabel('Phone', { exact: true }).fill('3605550100');
  await page.getByRole('combobox', { name: /^Package/ }).selectOption('deepReset');
  await page.getByRole('combobox', { name: /^Vehicle size/ }).selectOption('largeSuvTruck');
  await page.getByRole('button', { name: /Light paint correction/ }).click();
  await expect(page.locator('.owner-pricing-readout')).toContainText('Service total $800.00');
  await expect(page.locator('.owner-pricing-readout')).toContainText('Remaining after service $700.00');
  await expect(page.getByText('Estimated total time:')).toContainText('14.0 hours');
  await page.getByRole('button', { name: 'Save manual booking' }).click();
  await expect(page.getByRole('status')).toHaveText('Manual booking saved.');
  expect(submitted).toMatchObject({ action: 'create_manual_booking', selectedAddOns: ['paintProtection'], calculated_price: 500, addons_price: 300, remaining_balance: 700, serviceDurationMinutes: 840 });
  await page.getByRole('button', { name: 'Delete booking', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Delete Booking' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('owner blackout submission and server conflict feedback', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('signalsource_owner_mode', 'test-only-owner-passcode'));
  await page.route('**/functions/v1/booking-availability**', route => route.fulfill({ json: { events: [] } }));
  let submitted: Record<string, unknown> | undefined;
  await page.route('**/functions/v1/owner-schedule', route => {
    submitted = route.request().postDataJSON();
    return route.fulfill({ status: 409, json: { error: 'Blackout overlaps an existing booking.' } });
  });
  await page.goto('/owner/schedule');
  await page.getByLabel('Reason', { exact: true }).fill('Unavailable');
  await page.getByRole('button', { name: 'Save blackout block' }).click();
  expect(submitted).toMatchObject({ action: 'create_blackout', startAt: '2026-10-05T08:00', endAt: '2026-10-05T09:00', reason: 'Unavailable' });
  await expect(page.getByRole('status')).toContainText('Blackout overlaps an existing booking.');
});

test('owner sign-in distinguishes invalid credentials from unavailable service', async ({ page }) => {
  let status = 401;
  await page.route('**/functions/v1/owner-schedule', route => route.fulfill({ status, json: { error: 'Unavailable' } }));
  await page.goto('/owner/schedule');
  await page.getByLabel('Owner passcode').fill('invalid-test-passcode');
  await page.getByRole('button', { name: 'Unlock owner mode' }).click();
  await expect(page.getByRole('alert')).toHaveText('Incorrect owner passcode.');
  status = 503;
  await page.getByLabel('Owner passcode').fill('another-test-passcode');
  await page.getByRole('button', { name: 'Unlock owner mode' }).click();
  await expect(page.getByRole('alert')).toHaveText('Owner tools are unavailable right now.');
});

test('confirmation preserves service date in a western timezone and does not invent payment', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('booking_confirmation', JSON.stringify({ bookingId: 'test-booking', token: 'test-token' })));
  await page.route('**/functions/v1/booking-status', route => route.fulfill({ json: { package_id: 'maintenance', service_date: '2026-10-09', service_time: '08:00', payment_status: 'pending_payment', status: 'pending', total_amount: 225, deposit_amount: 45, remaining_balance: 180 } }));
  await page.goto('/booking/confirmation');
  await expect(page.getByText('Friday, October 9, 2026', { exact: false })).toBeVisible();
  await expect(page.getByText('Your request is recorded. Payment and appointment confirmation are still pending.')).toBeVisible();
  await page.goto('/booking/thanks');
  await expect(page.getByText(/This page cannot verify payment/)).toBeVisible();
});

test('booking availability failure prevents date selection and snapshot failures are visible', async ({ page }) => {
  await page.route('**/functions/v1/booking-availability**', route => route.fulfill({ status: 503, json: { error: 'Unavailable' } }));
  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await expect(page.getByText('Could not load live availability right now.')).toBeVisible();
  await expect(page.getByLabel('October 9, 2026', { exact: true })).toBeDisabled();
  await page.route('**/functions/v1/deliver-snapshot', route => route.fulfill({ status: 503, json: { error: 'Email is temporarily unavailable.' } }));
  await page.goto('/hub');
  await page.getByLabel('Email address', { exact: true }).fill('sample@example.test');
  await page.getByRole('button', { name: 'Get the Snapshot' }).click();
  await expect(page.getByRole('alert')).toHaveText('Email is temporarily unavailable.');
});

test('booking screenshot uses real UI and synthetic availability', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/booking');
  await page.getByRole('button', { name: /Maintenance Detail/i }).click();
  await page.getByLabel('Vehicle size', { exact: true }).selectOption('sedan');
  await page.getByLabel('Location', { exact: true }).selectOption('garage');
  await page.locator('.booking-layout').evaluate(element => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 90));
  await screenshot(page, 'booking-desktop.png');
});
