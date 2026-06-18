export type SubscriptionPlan = {
  displayName: string;
  price: string;
  billingPeriod: string;
};

export type Subscription = {
  status: string;
  plan: SubscriptionPlan;
};

export type SubscriptionUsage = {
  id: string;
  consumed: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
  status: string;
};

export type ProcessedSubscriptionUsage = SubscriptionUsage & {
  formattedPeriodStart: string;
  formattedPeriodEnd: string;
  days: number;
  isLow: boolean;
  isPast: boolean;
  daysLabel: string;
};

export type PatientUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  isActive?: boolean;
  isOverdue?: boolean;
  subscriptions?: Subscription[];
  subscriptionUsages?: SubscriptionUsage[];
};

export type ProcessedPatientUser = Omit<PatientUser, 'subscriptionUsages'> & {
  subscriptionUsages?: ProcessedSubscriptionUsage[];
  activeDaysLeft: number | null;
  canRenew: boolean;
};

export type Patient = {
  patient_id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
  user?: PatientUser;
};

export type ProcessedPatient = Omit<Patient, 'user'> & {
  user?: ProcessedPatientUser;
};
