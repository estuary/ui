import { useCallback } from 'react';

// This checks that user input is a child of one of the provided root strings,
// or could be if the user continues typing.
// for example, for root "acmeCo/", then "acme" is valid, as is "acmeCo/abc", but "otherCo/" is not valid.
export function useCouldMatchRoot(roots: string[]) {
    return useCallback(
        (value: string) => {
            if (roots.length === 0) return true;

            const matchesRoot = roots.some(
                (prefix) => prefix.startsWith(value) || value.startsWith(prefix)
            );

            if (matchesRoot) return true;

            return roots.length === 1
                ? `Must start with "${roots[0]}"`
                : `Must start with one of: ${roots.map((root) => `\`${root}\``).join(', ')}`;
        },
        [roots]
    );
}
