import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "~/lib/auth/auth.client";

export function useAuth() {
  const queryClient = useQueryClient();

  // 获取当前会话状态
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      try {
        const result = await authClient.getSession();
        return result.data;
      } catch (error) {
        console.error("Error fetching session:", error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // 登出
  const signOutMutation = useMutation({
    mutationFn: async () => {
      return await authClient.signOut();
    },
    onSuccess: () => {
      // 清除会话缓存
      queryClient.setQueryData(["auth-session"], null);
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
      throw error;
    },
  });

  return {
    // 状态数据
    user: session?.user,
    session,
    isLoading,
    error,

    // 是否已认证
    isAuthenticated: !!session?.user,

    // 登出方法
    signOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,

    // 清除错误
    clearError: () => {
      signOutMutation.reset();
    },
  };
}
