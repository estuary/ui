import type { CollectionConfigProps } from 'src/components/collection/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import SectionAlertIndicator from 'src/components/collection/SectionAlertIndicator';
import MessageWithLink from 'src/components/content/MessageWithLink';
import BindingsMultiEditor from 'src/components/editor/Bindings';
import AlertBox from 'src/components/shared/AlertBox';
import WrapperWithHeader from 'src/components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'src/components/shared/ErrorBoundryWrapper';
import { useBinding_hydrationErrorsExist } from 'src/stores/Binding/hooks';

function CollectionConfig({
    draftSpecs,
    readOnly = false,
    hideBorder,
    RediscoverButton,
}: CollectionConfigProps) {
    const intl = useIntl();

    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();

    return (
        <WrapperWithHeader
            hideBorder={hideBorder}
            header={<SectionAlertIndicator />}
        >
            <ErrorBoundryWrapper>
                {bindingHydrationErrorsExist ? (
                    <AlertBox
                        severity="error"
                        title={
                            <Typography component="span">
                                {intl.formatMessage({
                                    id: 'workflows.error.initFormSection',
                                })}
                            </Typography>
                        }
                        short
                    >
                        <MessageWithLink messageID="error.message" />
                    </AlertBox>
                ) : (
                    <BindingsMultiEditor
                        draftSpecs={draftSpecs}
                        readOnly={readOnly}
                        RediscoverButton={RediscoverButton}
                    />
                )}
            </ErrorBoundryWrapper>
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
