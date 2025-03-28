import type { ErrorDetails } from 'src/components/shared/Error/types';
import type { KeyValue } from 'src/components/shared/KeyValueList';

import { useIntl } from 'react-intl';

import KeyValueList from 'src/components/shared/KeyValueList';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    error?: ErrorDetails;
}

// This is not visible to users. This can be used while
//  developing new code to see all the details supabase is returning
function Details({ error }: Props) {
    const intl = useIntl();

    const details: KeyValue[] = [];
    if (error) {
        if (error.description) {
            details.push({
                title: intl.formatMessage({ id: 'error.descriptionLabel' }),
                val: error.description,
            });
        }

        if (error.code) {
            details.push({
                title: intl.formatMessage({ id: 'error.codeLabel' }),
                val: error.code,
            });
        }

        if (error.details) {
            details.push({
                title: intl.formatMessage({ id: 'error.detailsLabel' }),
                val: error.details,
            });
        }

        if (error.hint) {
            details.push({
                title: intl.formatMessage({ id: 'error.hintLabel' }),
                val: error.hint,
            });
        }
    }

    if (!hasLength(details)) {
        return null;
    }

    return <KeyValueList data={details} />;
}

export default Details;
