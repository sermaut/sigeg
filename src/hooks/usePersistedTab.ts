import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook para persistir a aba selecionada por grupo e por usuário
 * A aba persiste entre navegações e é específica para cada usuário/grupo
 */
export function usePersistedTab(groupId: string, defaultTab: string = 'info') {
  const { user } = useAuth();
  
  // Gerar chave única baseada no grupo e usuário
  const getStorageKey = useCallback(() => {
    const userData = user?.data as any;
    const userId = userData?.id || userData?.member_code || 'anonymous';
    return `sigeg_tab_${groupId}_${userId}`;
  }, [groupId, user]);

  // Inicializar com valor do localStorage ou default
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      return stored || defaultTab;
    } catch {
      return defaultTab;
    }
  });

  // Atualizar quando o grupo ou usuário mudar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(getStorageKey());
      if (stored) {
        setActiveTab(stored);
      } else {
        setActiveTab(defaultTab);
      }
    } catch {
      setActiveTab(defaultTab);
    }
  }, [getStorageKey, defaultTab]);

  // Função para alterar a aba e salvar no localStorage
  const changeTab = useCallback((newTab: string) => {
    setActiveTab(newTab);
    try {
      localStorage.setItem(getStorageKey(), newTab);
    } catch (e) {
      console.warn('Falha ao salvar aba no localStorage:', e);
    }
  }, [getStorageKey]);

  return { activeTab, changeTab };
}
