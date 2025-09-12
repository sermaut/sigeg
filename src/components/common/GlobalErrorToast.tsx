import { useEffect } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function GlobalErrorToast() {
  const { errors, removeError } = useAppStore();
  const { t } = useTranslation();

  useEffect(() => {
    errors.forEach((error) => {
      if (error.type === 'error') {
        toast.error(error.message, {
          id: error.id,
          action: {
            label: t('common.close'),
            onClick: () => removeError(error.id),
          },
        });
      } else if (error.type === 'warning') {
        toast.warning(error.message, {
          id: error.id,
          action: {
            label: t('common.close'),
            onClick: () => removeError(error.id),
          },
        });
      }
    });
  }, [errors, removeError, t]);

  return null;
}