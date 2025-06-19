import { useUser } from '@/contexts/UserContext';

export function useAuth() {
  const { user, isLoading, error } = useUser();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error
  };
}