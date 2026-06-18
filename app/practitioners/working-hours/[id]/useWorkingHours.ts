'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@/app/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

type DaySchedule = {
  available: boolean;
  startTime: string;
  endTime: string;
};

type WorkingHours = {
  Monday: DaySchedule;
  Tuesday: DaySchedule;
  Wednesday: DaySchedule;
  Thursday: DaySchedule;
  Friday: DaySchedule;
  Saturday: DaySchedule;
  Sunday: DaySchedule;
};

const defaultSchedule: DaySchedule = {
  available: false,
  startTime: '09:00',
  endTime: '17:00',
};

export const useWorkingHours = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const practitionerId = params.id as string;

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    Monday: { ...defaultSchedule },
    Tuesday: { ...defaultSchedule },
    Wednesday: { ...defaultSchedule },
    Thursday: { ...defaultSchedule },
    Friday: { ...defaultSchedule },
    Saturday: { ...defaultSchedule },
    Sunday: { ...defaultSchedule },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingHours } = (useQuery as any)(
    'get',
    practitionerId ? `/practitioners/${practitionerId}/working-hours` : null,
  );

  useEffect(() => {
    const hoursData = existingHours?.data || existingHours;

    if (hoursData && Array.isArray(hoursData)) {
      const transformed: WorkingHours = {
        Monday: { ...defaultSchedule },
        Tuesday: { ...defaultSchedule },
        Wednesday: { ...defaultSchedule },
        Thursday: { ...defaultSchedule },
        Friday: { ...defaultSchedule },
        Saturday: { ...defaultSchedule },
        Sunday: { ...defaultSchedule },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hoursData.forEach((item: any) => {
        const day = item.dayOfWeek as keyof WorkingHours;
        if (day && transformed[day]) {
          const startTime = item.start_time
            ? item.start_time.substring(0, 5)
            : defaultSchedule.startTime;
          const endTime = item.end_time
            ? item.end_time.substring(0, 5)
            : defaultSchedule.endTime;

          transformed[day] = {
            available: item.isAvailable ?? false,
            startTime,
            endTime,
          };
        }
      });

      setWorkingHours(transformed);
    }
  }, [existingHours]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: updateWorkingHours, isPending } = (useMutation as any)(
    'post',
    '/practitioners/{id}/working-hours',
  );

  const handleDayChange = (
    day: keyof WorkingHours,
    field: keyof DaySchedule,
    value: boolean | string,
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const apiPayload = Object.entries(workingHours).map(
        ([day, schedule]) => ({
          dayOfWeek: day,
          start_time: schedule.startTime + ':00',
          end_time: schedule.endTime + ':00',
          isAvailable: schedule.available,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (updateWorkingHours as any)({
        params: {
          path: {
            id: practitionerId,
          },
        },
        body: apiPayload,
      });

      await queryClient.invalidateQueries({
        queryKey: ['get', `/practitioners/${practitionerId}/working-hours`],
      });
      toast.success('Working hours updated successfully!');
      router.push('/practitioners');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Failed to update working hours: ${error.error}`);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/practitioners');
  };

  return {
    data: {
      workingHours,
      practitionerId,
      isPending,
    },
    operations: {
      handleDayChange,
      handleSubmit,
      handleCancel,
    },
  };
};
