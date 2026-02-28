import { useQuery } from '@tanstack/react-query';
import { getDashboard, getMe } from '@/api/services/userService';

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

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const response = await getDashboard();
      return response.data;
    },
  });
}
