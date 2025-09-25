import React, { useState, useEffect, useRef } from 'react';

const easeOutExpo = (t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export const useCountUp = (end: number, duration: number = 2000) => {
    const [count, setCount] = useState(0);
    const frameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
            }

            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = easeOutExpo(percentage);
            const currentCount = Math.floor(easedPercentage * end);

            setCount(currentCount);

            if (progress < duration) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            startTimeRef.current = null;
        };
    }, [end, duration]);

    return count;
};
