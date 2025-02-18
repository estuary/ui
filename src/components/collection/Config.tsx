import { Typography } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import BindingsMultiEditor from 'components/editor/Bindings';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { useIntl } from 'react-intl';
import { useBinding_hydrationErrorsExist } from 'stores/Binding/hooks';
import SectionAlert from './SectionAlert';
import { CollectionConfigProps } from './types';

function CollectionConfig({
    draftSpecs,
    readOnly = false,
    hideBorder,
    RediscoverButton,
}: CollectionConfigProps) {
    const intl = useIntl();

    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();

    return (
        <WrapperWithHeader hideBorder={hideBorder} header={<SectionAlert />}>
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
