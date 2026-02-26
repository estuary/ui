import { useCallback } from 'react';

import { useIntl } from 'react-intl';

// This checks that user input is a child of one of the provided root strings,
// or could be if the user continues typing.
// for example, for root "acmeCo/", then "acme" is valid, as is "acmeCo/abc", but "otherCo/" is not valid.
export function useCouldMatchRoot(roots: string[]) {
    const intl = useIntl();

    return useCallback(
        (value: string) => {
            if (roots.length === 0) return true;

            const matchesRoot = roots.some(
                (prefix) => prefix.startsWith(value) || value.startsWith(prefix)
            );

            if (matchesRoot) return true;

            return roots.length === 1
                ? intl.formatMessage(
                      { id: 'prefixAutocomplete.mustStartWith.single' },
                      { root: roots[0] }
                  )
                : intl.formatMessage(
                      { id: 'prefixAutocomplete.mustStartWith.multiple' },
                      {
                          roots: roots.map((root) => `\`${root}\``).join(', '),
                      }
                  );
        },
        [intl, roots]
    );
}
