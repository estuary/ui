import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

import KeyValueList from 'src/components/shared/KeyValueList';
import { hasLength } from 'src/utils/misc-utils';

interface Props {
    errors: any;
    config?: any;
    configEmptyMessage?: string;
    errorMessage?: string;
    title?: string;
}

function SectionError({
    config,
    configEmptyMessage,
    errorMessage,
    errors,
    title,
}: Props) {
    const intl = useIntl();
    const filteredErrorsList: any[] = [];

    if (config && isEmpty(config)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: configEmptyMessage,
            }),
        });
    } else if (hasLength(errors)) {
        if (errorMessage) {
            filteredErrorsList.push({
                title: intl.formatMessage({
                    id: errorMessage,
                }),
            });
        } else {
            errors.forEach((error: any) => {
                filteredErrorsList.push({
                    title: error.message,
                });
            });
        }
    }

    return (
        <KeyValueList
            data={filteredErrorsList}
            sectionTitle={intl.formatMessage({ id: title })}
        />
    );
}

export default SectionError;
