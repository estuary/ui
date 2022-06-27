import KeyValueList from 'components/shared/KeyValueList';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

interface Props {
    errors: any;
    errorMessage: string;

    config?: any;
    configEmptyMessage?: string;
}

function SectionError({
    config,
    errors,
    configEmptyMessage,
    errorMessage,
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
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: errorMessage,
            }),
        });
    }

    return <KeyValueList data={filteredErrorsList} />;
}

export default SectionError;
