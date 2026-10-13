import { useCallback, useEffect, useState } from 'react'

// Încarcă date la montare (și când se schimbă `deps`); `setData` permite actualizări locale după salvări.
export function useApi(load, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const reload = useCallback(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState((s) => ({ ...s, loading: false, error })))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(reload, [reload])

  const setData = useCallback((update) => setState((s) => ({ ...s, data: update(s.data) })), [])

  return { ...state, setData, reload }
}
