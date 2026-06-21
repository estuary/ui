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

export function SectionError({
    config,
    configEmptyMessage,
    errorMessage,
    errors,
    title,
}: Props) {
    const filteredErrorsList: any[] = [];

    if (config && isEmpty(config)) {
        filteredErrorsList.push({
            title: configEmptyMessage,
        });
    } else if (hasLength(errors)) {
        if (errorMessage) {
            filteredErrorsList.push({
                title: errorMessage,
            });
        } else {
            errors.forEach((error: any) => {
                filteredErrorsList.push({
                    title: error.message,
                });
            });
        }
    }

    return <KeyValueList data={filteredErrorsList} sectionTitle={title} />;
}

/** @deprecated Prefer the named `SectionError` export */
function SectionErrorWrapper({
    configEmptyMessage,
    errorMessage,
    title,
    ...props
}: Props) {
    const intl = useIntl();

    const localize = (id?: string) => (id ? intl.formatMessage({ id }) : id);

    return (
        <SectionError
            {...props}
            configEmptyMessage={localize(configEmptyMessage)}
            errorMessage={localize(errorMessage)}
            title={localize(title)}
        />
    );
}

export default SectionErrorWrapper;
