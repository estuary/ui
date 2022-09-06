import { createSearchParams, useSearchParams } from 'react-router-dom';

export default function useSearchParamAppend() {
    const [searchParams] = useSearchParams();

    return (obj: { [k: string]: any }) => {
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
    };
}
