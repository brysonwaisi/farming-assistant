import { useState, useEffect } from "react";
import { pubRequest } from "../reqMethods";

export const useFetch = (path) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!path) {
      setData([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    const run = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await pubRequest.get(path);
        if (active) setData(res.data);
      } catch (err) {
        if (active) {
          setData([]);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [path]);

  return { data, loading, error };
};
