import { useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import KeyValueList from 'src/components/shared/KeyValueList';

function SupportBenefits() {
    const intl = useIntl();

    return (
        <CardWrapper
            message={intl.formatMessage({
                id: 'supportConsent.benefits.title',
            })}
        >
            <KeyValueList
                data={[
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.benefits.list1',
                        }),
                    },
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.benefits.list2',
                        }),
                    },
                    {
                        title: intl.formatMessage({
                            id: 'supportConsent.benefits.list3',
                        }),
                    },
                ]}
            />
        </CardWrapper>
    );
}

export default SupportBenefits;
