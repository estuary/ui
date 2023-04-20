import { Typography, useTheme } from '@mui/material';
import MessageWithLink from 'components/content/MessageWithLink';
import BindingsMultiEditor from 'components/editor/Bindings';
import AlertBox from 'components/shared/AlertBox';
import WrapperWithHeader from 'components/shared/Entity/WrapperWithHeader';
import { DraftSpecQuery } from 'hooks/useDraftSpecs';
import { WarningCircle } from 'iconoir-react';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useFormStateStore_messagePrefix } from 'stores/FormState/hooks';
import {
    useResourceConfig_collectionErrorsExist,
    useResourceConfig_hydrationErrorsExist,
    useResourceConfig_resourceConfigErrorsExist,
} from 'stores/ResourceConfig/hooks';

interface Props {
    draftSpecs: DraftSpecQuery[];
    RediscoverButton?: ReactNode;
    hideBorder?: boolean;
    readOnly?: boolean;
}

function CollectionConfig({
    draftSpecs,
    readOnly = false,
    hideBorder,
    RediscoverButton,
}: Props) {
    const theme = useTheme();

    // Form State Store
    const messagePrefix = useFormStateStore_messagePrefix();

    // Resource Config Store
    const resourceConfigHydrationErrorsExist =
        useResourceConfig_hydrationErrorsExist();

    const resourceConfigHasErrors =
        useResourceConfig_resourceConfigErrorsExist();

    const collectionsHasErrors = useResourceConfig_collectionErrorsExist();

    const hasErrors =
        resourceConfigHydrationErrorsExist ||
        resourceConfigHasErrors ||
        collectionsHasErrors;

    return (
        <WrapperWithHeader
            hideBorder={hideBorder}
            header={
                <>
                    {hasErrors ? (
                        <WarningCircle
                            style={{
                                marginRight: 4,
                                fontSize: 12,
                                color: theme.palette.error.main,
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
            {resourceConfigHydrationErrorsExist ? (
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
        </WrapperWithHeader>
    );
}

export default CollectionConfig;
