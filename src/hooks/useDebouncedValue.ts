import { useEffect, useState } from 'react';

// Returns `value` once it has stopped changing for `wait` milliseconds. Useful
// for driving presentation that should settle rather than react to every
// keystroke, while the input itself stays fully responsive.
export function useDebouncedValue<T>(value: T, wait: number): T {
    const [settledValue, setSettledValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setSettledValue(value), wait);

        return () => clearTimeout(timeout);
    }, [value, wait]);

    return settledValue;
}
