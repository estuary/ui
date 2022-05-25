import DisableEnableConfirmation from 'components/tables/RowActions/DisableEnable/Confirmation';
import DisableEnableProgress from 'components/tables/RowActions/DisableEnable/Progress';
import RowActionButton from 'components/tables/RowActions/Shared/Button';

export interface DisableEnableButtonProps {
    enabling: boolean;
}

function DisableEnableButton({ enabling }: DisableEnableButtonProps) {
    return (
        <RowActionButton
            confirmationMessage={
                <DisableEnableConfirmation enabling={enabling} />
            }
            renderProgress={(item, index, onFinish) => (
                <DisableEnableProgress
                    key={`Item-disable_enable-${index}`}
                    entity={item}
                    onFinish={onFinish}
                    enabling={enabling}
                />
            )}
            messageID={enabling ? 'cta.enable' : 'cta.disable'}
        />
    );
}

export default DisableEnableButton;
