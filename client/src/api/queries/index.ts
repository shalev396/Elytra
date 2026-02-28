import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDashboard,
  getMe,
  updateMe,
  sendTestEmail,
  deleteAccount,
} from '@/api/services/userService';

export const queryKeys = {
  me: ['me'] as const,
  dashboard: ['dashboard'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const response = await getMe();
      return response.data;
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await updateMe(formData);
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useSendTestEmail() {
  return useMutation({
    mutationFn: async () => {
      const response = await sendTestEmail();
      return response.data;
    },
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await deleteAccount();
      return response.data;
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await getDashboard();
      return response.data;
    },
  });
}
