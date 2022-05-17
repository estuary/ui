import { Button } from '@mui/material';
import Status from 'components/shared/Entity/Status';
import { useRouteStore } from 'hooks/useRouteStore';
import { FormattedMessage } from 'react-intl';
import { createStoreSelectors, FormStatus } from 'stores/Create';

interface Props {
    close: any;
    materialize?: {
        action: any;
        title: string;
    };
}

function LogDialogActions({ close, materialize }: Props) {
    const entityCreateStore = useRouteStore();

    const formStatus = entityCreateStore(createStoreSelectors.formState.status);

    console.log(formStatus);

    return (
        <>
            <Status />

            <Button
                disabled={
                    formStatus === FormStatus.TESTING ||
                    formStatus === FormStatus.SAVING
                }
                onClick={close}
            >
                <FormattedMessage id="cta.close" />
            </Button>

            {materialize ? (
                <Button
                    disabled={formStatus !== FormStatus.SUCCESS}
                    onClick={materialize.action}
                >
                    <FormattedMessage id={materialize.title} />
                </Button>
            ) : null}
        </>
    );
}

export default LogDialogActions;
