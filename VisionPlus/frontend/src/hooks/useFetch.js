import { useCallback, useEffect, useState } from 'react'

/**
 * Small polling-friendly data fetcher.
 *
 * @param {Function} requestFn - () => Promise<AxiosResponse>
 * @param {Array} deps - re-fetch when these change
 * @param {number} pollMs - optional interval to auto re-fetch (0 = off)
 */
export function useFetch(requestFn, deps = [], pollMs = 0) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    try {
      setError(null)
      const res = await requestFn()
      setData(res.data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    setLoading(true)
    refetch()
    if (pollMs > 0) {
      const id = setInterval(refetch, pollMs)
      return () => clearInterval(id)
    }
  }, [refetch, pollMs])

  return { data, error, loading, refetch }
}
