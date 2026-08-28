'use client';

import { DashboardShell } from '@/app/components/DashboardShell';
import { Button } from '@/app/components/Button';
import { Select } from '@/app/components/Select';
import { Input } from '@/app/components/Input';
import { ToastContainer } from 'react-toastify';
import { useAddPractitioner } from './useAddPractitioner';
import { LocalizedNameFields } from '../LocalizedNameFields';
import {
  createEmptyLocalizedNames,
  getSpecialityPrimaryLabel,
  getSpecialitySecondaryLabels,
} from '../localizedNames';

export default function AddPractitionerPage() {
  const {
    data: { formData, specialities, isPending },
    operations: {
      handleInputChange,
      handleSubmit,
      handleCancel,
      addLicense,
      removeLicense,
      updateLicense,
      updateLocalizedName,
      handleSpecialityChange,
    },
  } = useAddPractitioner();

  return (
    <DashboardShell
      title="Add Doctors"
      description="Create a new doctor record."
      highlight="practitioners"
    >
      <ToastContainer position="top-right" />
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">Add Doctor</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive ?? true}
                onChange={(e) =>
                  handleInputChange('isActive', e.target.checked)
                }
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-slate-700"
              >
                Active
              </label>
            </div>

            <LocalizedNameFields
              names={
                formData.demographics?.names || createEmptyLocalizedNames()
              }
              onChange={updateLocalizedName}
            />

            <Select
              id="gender"
              label="Gender *"
              required
              value={formData.demographics?.gender || '-'}
              onChange={(e) =>
                handleInputChange(
                  'demographics.gender',
                  e.target.value as 'male' | 'female' | 'other' | '-',
                )
              }
              options={[
                { value: '-', label: '-' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="email"
                type="email"
                label="Email"
                value={formData.contactDetails?.email || ''}
                onChange={(e) =>
                  handleInputChange('contactDetails.email', e.target.value)
                }
              />
              <Input
                id="phone"
                type="tel"
                label="Phone"
                value={formData.contactDetails?.phone || ''}
                onChange={(e) =>
                  handleInputChange('contactDetails.phone', e.target.value)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Specialities *
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded-lg p-4">
                {specialities.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Loading specialities...
                  </p>
                ) : (
                  specialities.map((speciality) => {
                    const isSelected =
                      formData.doctorDetails?.specialities?.includes(
                        speciality.id,
                      ) || false;
                    const secondaryLabels =
                      getSpecialitySecondaryLabels(speciality);
                    return (
                      <label
                        key={speciality.id}
                        className="flex items-start space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSpecialityChange(
                              speciality.id,
                              e.target.checked,
                            )
                          }
                          className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                        />
                        <span className="text-sm text-slate-900">
                          <span className="font-medium">
                            {getSpecialityPrimaryLabel(speciality)}
                          </span>
                          {secondaryLabels.length > 0 && (
                            <span className="block text-xs text-slate-500 mt-0.5">
                              {secondaryLabels.join(' · ')}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {(!formData.doctorDetails?.specialities ||
                formData.doctorDetails.specialities.length === 0) && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select at least one speciality
                  </p>
                )}
            </div>

            <div>
              <Input
                id="fee"
                type="number"
                label="Fee"
                value={formData.demographics?.fee || ''}
                onChange={(e) =>
                  handleInputChange('demographics.fee', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">
                  Licenses (SLMC ID) *
                </label>
                <button
                  type="button"
                  onClick={addLicense}
                  className="text-sm text-[#380b52] hover:underline"
                >
                  + Add License
                </button>
              </div>
              {formData.licenses?.map((license, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-end">
                  <Input
                    id={`license-number-${index}`}
                    type="text"
                    label="License Number *"
                    required
                    value={license.number}
                    onChange={(e) =>
                      updateLicense(index, 'number', e.target.value)
                    }
                  />
                  <Input
                    id={`license-type-${index}`}
                    type="text"
                    label="License Type *"
                    required
                    value={license.type}
                    onChange={(e) =>
                      updateLicense(index, 'type', e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => removeLicense(index)}
                    label="Remove"
                  />
                </div>
              ))}
              {(!formData.licenses || formData.licenses.length === 0) && (
                <p className="text-sm text-red-600">
                  Please add at least one license
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isPending}
              label="Create Practitioner"
            />
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
