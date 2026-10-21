import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, wait: number): T {
    const [settledValue, setSettledValue] = useState(value);

    useEffect(() => {
        const timeout = setTimeout(() => setSettledValue(value), wait);

        return () => clearTimeout(timeout);
    }, [value, wait]);

    return settledValue;
}
