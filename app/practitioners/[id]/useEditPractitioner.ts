'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@/app/lib/apiClient';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

type License = {
  number: string;
  type: string;
};

type DoctorDetails = {
  specialities?: string[];
};

type Speciality = {
  id: string;
  name: string;
};

type PractitionerFormData = {
  demographics: {
    firstName: string;
    lastName: string;
    prefix?: string;
    gender: 'male' | 'female' | 'other' | '-';
    fee?: number | null;
  };
  contactDetails: {
    email?: string;
    phone?: string;
  };
  doctorDetails?: DoctorDetails | null;
  licenses: License[];
  isActive?: boolean;
  
};

export const useEditPractitioner = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const practitionerId = params.id as string;

  // Fetch specialities from API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: specialitiesData } = (useQuery as any)('get', '/specialities');

  // Handle different response structures
  const specialitiesResponse =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (specialitiesData?.data as any) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (specialitiesData as any) ||
    [];
  const specialities: Speciality[] = Array.isArray(specialitiesResponse)
    ? specialitiesResponse
    : [];

  // Fetch existing practitioner data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: practitionerData } = (useQuery as any)(
    'get',
    practitionerId ? `/practitioners/${practitionerId}` : null,
  );

  const [formData, setFormData] = useState<Partial<PractitionerFormData>>({
    demographics: {
      firstName: '',
      lastName: '',
      prefix: '',
      gender: '-',
      fee: null,
    },
    contactDetails: {
      email: '',
      phone: '',
    },
    doctorDetails: {
      specialities: [],
    },
    licenses: [],
    isActive: true,
  });

  // Load practitioner data into form when fetched
  useEffect(() => {
    if (practitionerData?.data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = practitionerData.data as any;

      // Parse licenses if it's a JSON string
      let licenses: License[] = [];
      if (data.licenses) {
        try {
          licenses =
            typeof data.licenses === 'string'
              ? JSON.parse(data.licenses)
              : data.licenses;
        } catch {
          licenses = Array.isArray(data.licenses) ? data.licenses : [];
        }
      }

      // Extract speciality IDs from the specialities array
      // API returns: [{ id: "SPEC001", name: "General Practice" }]
      // Form needs: ["SPEC001"]
      let specialityIds: string[] = [];
      if (data.specialities) {
        if (Array.isArray(data.specialities)) {
          specialityIds = data.specialities.map((spec: Speciality) =>
            typeof spec === 'string' ? spec : spec.id,
          );
        }
      } else if (data.doctorDetails?.specialities) {
        // Fallback to doctorDetails.specialities if it exists
        specialityIds = Array.isArray(data.doctorDetails.specialities)
          ? data.doctorDetails.specialities.map((spec: Speciality) =>
              typeof spec === 'string' ? spec : spec.id,
            )
          : [];
      }

      setFormData({
        demographics: {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          prefix: data.prefix || '',
          gender: data.gender || '-',
          fee: data.fee || ''
        },
        contactDetails: {
          email: data.email || '',
          phone: data.phone || '',
        },
        doctorDetails: {
          specialities: specialityIds,
        },
        licenses: licenses,
        isActive: data.active ?? data.isActive ?? true,
      });
    }
  }, [practitionerData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: updatePractitioner, isPending } = (useMutation as any)(
    'put',
    '/practitioners/{id}',
  );

  const handleInputChange = (
    path: string,
    value:
      | string
      | number
      | boolean
      | License[]
      | DoctorDetails
      | string[]
      | undefined
      | null,
  ) => {
    setFormData((prev) => {
      const keys = path.split('.');
      const newData = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      if (value === undefined) {
        delete current[keys[keys.length - 1]];
      } else {
        current[keys[keys.length - 1]] = value;
      }
      return newData;
    });
  };

  const addLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [...(prev.licenses || []), { number: '', type: '' }],
    }));
  };

  const removeLicense = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateLicense = (
    index: number,
    field: 'number' | 'type',
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      licenses:
        prev.licenses?.map((license, i) =>
          i === index ? { ...license, [field]: value } : license,
        ) || [],
    }));
  };

  const transformFormDataForBackend = (data: Partial<PractitionerFormData>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformed: any = {
      firstName: data.demographics?.firstName || '',
      lastName: data.demographics?.lastName || '',
      prefix: data.demographics?.prefix || '',
      gender:
        data.demographics?.gender === '-'
          ? ''
          : data.demographics?.gender || '',
      fee: data.demographics?.fee ?? null,
      email: data.contactDetails?.email || '',
      phone: data.contactDetails?.phone || '',
      doctorDetails: {
        specialities: data.doctorDetails?.specialities || [],
      },
      licenses: data.licenses || [],
      isActive: data.isActive ?? true,
    };

    return transformed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transformedData = transformFormDataForBackend(formData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (updatePractitioner as any)({
        params: {
          path: {
            id: practitionerId,
          },
        },
        body: transformedData,
      });
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: ['get', '/practitioners'],
      });
      await queryClient.invalidateQueries({
        queryKey: ['get', `/practitioners/${practitionerId}`],
      });
      toast.success('Practitioner updated successfully!');
      router.push('/practitioners');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Failed to update practitioner: ${error.error}`);
      throw error;
    }
  };

  const handleCancel = () => {
    router.push('/practitioners');
  };

  const handleSpecialityChange = (specialityId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentSpecialities = prev.doctorDetails?.specialities || [];
      const newSpecialities = checked
        ? [...currentSpecialities, specialityId]
        : currentSpecialities.filter((id) => id !== specialityId);
      return {
        ...prev,
        doctorDetails: {
          ...prev.doctorDetails,
          specialities: newSpecialities,
        },
      };
    });
  };

  return {
    data: {
      formData,
      specialities,
      isPending,
      isLoading: !practitionerData,
    },
    operations: {
      handleInputChange,
      handleSubmit,
      handleCancel,
      addLicense,
      removeLicense,
      updateLicense,
      handleSpecialityChange,
    },
  };
};
