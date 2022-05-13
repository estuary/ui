import { Button } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { createStoreSelectors, FormStatus } from 'stores/Create';
import { getStore } from 'stores/Repo';

interface Props {
    close: any;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, materialize }: Props) {
    const entityCreateStore = getStore(useRouteStore());

    const formStatus = entityCreateStore(createStoreSelectors.formState.status);

    console.log(formStatus);

    return (
        <>
            <Status />

            {materialize ? (
                <Button
                    disabled={formStatus !== FormStatus.SUCCESS}
                    onClick={materialize.action}
                >
                    <FormattedMessage id={materialize.title} />
                </Button>
            ) : null}

            <Button
                disabled={
                    formStatus === FormStatus.TESTING ||
                    formStatus === FormStatus.SAVING
                }
                onClick={close}
            >
                <FormattedMessage id="cta.close" />
            </Button>
        </>
    );
}

export default LogDialogActions;
