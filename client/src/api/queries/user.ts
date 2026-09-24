import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queries/keys';
import { QUERY_STALE_TIME_PRIVATE_MS } from '@/api/queries/queryOptions';
import {
  getDashboard,
  getMe,
  updateMe,
  sendTestEmail,
  exportMyData,
  deleteAccount,
} from '@/api/services/userService';
import type { UpdateMeRequestBody } from '@api-types/api-contracts';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    staleTime: QUERY_STALE_TIME_PRIVATE_MS,
    queryFn: async () => {
      const response = await getMe();
      return response.data;
    },
  });
}

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateMeRequestBody) => {
      const response = await updateMe(payload);
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

export function useExportMyData() {
  return useMutation({
    mutationFn: async () => {
      await exportMyData();
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
    staleTime: QUERY_STALE_TIME_PRIVATE_MS,
    queryFn: async () => {
      const response = await getDashboard();
      return response.data;
    },
  });
}
