import { useEffect } from 'react';
import { AppData } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const TABLE_NAME = 'app_data';

export const useSupabaseSyncWithLocalStorage = (
  data: AppData,
  setData: React.Dispatch<React.SetStateAction<AppData>>
) => {
  const configured = isSupabaseConfigured();

  // Save to localStorage (always happens)
  const saveToLocalStorage = (appData: AppData) => {
    localStorage.setItem('life-os-data-v1', JSON.stringify(appData));
  };

  // Sync to Supabase (if configured)
  const syncToSupabase = async (appData: AppData) => {
    if (!configured) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return; // User not authenticated

      const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(
          {
            id: user.data.user.id,
            data: appData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('Failed to sync to Supabase:', error.message);
      }
    } catch (error) {
      console.warn('Supabase sync error:', error);
    }
  };

  // Load from Supabase (if configured)
  const loadFromSupabase = async (): Promise<AppData | null> => {
    if (!configured) return null;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return null;

      const { data: record, error } = await supabase
        .from(TABLE_NAME)
        .select('data')
        .eq('id', user.data.user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, this is okay
          return null;
        }
        console.warn('Failed to load from Supabase:', error.message);
        return null;
      }

      return record?.data || null;
    } catch (error) {
      console.warn('Supabase load error:', error);
      return null;
    }
  };

  // Auto-save on data changes
  useEffect(() => {
    saveToLocalStorage(data);
    syncToSupabase(data);
  }, [data]);

  return { loadFromSupabase, syncToSupabase, saveToLocalStorage };
};
