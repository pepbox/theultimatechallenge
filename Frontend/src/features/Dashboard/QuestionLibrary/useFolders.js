import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_BASE_URL;
const API = `${BASE}/api/v1/theultimatechallenge/library`;

export function useFolders() {
  const [folders, setFolders] = useState(['General']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/folders`, { withCredentials: true });
      setFolders(res.data.data.folders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (name) => {
    const res = await axios.post(`${API}/folders`, { name }, { withCredentials: true });
    await fetchFolders();
    return res.data.data.folder;
  }, [fetchFolders]);

  const renameFolder = useCallback(async (oldName, newName) => {
    await axios.put(
      `${API}/folders/${encodeURIComponent(oldName)}`,
      { newName },
      { withCredentials: true },
    );
    await fetchFolders();
  }, [fetchFolders]);

  const deleteFolder = useCallback(async (name) => {
    await axios.delete(`${API}/folders/${encodeURIComponent(name)}`, { withCredentials: true });
    await fetchFolders();
  }, [fetchFolders]);

  return { folders, loading, error, fetchFolders, createFolder, renameFolder, deleteFolder };
}
