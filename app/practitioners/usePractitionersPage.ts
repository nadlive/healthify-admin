import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQuery, useMutation } from '@/app/lib/apiClient';
import { toast } from 'react-toastify';

export const usePractitionersPage = () => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: practitioners } = (useQuery as any)('get', '/practitioners');

  // Use useMutation at top level - handle dynamic path via path parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: deletePractitioner } = (useMutation as any)(
    'delete',
    '/practitioners/{id}',
  );

  const handleDelete = async (practitionerId: string) => {
    if (!confirm('Are you sure you want to delete this practitioner?')) {
      return;
    }

    setDeletingId(practitionerId);
    try {
      // Call mutation with path parameters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (deletePractitioner as any)({
        params: {
          path: {
            id: practitionerId,
          },
        },
      });
      // Invalidate and refetch practitioners data
      await queryClient.invalidateQueries({
        queryKey: ['get', '/practitioners'],
      });
      setDeletingId(null);
      toast.success('Practitioner deleted successfully!');
    } catch (error) {
      toast.error(`Failed to delete practitioner. Please try again. ${error}`);
      setDeletingId(null);
    }
  };

  return {
    data: {
      practitioners: practitioners?.data,
      deletingId,
    },
    operations: {
      handleDelete,
    },
  };
};
