'use client';

import { DashboardShell } from '@/app/components/DashboardShell';
import { Button } from '@/app/components/Button';
import { Input } from '@/app/components/Input';
import { useWorkingHours } from './useWorkingHours';
import { ToastContainer } from 'react-toastify';

const DAYS = [
  { key: 'Monday', label: 'Monday' },
  { key: 'Tuesday', label: 'Tuesday' },
  { key: 'Wednesday', label: 'Wednesday' },
  { key: 'Thursday', label: 'Thursday' },
  { key: 'Friday', label: 'Friday' },
  { key: 'Saturday', label: 'Saturday' },
  { key: 'Sunday', label: 'Sunday' },
] as const;

export default function WorkingHoursPage() {
  const {
    data: { workingHours, isPending },
    operations: { handleDayChange, handleSubmit, handleCancel },
  } = useWorkingHours();

  return (
    <DashboardShell
      title="Working Hours"
      description="Set availability and working hours for each day of the week."
      highlight="practitioners"
    >
      <ToastContainer position="top-right" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayKey = day.key as keyof typeof workingHours;
            const schedule = workingHours[dayKey];

            if (!schedule) {
              return null;
            }

            return (
              <div
                key={day.key}
                className="border border-slate-200 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${day.key}-available`}
                      checked={schedule.available}
                      onChange={(e) =>
                        handleDayChange(dayKey, 'available', e.target.checked)
                      }
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
                    />
                    <label
                      htmlFor={`${day.key}-available`}
                      className="ml-2 text-sm font-medium text-slate-900"
                    >
                      {day.label}
                    </label>
                  </div>
                </div>

                {schedule.available && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <Input
                      id={`${day.key}-start`}
                      type="time"
                      label="Start Time"
                      value={schedule.startTime}
                      onChange={(e) =>
                        handleDayChange(dayKey, 'startTime', e.target.value)
                      }
                      required={schedule.available}
                    />
                    <Input
                      id={`${day.key}-end`}
                      type="time"
                      label="End Time"
                      value={schedule.endTime}
                      onChange={(e) =>
                        handleDayChange(dayKey, 'endTime', e.target.value)
                      }
                      required={schedule.available}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            label="Cancel"
            onClick={handleCancel}
            type="button"
          />
          <Button
            variant="primary"
            label="Save Working Hours"
            type="submit"
            disabled={isPending}
          />
        </div>
      </form>
    </DashboardShell>
  );
}
