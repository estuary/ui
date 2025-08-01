import { Box } from '@mui/material';

import { useIntl } from 'react-intl';

import SupportWrapper from 'src/_compliance/guards/EnhancedSupport/SupportWrapper';
import ExternalLink from 'src/components/shared/ExternalLink';
import RegisterPerk from 'src/pages/login/Perk';
import { importantUrls } from 'src/utils/env-utils';

function SupportDetails() {
    const intl = useIntl();

    return (
        <SupportWrapper titleMessageId="supportConsent.details.title">
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list1"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list2"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID="supportConsent.details.list3"
            />
            <RegisterPerk
                disableNoWrap
                disableEmphasisColor
                messageID=""
                customChild={
                    <Box>
                        {intl.formatMessage(
                            {
                                id: 'supportConsent.details.list4',
                            },
                            {
                                privacy: (
                                    <ExternalLink
                                        link={importantUrls.privacyPolicy}
                                        hideIcon
                                    >
                                        {intl.formatMessage({
                                            id: 'supportConsent.details.list4.privacy',
                                        })}
                                    </ExternalLink>
                                ),
                                terms: (
                                    <ExternalLink
                                        link={
                                            importantUrls.enhancedSupportTerms
                                        }
                                        hideIcon
                                    >
                                        {intl.formatMessage({
                                            id: 'supportConsent.details.list4.terms',
                                        })}
                                    </ExternalLink>
                                ),
                            }
                        )}
                    </Box>
                }
            />
        </SupportWrapper>
    );
}

export default SupportDetails;
