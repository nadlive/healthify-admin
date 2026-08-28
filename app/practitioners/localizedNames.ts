export const PRACTITIONER_LANGUAGES = [
  { id: 'language1', label: 'English' },
  { id: 'language2', label: 'Sinhala' },
  { id: 'language3', label: 'Tamil' },
] as const;

export type PractitionerLanguageLabel =
  (typeof PRACTITIONER_LANGUAGES)[number]['label'];

export type LocalizedName = {
  language: PractitionerLanguageLabel;
  prefix: string;
  firstName: string;
  lastName: string;
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
