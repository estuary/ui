import KeyValueList from 'components/shared/KeyValueList';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

interface Props {
    errors: any;
    errorMessage?: string;
    config?: any;
    configEmptyMessage?: string;
}

function SectionError({
    config,
    errors,
    errorMessage,
    configEmptyMessage,
}: Props) {
    const intl = useIntl();
    const filteredErrorsList: any[] = [];

    if (config && isEmpty(config)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: configEmptyMessage,
            }),
        });
    } else if (errors.length > 0) {
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

    return <KeyValueList data={filteredErrorsList} />;
}

export default SectionError;
