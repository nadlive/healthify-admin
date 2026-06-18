'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@/app/lib/apiClient';
import { toast } from 'react-toastify';

type License = {
  number: string;
  type: string;
};

type Address = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
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
    middleName?: string;
    prefix?: string;
    suffix?: string;
    age?: number | null;
    gender: 'male' | 'female' | 'other' | '-';
    dateOfBirth?: string | null;
    address?: Address;
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

export const useAddPractitioner = () => {
  const router = useRouter();

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

  const [formData, setFormData] = useState<Partial<PractitionerFormData>>({
    demographics: {
      firstName: '',
      lastName: '',
      middleName: '',
      prefix: '',
      suffix: '',
      age: null,
      gender: '-',
      dateOfBirth: null,
      fee: null,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
      },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: createPractitioner, isPending } = (useMutation as any)(
    'post',
    '/practitioners',
  );

  const handleInputChange = (
    path: string,
    value:
      | string
      | number
      | boolean
      | License[]
      | DoctorDetails
      | Address
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
      // Demographics - flat at root
      firstName: data.demographics?.firstName || '',
      lastName: data.demographics?.lastName || '',
      prefix: data.demographics?.prefix || '',
      gender:
        data.demographics?.gender === '-'
          ? ''
          : data.demographics?.gender || '',
      fee: data.demographics?.fee || 0, 
      // Contact Details - flat at root
      email: data.contactDetails?.email || '',
      phone: data.contactDetails?.phone || '',

      doctorDetails: {
        specialities: data.doctorDetails?.specialities || [],
      },
      // Licenses as JSON array
      licenses: data.licenses || [],
      isActive: data.isActive ?? true,
    };

    return transformed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const transformedData = transformFormDataForBackend(formData);
      await createPractitioner({
        body: transformedData,
      });
      toast.success('Practitioner created successfully!');
      router.push('/practitioners');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error(`Failed to create practitioner: ${error.error}`);
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
