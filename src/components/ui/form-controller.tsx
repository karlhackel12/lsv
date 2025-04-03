import React, { useState, useEffect } from 'react';
import { FormSheet } from './form-sheet';

interface FormControllerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
}

/**
 * FormController - Componente para padronizar todos os formulários do sistema,
 * garantindo que sempre abram da direita para a esquerda com uma animação suave.
 */
export function FormController({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Salvar',
  isSubmitting = false,
  footer,
}: FormControllerProps) {
  // Estado interno para controlar a animação de abertura/fechamento
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      // Pequeno atraso para permitir que a animação de fechamento ocorra
      const timeout = setTimeout(() => {
        setMounted(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Sempre use o lado direito para os formulários
  return (
    <FormSheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      onSubmit={onSubmit}
      submitLabel={submitLabel}
      isSubmitting={isSubmitting}
      footer={footer}
      side="right"
    >
      {children}
    </FormSheet>
  );
} 