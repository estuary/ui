import { useIntl } from 'react-intl';

import KeyValueList, { KeyValue } from 'components/shared/KeyValueList';

import { hasLength } from 'utils/misc-utils';

import { ErrorDetails } from './types';

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
