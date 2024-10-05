import React, { useState, useEffect } from 'react';

interface TimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
}

export function Timer({ initialTime, onTimeUp }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState(initialTime);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timerId = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timerId);
    }, [timeLeft, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="text-xl font-bold text-white">
            Time Left: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </div>
    );
}