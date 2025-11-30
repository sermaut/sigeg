import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  type: 'admin' | 'member';
  permissions: string[];
}

interface AppState {
  // User & Auth
  user: User | null;
  isLoading: boolean;
  
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  language: 'pt' | 'fr' | 'en';
  
  // Selected entities
  selectedGroup: string | null;
  selectedMember: string | null;
  
  // Error handling
  errors: Array<{ id: string; message: string; type: 'error' | 'warning' }>;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'pt' | 'fr' | 'en') => void;
  setSelectedGroup: (groupId: string | null) => void;
  setSelectedMember: (memberId: string | null) => void;
  addError: (error: { message: string; type: 'error' | 'warning' }) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        sidebarOpen: false,
        theme: 'light',
        language: 'pt',
        selectedGroup: null,
        selectedMember: null,
        errors: [],
        
        // Actions
        setUser: (user) => set({ user }),
        setLoading: (isLoading) => set({ isLoading }),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setTheme: (theme) => set({ theme }),
        setLanguage: (language) => set({ language }),
        setSelectedGroup: (selectedGroup) => set({ selectedGroup }),
        setSelectedMember: (selectedMember) => set({ selectedMember }),
        
        addError: (error) => {
          const id = Date.now().toString();
          set((state) => ({
            errors: [...state.errors, { ...error, id }]
          }));
          
          // Auto-remove error after 5 seconds
          setTimeout(() => {
            get().removeError(id);
          }, 5000);
        },
        
        removeError: (id) => set((state) => ({
          errors: state.errors.filter(error => error.id !== id)
        })),
        
        clearErrors: () => set({ errors: [] }),
      }),
      {
        name: 'sigeg_app_state', // Match key used in i18n for instant language sync
        partialize: (state) => ({
          theme: state.theme,
          language: state.language,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'SIGEG App Store' }
  )
);