import { useState, useCallback } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_BACKEND_BASE_URL;
const API = `${BASE}/api/v1/theultimatechallenge/library`;

export function useQuestions() {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchQuestions = useCallback(async ({ level, folder, search, difficulty, sort, page = 1, limit = 100 } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (level) params.level = level;
      if (folder && folder !== 'all') params.folder = folder;
      if (search) params.search = search;
      if (difficulty) params.difficulty = difficulty;
      if (sort) params.sort = sort;

      const res = await axios.get(`${API}/questions`, { params, withCredentials: true });
      setQuestions(res.data.data.questions);
      setPagination(res.data.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createQuestion = useCallback(async (payload) => {
    const res = await axios.post(`${API}/questions`, payload, { withCredentials: true });
    return res.data.data.question;
  }, []);

  const updateQuestion = useCallback(async (id, payload) => {
    const res = await axios.put(`${API}/questions/${id}`, payload, { withCredentials: true });
    return res.data.data.question;
  }, []);

  const deleteQuestion = useCallback(async (id) => {
    await axios.delete(`${API}/questions/${id}`, { withCredentials: true });
  }, []);

  const uploadImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axios.post(`${API}/upload-image`, formData, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  }, []);

  const fetchSelectedQuestions = useCallback(async (sessionId) => {
    const res = await axios.get(`${API}/session/${sessionId}/selected-questions`, { withCredentials: true });
    return res.data.data;
  }, []);

  const saveSelectedQuestions = useCallback(async (sessionId, levelsPayload) => {
    const res = await axios.post(
      `${API}/session/${sessionId}/select-questions`,
      levelsPayload,
      { withCredentials: true },
    );
    return res.data;
  }, []);

  const moveQuestions = useCallback(async (questionIds, targetFolder) => {
    const res = await axios.put(`${API}/questions/move`, { questionIds, targetFolder }, { withCredentials: true });
    return res.data;
  }, []);

  const copyQuestions = useCallback(async (questionIds, targetFolder) => {
    const res = await axios.post(`${API}/questions/copy`, { questionIds, targetFolder }, { withCredentials: true });
    return res.data;
  }, []);

  return {
    questions, pagination, loading, error,
    fetchQuestions, createQuestion, updateQuestion, deleteQuestion,
    uploadImage, fetchSelectedQuestions, saveSelectedQuestions,
    moveQuestions, copyQuestions
  };
}
