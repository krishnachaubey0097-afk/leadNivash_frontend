import { useState, useEffect } from 'react';

export const useServerWaking = (isLoading: boolean, thresholdMs = 4000): boolean => {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let timer: any = null;
    if (isLoading) {
      timer = setTimeout(() => {
        setIsWaking(true);
      }, thresholdMs);
    } else {
      setIsWaking(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, thresholdMs]);

  return isWaking;
};
