import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Reusable hook for leaderboard refresh functionality.
 * Provides manual refresh, auto-refresh with toggle, timestamp display,
 * and intelligent pause behavior when browser tab is inactive.
 * 
 * @param {Function} fetchFn - Function to call to fetch data
 * @param {Object} options - Configuration options
 * @param {number} options.intervalMs - Auto-refresh interval in milliseconds (default: 30000)
 * @param {boolean} options.autoRefreshEnabled - Whether auto-refresh starts enabled (default: true)
 * @param {Function} options.shouldSkipRefresh - Optional function that returns true to skip auto-refresh
 * @returns {Object} - State and handlers for the leaderboard refresh
 */
export const useLeaderboardRefresh = (fetchFn, options = {}) => {
  const {
    intervalMs = 30000,
    autoRefreshEnabled = true,
    shouldSkipRefresh = () => false
  } = options;

  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(autoRefreshEnabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const intervalRef = useRef(null);
  const isVisibleRef = useRef(true);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    
    try {
      await fetchFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn]);

  // Toggle auto-refresh on/off
  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh(prev => !prev);
  }, []);

  // Set up auto-refresh interval
  useEffect(() => {
    if (autoRefresh && isVisibleRef.current) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        // Skip refresh if conditions met
        if (shouldSkipRefresh()) {
          return;
        }
        fetchFn();
        setLastUpdated(new Date());
      }, intervalMs);
    } else {
      // Clear interval if auto-refresh is disabled or tab is inactive
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchFn, intervalMs, shouldSkipRefresh]);

  // Handle visibility API - pause auto-refresh when tab is inactive
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (!document.hidden && autoRefresh) {
        // Tab became visible again, refresh immediately
        fetchFn();
        setLastUpdated(new Date());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoRefresh, fetchFn]);

  // Format timestamp for display
  const formatLastUpdated = useCallback(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }, [lastUpdated]);

  return {
    lastUpdated,
    autoRefresh,
    isRefreshing,
    handleRefresh,
    toggleAutoRefresh,
    formatLastUpdated
  };
};

export default useLeaderboardRefresh;
