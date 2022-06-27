import KeyValueList from 'components/shared/KeyValueList';
import { isEmpty } from 'lodash';
import { useIntl } from 'react-intl';

interface Props {
    errors: any;
    config?: any;
    configEmptyMessage?: string;
}

function SectionError({ config, errors, configEmptyMessage }: Props) {
    const intl = useIntl();
    const filteredErrorsList: any[] = [];

    if (config && isEmpty(config)) {
        filteredErrorsList.push({
            title: intl.formatMessage({
                id: configEmptyMessage,
            }),
        });
    } else if (errors.length > 0) {
        errors.forEach((error: any) => {
            filteredErrorsList.push({
                title: error.message,
            });
        });
    }

    return <KeyValueList data={filteredErrorsList} />;
}

export default SectionError;
