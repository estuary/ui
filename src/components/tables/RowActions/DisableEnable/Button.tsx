import DisableEnableConfirmation from 'components/tables/RowActions/DisableEnable/Confirmation';
import RowActionButton from 'components/tables/RowActions/Shared/Button';
import UpdateEntity from 'components/tables/RowActions/Shared/UpdateEntity';
import produce from 'immer';
import { SelectTableStoreNames } from 'stores/names';
import { specContainsDerivation } from 'utils/misc-utils';
import { DisableEnableButtonProps } from './types';

const updateShardDisabled = (draftSpec: any, enabling: boolean) => {
    draftSpec.shards = draftSpec.shards ?? {};
    draftSpec.shards.disable = !enabling;
};

function DisableEnableButton({
    enabling,
    selectableTableStoreName,
}: DisableEnableButtonProps) {
    const messages = {
        running: enabling ? 'common.enabling' : 'common.disabling',
        success: enabling ? 'common.enabled' : 'common.disabled',
    };

    // Collections do not have shards in the root they are nested inside
    //  the settings for the derivation
    const shardsAreNested =
        selectableTableStoreName === SelectTableStoreNames.COLLECTION;

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
                    validateNewSpec
                    skippedMessageID="updateEntity.collection.skipped"
                    successMessageID={messages.success}
                    runningMessageID={messages.running}
                    generateNewSpec={(spec) => {
                        // Make sure we have a spec to update
                        if (spec) {
                            // Check if we need to place the settings deeper (collections)
                            if (shardsAreNested) {
                                const { isDerivation, derivationKey } =
                                    specContainsDerivation(spec);

                                // Check if there is a derivation key we can update (derivations)
                                //  if the collection is not a derivation then we cannot enable/disable
                                if (isDerivation) {
                                    return produce<typeof spec>(
                                        spec,
                                        (draftSpec) => {
                                            updateShardDisabled(
                                                draftSpec[derivationKey],
                                                enabling
                                            );
                                        }
                                    );
                                }
                            } else {
                                // Not nested so we can update the root (captures and materializations)
                                return produce<typeof spec>(
                                    spec,
                                    (draftSpec) => {
                                        updateShardDisabled(
                                            draftSpec,
                                            enabling
                                        );
                                    }
                                );
                            }
                        }
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
