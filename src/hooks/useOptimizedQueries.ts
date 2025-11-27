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

// Financial Summary Hook for Dashboard Widget - Enhanced
export function useFinancialSummary() {
  return useQuery({
    queryKey: ['dashboard', 'financialSummary'],
    queryFn: async () => {
      // Parallel queries for maximum performance
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const [categoriesResult, transactionsResult] = await Promise.all([
        supabase
          .from('financial_categories')
          .select('id, name, total_balance, groups(name)'),
        supabase
          .from('financial_transactions')
          .select('amount, type')
          .gte('created_at', startOfMonth.toISOString())
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      
      const categories = categoriesResult.data || [];
      const transactions = transactionsResult.data || [];

      const totalBalance = categories.reduce((sum, cat) => sum + Number(cat.total_balance), 0);
      
      const monthlyRevenue = transactions
        .filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const monthlyExpenses = transactions
        .filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const negativeCategories = categories
        .filter(cat => Number(cat.total_balance) < 0)
        .sort((a, b) => Number(a.total_balance) - Number(b.total_balance))
        .slice(0, 5)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          balance: Number(cat.total_balance),
          groupName: (cat.groups as any)?.name || 'N/A'
        }));

      return {
        totalBalance,
        monthlyRevenue,
        monthlyExpenses,
        negativeCategories,
        totalCategories: categories.length
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// Dashboard Charts Hook - Optimized with single query and local processing
export function useDashboardCharts() {
  return useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: async () => {
      // Single optimized query for all chart data
      const { data: members, error } = await supabase
        .from('members')
        .select('created_at, partition, group_id, groups(name)')
        .eq('is_active', true);

      if (error) throw error;

      const membersData = members || [];

      // Calculate member growth (last 6 months)
      const growthMap = new Map<string, number>();
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
        growthMap.set(monthKey, 0);
      }

      membersData.forEach(member => {
        const createdDate = new Date(member.created_at);
        const monthKey = createdDate.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
        if (growthMap.has(monthKey)) {
          growthMap.set(monthKey, (growthMap.get(monthKey) || 0) + 1);
        }
      });

      const memberGrowth: { month: string; members: number }[] = [];
      let cumulative = 0;
      growthMap.forEach((count, month) => {
        cumulative += count;
        memberGrowth.push({ month, members: cumulative });
      });

      // Calculate partition distribution
      const partitionMap = new Map<string, number>();
      membersData.forEach(member => {
        if (member.partition) {
          const partition = member.partition.charAt(0).toUpperCase() + member.partition.slice(1).toLowerCase();
          partitionMap.set(partition, (partitionMap.get(partition) || 0) + 1);
        }
      });

      const partitionData = Array.from(partitionMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Calculate top groups by member count
      const groupMap = new Map<string, number>();
      membersData.forEach(member => {
        if (member.groups && typeof member.groups === 'object' && 'name' in member.groups) {
          const groupName = (member.groups as { name: string }).name;
          groupMap.set(groupName, (groupMap.get(groupName) || 0) + 1);
        }
      });

      const topGroups = Array.from(groupMap.entries())
        .map(([name, members]) => ({ 
          name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
          members 
        }))
        .sort((a, b) => b.members - a.members)
        .slice(0, 5);

      return { memberGrowth, partitionData, topGroups };
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}
