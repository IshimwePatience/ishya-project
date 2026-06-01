import { useState, useEffect } from 'react';
import axios from 'axios';

const usePreferences = (pageKey) => {
  const [zoom, setZoom] = useState(50);
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return;

        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user-preferences`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const pagePref = response.data.find(p => p.pageKey === pageKey);
        if (pagePref) {
          setZoom(pagePref.zoomLevel);
          setViewMode(pagePref.viewMode);
        }
      } catch (error) {
        console.error('Failed to fetch user preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [pageKey]);

  const savePreference = async (newZoom, newViewMode) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return;

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user-preferences`, {
        pageKey,
        zoomLevel: newZoom !== undefined ? newZoom : zoom,
        viewMode: newViewMode !== undefined ? newViewMode : viewMode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (newZoom !== undefined) setZoom(newZoom);
      if (newViewMode !== undefined) setViewMode(newViewMode);
    } catch (error) {
      console.error('Failed to save user preference');
    }
  };

  return { zoom, setZoom: (val) => savePreference(val, undefined), viewMode, setViewMode: (val) => savePreference(undefined, val), loading };
};

export default usePreferences;
