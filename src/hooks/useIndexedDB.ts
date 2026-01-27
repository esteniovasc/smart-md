import { useEffect, useState } from 'react';
import { get, set as idbSet, del, clear } from 'idb-keyval';

/**
 * Hook para persistir dados em IndexedDB (idb-keyval)
 * Útil para offline-first persistence
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>, () => Promise<void>] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [, setIsLoading] = useState(true);

  // Carregar valor do IDB na montagem
  useEffect(() => {
    const loadValue = async () => {
      try {
        const item = await get(key);
        if (item !== undefined) {
          setStoredValue(item as T);
        }
      } catch (error) {
        console.error(`Erro ao carregar ${key} do IDB:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Salvar valor no IDB
  const setValue = async (value: T) => {
    try {
      setStoredValue(value);
      await idbSet(key, value);
    } catch (error) {
      console.error(`Erro ao salvar ${key} no IDB:`, error);
    }
  };

  // Deletar valor do IDB
  const deleteValue = async () => {
    try {
      setStoredValue(initialValue);
      await del(key);
    } catch (error) {
      console.error(`Erro ao deletar ${key} do IDB:`, error);
    }
  };

  return [storedValue, setValue, deleteValue];
}

/**
 * Hook para sincronizar estado com IDB
 */
export function useIndexedDB<T>(
  key: string,
  initialValue?: T
): {
  data: T | undefined;
  isLoading: boolean;
  save: (data: T) => Promise<void>;
  delete: () => Promise<void>;
  clear: () => Promise<void>;
} {
  const [data, setData] = useState<T | undefined>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const item = await get(key);
        setData(item);
      } catch (error) {
        console.error(`Erro ao carregar ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key]);

  const save = async (newData: T) => {
    try {
      setData(newData);
      await idbSet(key, newData);
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
    }
  };

  const deleteData = async () => {
    try {
      setData(undefined);
      await del(key);
    } catch (error) {
      console.error(`Erro ao deletar ${key}:`, error);
    }
  };

  const clearAll = async () => {
    try {
      setData(undefined);
      await clear();
    } catch (error) {
      console.error(`Erro ao limpar IDB:`, error);
    }
  };

  return {
    data,
    isLoading,
    save,
    delete: deleteData,
    clear: clearAll,
  };
}
