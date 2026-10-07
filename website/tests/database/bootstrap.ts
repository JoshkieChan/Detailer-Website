import { readFileSync } from 'node:fs';
const root = new URL('../../../supabase/', import.meta.url);
export const schemaSql = () => [
  readFileSync(new URL('bootstrap/base.sql', root), 'utf8'),
  ...[
    '20260409_booking_membership_pricing_fields.sql',
    '20260410_booking_helcim_redirect_fields.sql',
    '20260411_create_snapshot_leads.sql',
    '20260417_signalsource_v2_scheduler_and_payments.sql',
    '20260426_add_base_and_addons_price_columns.sql',
    '20260426_add_selected_addons_column.sql',
    '20260426_add_test_mode_column.sql',
    '20260426_booking_capacity_events.sql',
    '20261006_booking_capacity_segments.sql',
    '20261006032815_booking_integrity.sql',
    '20261006134023_operational_completion.sql',
  ].map(name => readFileSync(new URL('migrations/' + name, root), 'utf8')),
].join('\n');
