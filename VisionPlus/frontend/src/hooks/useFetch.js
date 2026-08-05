import { useCallback, useEffect, useState } from "react";

export function useFetch(requestFn, deps = [], pollMs = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await requestFn();

      setData(response.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [requestFn, ...deps]);

  useEffect(() => {
    refetch();

    if (pollMs > 0) {
      const interval = setInterval(refetch, pollMs);
      return () => clearInterval(interval);
    }
  }, [refetch, pollMs]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}