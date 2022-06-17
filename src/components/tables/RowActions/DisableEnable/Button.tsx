import DisableEnableConfirmation from 'components/tables/RowActions/DisableEnable/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';
import { SelectTableStoreNames } from 'context/Zustand';
import produce from 'immer';

export interface DisableEnableButtonProps {
    enabling: boolean;
    selectableTableStoreName:
        | SelectTableStoreNames.CAPTURE
        | SelectTableStoreNames.MATERIALIZATION;
}

function DisableEnableButton({
    enabling,
    selectableTableStoreName,
}: DisableEnableButtonProps) {
    const messages = {
        running: enabling ? 'common.enabling' : 'common.disabling',
        success: enabling ? 'common.enabled' : 'common.disabled',
    };

    return (
        <RowActionButton
            confirmationMessage={
                <DisableEnableConfirmation
                    enabling={enabling}
                    selectableTableStoreName={selectableTableStoreName}
                />
            }
            renderProgress={(item, index, onFinish) => (
                <UpdateEntity
                    key={`Item-disable_enable-${index}`}
                    entity={item}
                    onFinish={onFinish}
                    successMessageID={messages.success}
                    runningMessageID={messages.running}
                    generateNewSpec={(spec) => {
                        return produce<typeof spec>(spec, (draftSpec) => {
                            if (draftSpec) {
                                draftSpec.shards = draftSpec.shards ?? {};
                                draftSpec.shards.disable = !enabling;
                            }
                        });
                    }}
                    generateNewSpecType={(entity) => entity.spec_type}
                    selectableStoreName={selectableTableStoreName}
                />
            )}
            messageID={enabling ? 'cta.enable' : 'cta.disable'}
            selectableTableStoreName={selectableTableStoreName}
        />
    );
}

export default DisableEnableButton;
