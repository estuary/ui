import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import KeyValueList from 'src/components/shared/KeyValueList';

function SupportDetails() {
    const intl = useIntl();

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: 'supportConsent.details.title',
            })}
        >
            <KeyValueList
                data={[
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.details.list1',
                        }),
                    },
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.details.list2',
                        }),
                    },
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.details.list3',
                        }),
                    },
                    {
                        title: `For details, see our Privacy Policy and Support
                                Terms`,
                    },
                ]}
            />
        </CardWrapper>
    );
}

export default SupportDetails;
