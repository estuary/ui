import { useCallback } from 'react';

import { createSearchParams, useSearchParams } from 'react-router-dom';

import { encodeParamVal } from 'src/utils/misc-utils';

export default function useSearchParamAppend() {
    const [searchParams] = useSearchParams();

    const appendParam = useCallback(
        (obj: { [k: string]: any }) => {
            const sp = createSearchParams(searchParams);
            Object.entries(obj).forEach(([key, val]) => {
                if (Array.isArray(val)) {
                    sp.delete(key);

                    val.forEach((element) => {
                        sp.append(key, encodeParamVal(element));
                    });
                } else if (val === undefined) {
                    sp.delete(key);
                } else {
                    sp.set(key, encodeParamVal(val));
                }
            });
            return sp;
        },
        [searchParams]
    );

    return appendParam;
}
