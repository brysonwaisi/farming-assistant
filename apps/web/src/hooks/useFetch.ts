import { useState, useEffect } from "react";
import { pubRequest } from "../reqMethods";

export const useFetch = <T = unknown>(path: string) => {
  const [data, setData] = useState<T | T[]>([]);
  const [loading, setLoading] = useState<boolean>(!!path);
  const [error, setError] = useState<boolean>(false);

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
        const res = await pubRequest.get<T>(path);
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
