'use client';

export type SectionKey =
  | 'home'
  | 'practitioners'
  | 'patients'
  | 'payments'
  | 'refunds'
  | 'subscriptions';

export type Section = {
  title: string;
  description?: string;
};

export const sections: Record<SectionKey, Section> = {
  home: {
    title: 'Home',
    description: 'Primary workspace placeholder.',
  },
  practitioners: {
    title: 'Practitioners',
    description: 'Practitioner module placeholder.',
  },
  patients: {
    title: 'Patients',
    description: 'Patient module placeholder.',
  },
  payments: {
    title: 'Payments',
    description: 'Payments module placeholder.',
  },
  subscriptions: {
    title: 'Subscriptions',
    description: 'Subscriptions module placeholder.',
  },
  refunds: {
    title: 'Refunds',
    description: 'Refunds module placeholder.',
  },
};
