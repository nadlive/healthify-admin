'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/app/components/Button';
import { DashboardShell } from '@/app/components/DashboardShell';
import {
  TwoRowTable,
  type TwoRowTableColumn,
} from '@/app/components/TwoRowTable';
import { usePractitionersPage } from './usePractitionersPage';
import { ToastContainer } from 'react-toastify';
import { useAdminGuard } from '../lib/useAdminGuard';

type Speciality = {
  id: string;
  name: string;
};

type Practitioner = {
  practitionerId: string;
  practitionerRoleId: string | null;
  active: boolean;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  specialty: string;
  roleTitle: string;
  organization: string;
  specialities?: Speciality[];
};

export default function PractitionersPage() {
  useAdminGuard();
  const router = useRouter();
  const {
    data: { practitioners = [], deletingId },
    operations: { handleDelete },
  } = usePractitionersPage();

  const handleAddPractitioner = () => {
    router.push('/practitioners/add');
  };

  const columns: TwoRowTableColumn<Practitioner>[] = [
    {
      key: 'fullName',
      header: 'Name',
      render: (practitioner) => (
        <div className="text-sm font-medium text-slate-900">
          {practitioner.fullName}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (practitioner) => (
        <div className="text-sm text-slate-900">{practitioner.email}</div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (practitioner) => (
        <div className="text-sm text-slate-900">{practitioner.phone}</div>
      ),
    },
    {
      key: 'active',
      header: 'Status',
      render: (practitioner) => (
        <div className="text-sm text-slate-900">
          {practitioner.active ? 'Active' : 'Inactive'}
        </div>
      ),
    },
  ];

  return (
    <DashboardShell
      title="Practitioners"
      description="Manage practitioner onboarding and records here."
      highlight="practitioners"
    >
      <ToastContainer position="top-right" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="primary"
            onClick={handleAddPractitioner}
            label="Add practitioner"
          />
        </div>

        <TwoRowTable
          columns={columns}
          data={practitioners}
          getRowKey={(practitioner) => practitioner.practitionerId}
          emptyMessage="No practitioners found. Add your first practitioner above."
          secondRowLabel="Specialities"
          secondRowContent={(practitioner) => (
            <div className="flex items-center justify-between flex-wrap gap-4">
              <span className="text-sm text-slate-900">
                {practitioner.specialities &&
                practitioner.specialities.length > 0
                  ? practitioner.specialities
                      .map((s: Speciality) => s.name)
                      .join(', ')
                  : '-'}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  label="Edit"
                  onClick={() =>
                    router.push(`/practitioners/${practitioner.practitionerId}`)
                  }
                />
                <Button
                  variant="primary"
                  label="Working Hours"
                  onClick={() =>
                    router.push(
                      `/practitioners/working-hours/${practitioner.practitionerId}`,
                    )
                  }
                />
                <Button
                  variant="secondary"
                  label="Delete"
                  onClick={() => handleDelete(practitioner.practitionerId)}
                  disabled={deletingId === practitioner.practitionerId}
                />
              </div>
            </div>
          )}
        />
      </div>
    </DashboardShell>
  );
}
