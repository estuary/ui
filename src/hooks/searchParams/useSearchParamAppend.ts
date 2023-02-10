import { useCallback } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';

export default function useSearchParamAppend() {
    const [searchParams] = useSearchParams();

    const appendParam = useCallback(
        (obj: { [k: string]: any }) => {
            console.log('append', obj);
            const sp = createSearchParams(searchParams);
            Object.entries(obj).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    sp.delete(key);
                    sp.append(key, `[${val.join(',')}]`);
                } else if (val === undefined) {
                    sp.delete(key);
                } else {
                    sp.set(key, val);
                }
            });
            return sp;
        },
        [searchParams]
    );

    return appendParam;
}
