
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface FormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  footer?: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
}

export function FormSheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitLabel = 'Save',
  isSubmitting = false,
  footer,
  side = 'right',
}: FormSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={isOpen => !isOpen && onClose()}>
      <SheetContent 
        className="sm:max-w-[600px] overflow-y-auto flex flex-col h-full p-0 transition-transform duration-300 ease-in-out" 
        side={side}
      >
        <SheetHeader className="px-6 pt-6 pb-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white">
          <SheetTitle className="text-xl font-bold text-white">{title}</SheetTitle>
          {description && (
            <SheetDescription className="text-sm opacity-90 mt-1 text-white">
              {description}
            </SheetDescription>
          )}
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {(footer || onSubmit) && (
          <SheetFooter className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
            {footer ? (
              footer
            ) : (
              <>
                <Button type="button" variant="outline" onClick={onClose} className="mr-2">
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                  onClick={onSubmit}
                >
                  {isSubmitting ? 'Salvando...' : submitLabel}
                </Button>
              </>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
