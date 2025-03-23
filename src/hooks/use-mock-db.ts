
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * A utility hook to simulate database operations when the actual tables
 * don't exist yet. This helps development to proceed even before the
 * database schema is fully set up.
 */
export const useMockDb = <T extends { id: string }>(initialData: T[] = []) => {
  const [items, setItems] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const findById = (id: string) => {
    return items.find(item => item.id === id) || null;
  };

  const create = async (item: Omit<T, 'id'>) => {
    try {
      setIsLoading(true);
      // Create a mock item with a generated ID
      const newItem = {
        ...item,
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      } as T;
      
      setItems(prevItems => [newItem, ...prevItems]);
      
      toast({
        title: 'Item created',
        description: 'New item has been created in mock database',
      });
      
      return { data: newItem, error: null };
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create item in mock database',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setIsLoading(true);
      
      const itemIndex = items.findIndex(item => item.id === id);
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }
      
      const updatedItems = [...items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };
      
      setItems(updatedItems);
      
      toast({
        title: 'Item updated',
        description: 'Item has been updated in mock database',
      });
      
      return { data: updatedItems[itemIndex], error: null };
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update item in mock database',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setIsLoading(true);
      
      const filteredItems = items.filter(item => item.id !== id);
      setItems(filteredItems);
      
      toast({
        title: 'Item deleted',
        description: 'Item has been deleted from mock database',
      });
      
      return { error: null };
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item from mock database',
        variant: 'destructive',
      });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const getAll = () => {
    return items;
  };

  const filterBy = (predicate: (item: T) => boolean) => {
    return items.filter(predicate);
  };

  return {
    items,
    isLoading,
    findById,
    create,
    update,
    remove,
    getAll,
    filterBy,
  };
};
