import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';

export interface Group {
  id: string;
  name: string;
  direction: 'geral' | 'nacional' | 'provincial' | 'municipal' | 'comunal' | 'seccao' | 'zona';
  province: string;
  municipality: string;
  is_active: boolean;
  max_members: number;
  monthly_fee: number;
  president_name?: string;
  vice_president_1_name?: string;
  vice_president_2_name?: string;
  secretary_1_name?: string;
  secretary_2_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: string;
  name: string;
  member_code: string;
  group_id: string;
  phone?: string;
  birth_date?: string;
  birth_province?: string;
  birth_municipality?: string;
  neighborhood?: string;
  marital_status?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
  role?: 'presidente' | 'vice_presidente' | 'secretario' | 'tesoureiro' | 'membro' | 'coordenador';
  partition?: 'soprano' | 'contralto' | 'tenor' | 'baixo' | 'instrumental';
  is_active: boolean;
  profile_image_url?: string;
  created_at: string;
  updated_at: string;
}

// Groups Query Hooks
export function useGroups(limit?: number) {
  return useQuery({
    queryKey: ['groups', limit],
    queryFn: async () => {
      let query = supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Group[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - dados de grupos mudam pouco
  });
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Group;
    },
    enabled: !!id,
  });
}

// Members Query Hooks
export function useMembers(groupId?: string, limit?: number) {
  return useQuery({
    queryKey: ['members', groupId, limit],
    queryFn: async () => {
      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (groupId) {
        query = query.eq('group_id', groupId);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Member[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useMember(id: string) {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Member;
    },
    enabled: !!id,
  });
}

// Mutations
export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async (newGroup: Omit<Group, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('groups')
        .insert([newGroup])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao criar grupo: ${error.message}`, type: 'error' });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Group> & { id: string }) => {
      const { data, error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups', data.id] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao atualizar grupo: ${error.message}`, type: 'error' });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao excluir grupo: ${error.message}`, type: 'error' });
    },
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async (newMember: Omit<Member, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('members')
        .insert([newMember])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', data.group_id] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao criar membro: ${error.message}`, type: 'error' });
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Member> & { id: string }) => {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', data.id] });
      queryClient.invalidateQueries({ queryKey: ['members', data.group_id] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao atualizar membro: ${error.message}`, type: 'error' });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();
  const { addError } = useAppStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
    onError: (error: Error) => {
      addError({ message: `Erro ao excluir membro: ${error.message}`, type: 'error' });
    },
  });
}