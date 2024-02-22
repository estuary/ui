import { Typography, useTheme } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import BindingsMultiEditor from 'components/editor/Bindings';
import { useBindingsEditorStore_fullSourceErrorsExist } from 'components/editor/Bindings/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import ErrorBoundryWrapper from 'components/shared/ErrorBoundryWrapper';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { WarningCircle } from 'iconoir-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useBinding_hydrationErrorsExist } from 'stores/Binding/hooks';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';

interface Props {
    draftSpecs: DraftSpecQuery[];
    readOnly?: boolean;
    hideBorder?: boolean;
    RediscoverButton?: ReactNode;
}

function CollectionConfig({
    draftSpecs,
    readOnly = false,
    hideBorder,
    RediscoverButton,
}: Props) {
    const theme = useTheme();

    // Binding Store
    const bindingHydrationErrorsExist = useBinding_hydrationErrorsExist();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();
    const fullSourceErrorsExist =
        useBindingsEditorStore_fullSourceErrorsExist();

    const collectionsHasErrors = useResourceConfig_collectionErrorsExist();

    const hasErrors =
        bindingHydrationErrorsExist ||
        resourceConfigHasErrors ||
        fullSourceErrorsExist;

    const hasWarnings = collectionsHasErrors;

    return (
        <WrapperWithHeader
            hideBorder={hideBorder}
            header={
                <>
                    {hasErrors || hasWarnings ? (
                        <WarningCircle
                            style={{
                                marginRight: 4,
                                fontSize: 12,
                                color: hasErrors
                                    ? theme.palette.error.main
                                    : theme.palette.warning.main,
                            }}
                        />
                    ) : null}

                    <Typography variant="subtitle1">
                        <FormattedMessage
                            id={`${messagePrefix}.collections.heading`}
                        />
                    </Typography>
                </>
            }
        >
            <ErrorBoundryWrapper>
                {bindingHydrationErrorsExist ? (
                    <AlertBox
                        severity="error"
                        title={
                            <FormattedMessage id="workflows.error.initFormSection" />
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
