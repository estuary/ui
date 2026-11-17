import { useCallback } from 'react';

import { createSearchParams, useSearchParams } from 'react-router-dom';

import { encodeParamVal } from 'src/utils/misc-utils';

// Returns a builder that merges values into a copy of the current search
// params. It does not navigate — the caller navigates with (or links to) the
// returned URLSearchParams. An array value replaces the key with one entry
// per element; undefined deletes the key.
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
