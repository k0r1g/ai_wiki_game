import React, { useState, useEffect, useRef } from 'react';

interface TimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
    isRunning: boolean;
}

export function Timer({ initialTime, onTimeUp, isRunning }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime <= 1) {
                        clearInterval(intervalRef.current!);
                        onTimeUp();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setTimeLeft(initialTime);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, initialTime, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-xl font-bold text-white">
            ⏱️ Time: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
}