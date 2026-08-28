export const PRACTITIONER_LANGUAGES = [
  { id: 'language1', label: 'English' },
  { id: 'language2', label: 'Sinhala' },
  { id: 'language3', label: 'Tamil' },
] as const;

export type PractitionerLanguageLabel =
  (typeof PRACTITIONER_LANGUAGES)[number]['label'];

export type LanguageKey = (typeof PRACTITIONER_LANGUAGES)[number]['id'];

export type LocalizedName = {
  language: PractitionerLanguageLabel;
  prefix: string;
  firstName: string;
  lastName: string;
};

export type SpecialityNames = Partial<Record<LanguageKey, string>>;

export type Speciality = {
  id: string;
  name?: string;
  names?: SpecialityNames;
  nameLanguage2?: string;
  nameLanguage3?: string;
};

export const createEmptyLocalizedNames = (): LocalizedName[] =>
  PRACTITIONER_LANGUAGES.map((lang) => ({
    language: lang.label,
    prefix: '',
    firstName: '',
    lastName: '',
  }));

export const normalizeLocalizedNames = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
): LocalizedName[] => {
  const empty = createEmptyLocalizedNames();

  // New object shape: { language1: {...}, language2: {...}, language3: {...} }
  if (
    data?.names &&
    !Array.isArray(data.names) &&
    typeof data.names === 'object'
  ) {
    return empty.map((fallback) => {
      const key = PRACTITIONER_LANGUAGES.find(
        (l) => l.label === fallback.language,
      )?.id;
      const match = key ? data.names[key] : null;
      return {
        language: fallback.language,
        prefix: match?.prefix || '',
        firstName: match?.firstName || '',
        lastName: match?.lastName || '',
      };
    });
  }

  if (Array.isArray(data?.names) && data.names.length > 0) {
    return empty.map((fallback) => {
      const match = data.names.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) =>
          entry?.language === fallback.language ||
          entry?.language ===
          PRACTITIONER_LANGUAGES.find((l) => l.label === fallback.language)
            ?.id,
      );
      return {
        language: fallback.language,
        prefix: match?.prefix || '',
        firstName: match?.firstName || '',
        lastName: match?.lastName || '',
      };
    });
  }

  // Legacy flat fields map to English
  return empty.map((entry) =>
    entry.language === 'English'
      ? {
        ...entry,
        prefix: data?.prefix || '',
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
      }
      : entry,
  );
};

/** Normalize speciality payload from current or new API shape. */
export const getSpecialityLocalizedNames = (
  speciality: Speciality,
): Required<SpecialityNames> => ({
  language1: speciality.names?.language1 || speciality.name || '',
  language2: speciality.names?.language2 || speciality.nameLanguage2 || '',
  language3: speciality.names?.language3 || speciality.nameLanguage3 || '',
});

/** Primary label (language1 / English). */
export const getSpecialityPrimaryLabel = (speciality: Speciality): string =>
  getSpecialityLocalizedNames(speciality).language1 || speciality.id;

/** Secondary languages for list display. */
export const getSpecialitySecondaryLabels = (
  speciality: Speciality,
): string[] => {
  const names = getSpecialityLocalizedNames(speciality);
  return [names.language2, names.language3].filter(Boolean);
};
