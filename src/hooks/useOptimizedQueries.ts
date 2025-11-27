import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Dashboard Stats Hook - Ultra-optimized with parallel COUNT queries
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const [totalGroupsResult, totalMembersResult, activeGroupsResult] = await Promise.all([
        supabase.from('groups').select('id', { count: 'exact', head: true }),
        supabase.from('members').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('groups').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      return {
        totalGroups: totalGroupsResult.count || 0,
        totalMembers: totalMembersResult.count || 0,
        activeGroups: activeGroupsResult.count || 0,
        recentActivity: totalGroupsResult.count || 0
      };
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Recent Groups Hook
export function useRecentGroups(limit = 5) {
  return useQuery({
    queryKey: ['dashboard', 'recentGroups', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, municipality, province, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

// Financial Categories Hook - Optimized with parallel leader loading
export function useFinancialCategories(groupId: string) {
  return useQuery({
    queryKey: ['financial', 'categories', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('id, name, description, total_balance, is_locked, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Category Leaders Hook - Batch load all leaders for a group
export function useCategoryLeaders(groupId: string) {
  return useQuery({
    queryKey: ['financial', 'categoryLeaders', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_roles')
        .select(`
          id,
          category_id,
          role,
          is_active,
          members!inner(id, name)
        `)
        .eq('group_id', groupId)
        .eq('is_active', true);

      if (error) throw error;

      // Group by category_id for easy lookup
      const leadersByCategory: Record<string, any[]> = {};
      (data || []).forEach((role: any) => {
        if (!leadersByCategory[role.category_id]) {
          leadersByCategory[role.category_id] = [];
        }
        leadersByCategory[role.category_id].push({
          id: role.id,
          role: role.role,
          member: role.members
        });
      });

      return leadersByCategory;
    },
    enabled: !!groupId,
    staleTime: 10 * 60 * 1000,
  });
}

// Weekly Programs Hook
export function useWeeklyPrograms(groupId: string) {
  return useQuery({
    queryKey: ['technical', 'weeklyPrograms', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weekly_program_content')
        .select('*')
        .eq('group_id', groupId)
        .eq('is_deleted', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Payment Events Hook
export function usePaymentEvents(groupId: string) {
  return useQuery({
    queryKey: ['financial', 'paymentEvents', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_events')
        .select(`
          id,
          title,
          amount_to_pay,
          category_id,
          created_at,
          created_by_member_id,
          financial_categories(name)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!groupId,
    staleTime: 5 * 60 * 1000,
  });
}

// Prefetch hook for group details
export function usePrefetchGroupDetails() {
  const queryClient = useQueryClient();

  const prefetch = (groupId: string) => {
    // Prefetch group data
    queryClient.prefetchQuery({
      queryKey: ['groups', groupId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });

    // Prefetch members
    queryClient.prefetchQuery({
      queryKey: ['members', groupId, undefined, 'id, name, role, partition, is_active, phone, profile_image_url'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, role, partition, is_active, phone, profile_image_url')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
  };

  return { prefetch };
}

// Financial Summary Hook for Dashboard Widget
export function useFinancialSummary() {
  return useQuery({
    queryKey: ['dashboard', 'financialSummary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_categories')
        .select('total_balance, group_id');

      if (error) throw error;

      const totalBalance = (data || []).reduce((acc, cat) => acc + (cat.total_balance || 0), 0);
      const categoriesWithNegativeBalance = (data || []).filter(cat => (cat.total_balance || 0) < 0).length;

      return {
        totalBalance,
        categoriesWithNegativeBalance,
        totalCategories: data?.length || 0
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
