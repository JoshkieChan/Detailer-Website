export type MembershipIntent = 'none' | 'quarterly' | 'monthly';

export interface MaintenancePlan {
  id: Exclude<MembershipIntent, 'none'>;
  name: string;
  shortName: string;
  bookingChoiceLabel: string;
  bestFor: string;
  pricingLine: string;
  supportLine: string;
  summaryLine: string;
  emailIntro: string;
  billingDetails: string;
  includedSummary: string;
  features: string[];
  ctaLabel: string;
  popular: boolean;
}

export const maintenancePlans: MaintenancePlan[] = [
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    shortName: 'Quarterly',
    bookingChoiceLabel: 'Interested in Quarterly Plan',
    bestFor:
      'Best for families and daily drivers who want lower-frequency upkeep after a clean baseline.',
    pricingLine: 'From $180 every 3 months (equivalent to $60/month)',
    supportLine: 'Billed separately after your baseline service on a once-every-3-month schedule.',
    summaryLine: 'From $180 every 3 months, billed separately after baseline.',
    emailIntro: 'You selected the Quarterly Maintenance Plan.',
    billingDetails:
      'This plan starts after your baseline Deep Reset or first maintenance visit. No recurring charges are taken today.',
    includedSummary:
      'Includes 4 Maintenance Details per year, Priority Scheduling, 10% off any extras, and pricing locked in for 12 months.',
    features: [
      '4 Maintenance Details per year',
      'Priority Scheduling',
      '10% off any extras',
      'Price locked in for 12 months',
    ],
    ctaLabel: 'Join Quarterly Plan',
    popular: false,
  },
  {
    id: 'monthly',
    name: 'Monthly Plan',
    shortName: 'Monthly',
    bookingChoiceLabel: 'Interested in Monthly Plan',
    bestFor:
      'Best for drivers who want the cleanest cadence and a predictable monthly upkeep rhythm after baseline.',
    pricingLine: 'From $150 every month',
    supportLine: 'Billed separately after your baseline service as a monthly recurring payment.',
    summaryLine: 'From $150 every month, billed separately after baseline.',
    emailIntro: 'You selected the Monthly Maintenance Plan.',
    billingDetails:
      'This plan starts after your baseline Deep Reset or first maintenance visit. No recurring charges are taken today.',
    includedSummary:
      'Includes 12 Maintenance Details per year, VIP Priority Scheduling, 20% off any extras, free minor spot-cleaning between visits, and pricing locked in for 12 months.',
    features: [
      '12 Maintenance Details per year',
      'VIP Priority Scheduling',
      '20% off any extras',
      'Free minor spot-cleaning between visits',
      'Price locked in for 12 months',
    ],
    ctaLabel: 'Join Monthly Plan',
    popular: true,
  },
] as const;

export const maintenancePlanById = Object.fromEntries(
  maintenancePlans.map((plan) => [plan.id, plan])
) as Record<Exclude<MembershipIntent, 'none'>, MaintenancePlan>;

export const isMembershipIntent = (value: string | null | undefined): value is MembershipIntent =>
  value === 'none' || value === 'quarterly' || value === 'monthly';
