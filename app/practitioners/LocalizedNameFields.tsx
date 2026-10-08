'use client';

import { Input } from '@/app/components/Input';
import { PRACTITIONER_LANGUAGES, type LocalizedName } from './localizedNames';

type LocalizedNameFieldsProps = {
  names: LocalizedName[];
  onChange: (
    index: number,
    field: 'prefix' | 'firstName' | 'lastName',
    value: string,
  ) => void;
};

export function LocalizedNameFields({
  names,
  onChange,
}: LocalizedNameFieldsProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Name by language *
      </label>
      {PRACTITIONER_LANGUAGES.map((lang, index) => {
        const entry = names[index] || {
          language: lang.label,
          prefix: '',
          firstName: '',
          lastName: '',
        };
        const isEnglish = lang.label === 'English';

        return (
          <details
            key={lang.id}
            open={isEnglish}
            className="rounded-lg border border-slate-300 bg-white"
          >
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50">
              {lang.label}
              {!isEnglish && (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (optional)
                </span>
              )}
            </summary>
            <div className="space-y-4 border-t border-slate-200 px-4 py-4">
              <Input
                id={`${lang.id}-prefix`}
                type="text"
                label="Prefix (e.g., Dr, Prof, Mr, Mrs)"
                value={entry.prefix}
                onChange={(e) => onChange(index, 'prefix', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id={`${lang.id}-firstName`}
                  type="text"
                  label={isEnglish ? 'First Name *' : 'First Name'}
                  required={isEnglish}
                  value={entry.firstName}
                  onChange={(e) => onChange(index, 'firstName', e.target.value)}
                />
                <Input
                  id={`${lang.id}-lastName`}
                  type="text"
                  label={isEnglish ? 'Last Name *' : 'Last Name'}
                  required={isEnglish}
                  value={entry.lastName}
                  onChange={(e) => onChange(index, 'lastName', e.target.value)}
                />
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}
