import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from 'sonner';

export function GlobalErrorToast() {
  const { errors, removeError } = useAppStore();

  useEffect(() => {
    errors.forEach((error) => {
      if (error.type === 'error') {
        toast.error(error.message, {
          id: error.id,
          action: {
            label: 'Fechar',
            onClick: () => removeError(error.id),
          },
        });
      } else if (error.type === 'warning') {
        toast.warning(error.message, {
          id: error.id,
          action: {
            label: 'Fechar',
            onClick: () => removeError(error.id),
          },
        });
      }
    });
  }, [errors, removeError]);

  return null;
}