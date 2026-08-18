import { useState, useEffect } from 'react';
import { vitalsHistory as initialVitalsHistory } from '../services/mockData';

export const useVitals = () => {
  const [vitalsHistory, setVitalsHistory] = useState(initialVitalsHistory);
  const [currentVitals, setCurrentVitals] = useState(() => {
    const lastVital = initialVitalsHistory[initialVitalsHistory.length - 1];
    return {
      heartRate: lastVital.heartRate,
      systolic: lastVital.systolic,
      diastolic: lastVital.diastolic,
      spo2: lastVital.spo2,
      temperature: lastVital.temperature
    };
  });
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!isConnected) return;

    const generateNextVitals = (prev) => {
      const vary = (val, maxChange, min, max, isFloat = false) => {
        const change = (Math.random() * maxChange * 2) - maxChange;
        let newVal = val + change;
        newVal = Math.max(min, Math.min(max, newVal));
        return isFloat ? Number(newVal.toFixed(1)) : Math.round(newVal);
      };

      return {
        heartRate: vary(prev.heartRate, 3, 60, 100),
        systolic: vary(prev.systolic, 4, 110, 145),
        diastolic: vary(prev.diastolic, 3, 70, 95),
        spo2: vary(prev.spo2, 1, 95, 100),
        temperature: vary(prev.temperature, 0.1, 36.2, 37.5, true)
      };
    };

    const interval = setInterval(() => {
      setCurrentVitals(prev => {
        const next = generateNextVitals(prev);
        
        // Occasionally update history with the new vitals
        setVitalsHistory(prevHistory => {
          if (Math.random() > 0.8) {
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const newHistoryItem = { time: timeStr, ...next };
            return [...prevHistory.slice(1), newHistoryItem];
          }
          return prevHistory;
        });

        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected]);

  return {
    currentVitals,
    vitalsHistory,
    isConnected,
    setIsConnected
  };
};
