import type { SxProps, Theme } from '@mui/material';
import type { FieldPath } from 'react-hook-form';
import type { FragmentStore } from 'src/api/gql/storageMappings';
import type { StorageMappingFormData } from 'src/components/admin/Settings/StorageMappings/Dialog/types';

import { useCallback, useEffect, useState } from 'react';

import {
    Box,
    Collapse,
    Divider,
    IconButton,
    Link,
    Stack,
    Typography,
} from '@mui/material';

import { Check, EditPencil, Xmark } from 'iconoir-react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { StorageFields } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/StorageFields';
import { cardHeaderSx } from 'src/context/Theme';

export const primaryStoreSx = {
    px: 1.5,
    py: 1,
    borderRadius: 1,
    bgcolor: 'background.default',
};

function CompactStoreRow({
    store,
    inactive,
    sx,
}: {
    store: FragmentStore;
    inactive?: boolean;
    sx?: SxProps<Theme>;
}) {
    const details: string[] = [store.provider];
    if (store.provider === 'AZURE') {
        if (store.storageAccountName) details.push(store.storageAccountName);
    } else {
        if (store.region) details.push(store.region);
    }
    if (store.storagePrefix) details.push(store.storagePrefix);

    return (
        <Box
            sx={[
                {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    ...primaryStoreSx,
                    opacity: inactive ? 0.6 : 1,
                },
                ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
            ]}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">
                    {store.provider === 'AZURE'
                        ? store.containerName
                        : store.bucket}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: inactive ? 'text.disabled' : 'text.secondary',
                        fontStyle: inactive ? 'italic' : undefined,
                    }}
                >
                    {inactive ? 'Inactive' : 'Primary'}
                </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
                {details.join(' \u00B7 ')}
            </Typography>
        </Box>
    );
}

function NestedFormActions({
    onAccept,
    onCancel,
}: {
    onAccept: () => void;
    onCancel: () => void;
}) {
    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                ...primaryStoreSx,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            }}
        >
            <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={onAccept}
                sx={{
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                Accept <Check width={20} height={20} />
            </Link>
            <Divider orientation="vertical" flexItem />
            <Link
                component="button"
                variant="body2"
                underline="hover"
                onClick={onCancel}
                sx={{
                    display: 'flex',
                    gap: 0.5,
                }}
            >
                Cancel <Xmark width={20} height={20} />
            </Link>
        </Stack>
    );
}

function StoreRowActions({
    onEdit,
    onRemove,
}: {
    onEdit: () => void;
    onRemove: () => void;
}) {
    return (
        <>
            <IconButton size="small" onClick={onEdit}>
                <EditPencil width={16} height={16} />
            </IconButton>
            <IconButton size="small" onClick={onRemove}>
                <Xmark width={16} height={16} />
            </IconButton>
        </>
    );
}

const getStoreKey = (store: FragmentStore) =>
    store.provider +
    store.region +
    (store.provider === 'AZURE' ? store.containerName : store.bucket);

export function StorageLocationsCard({
    formOpen,
    setFormOpen,
}: {
    formOpen: boolean;
    setFormOpen: (editing: boolean) => void;
}) {
    const { control, watch, trigger, getValues } =
        useFormContext<StorageMappingFormData>();
    const { prepend, remove } = useFieldArray({
        control,
        name: 'fragmentStores',
    });

    const fragmentStores = watch('fragmentStores');
    const dataPlanes = watch('dataPlanes');
    const defaultDataPlane = dataPlanes[0];
    const [newKey, setNewKey] = useState<string | null>(null);
    const hasNewStore = newKey !== null;

    const [incomingKey, setIncomingKey] = useState<string | null>(null);
    const [outgoingKey, setOutgoingKey] = useState<string | null>(null);

    // Items mount with Collapse `in={false}`, then this clears incomingIds
    // on the next frame so they transition to `in={true}` and animate open.
    useEffect(() => {
        if (!incomingKey) return;
        const frame = requestAnimationFrame(() => setIncomingKey(null));
        return () => cancelAnimationFrame(frame);
    }, [incomingKey]);

    const handleStartAdding = () => {
        // important to set nulls otherwise the new store will inherit values
        // from the previously first store (since the form fields are all mapped by index)
        const newStore = {
            provider: defaultDataPlane?.cloudProvider,
            region:
                defaultDataPlane?.cloudProvider === 'AWS'
                    ? defaultDataPlane?.region
                    : null,
            bucket: null,
            storagePrefix: null,
            containerName: null,
            storageAccountName: null,
            accountTenantId: null,
        };
        prepend(newStore);
        setFormOpen(true);
    };

    const handleAcceptNestedForm = async () => {
        const store = getValues('fragmentStores.0');

        // validate all fields on the new store to present per-field errors, if there are any
        const fieldsToValidate = Object.keys(store).map(
            (key) =>
                `fragmentStores.0.${key}` as FieldPath<StorageMappingFormData>
        );
        const valid = await trigger(fieldsToValidate);
        if (valid) {
            const addKey = getStoreKey(fragmentStores[0]);
            setNewKey(addKey);
            setIncomingKey(addKey);
            setFormOpen(false);
        }
    };

    const [closing, setClosing] = useState(false);

    const handleCancelNestedForm = () => {
        setClosing(true);
    };

    const handleCancelNestedComplete = useCallback(() => {
        if (closing) {
            setClosing(false);
            setFormOpen(false);
            setNewKey(null);
            remove(0);
        }
    }, [closing, remove, setFormOpen]);

    const handleRemoveStore = (key: string) => {
        setNewKey(null);
        setOutgoingKey(key);
    };

    const handleStoreRemoveExited = useCallback(() => {
        if (!outgoingKey) return;
        const index = fragmentStores.findIndex(
            (s) => getStoreKey(s) === outgoingKey
        );
        if (index !== -1) {
            remove(index);
        }
        setOutgoingKey(null);
    }, [outgoingKey, fragmentStores, remove]);

    const showNestedStorageForm = formOpen && !closing;

    // complicated logic to coordinate animations for nested form or store row with the historicalDataNote
    const showHistoricalDataNote = closing
        ? fragmentStores.length > 2
        : fragmentStores.length > (outgoingKey ? 2 : 1);

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // if the nested form is open, negative margin shrinks some unused whitespace above the form actions
                    mb: showNestedStorageForm ? -4 : 0,
                    transition: (theme) =>
                        theme.transitions.create('margin-bottom'),
                }}
            >
                <Typography sx={cardHeaderSx}>Storage Locations</Typography>
                <Collapse in={!showNestedStorageForm}>
                    <Link
                        component="button"
                        variant="body2"
                        underline="hover"
                        // disabled prop prevents onClick from firing, but it doesn't prevent the link from looking clickable
                        // disabled={hasNewStore}
                        onClick={handleStartAdding}
                        sx={{
                            opacity: hasNewStore ? 0.5 : 1,
                            pointerEvents: hasNewStore ? 'none' : 'auto',
                        }}
                    >
                        Change primary store
                    </Link>
                </Collapse>
            </Box>
            <Stack spacing={1}>
                <Collapse
                    in={showNestedStorageForm}
                    onExited={handleCancelNestedComplete}
                    unmountOnExit
                >
                    <Stack alignItems="flex-end">
                        <NestedFormActions
                            onAccept={handleAcceptNestedForm}
                            onCancel={handleCancelNestedForm}
                        />
                        <StorageFields
                            defaultDataPlane={dataPlanes[0]}
                            sx={{
                                ...primaryStoreSx,
                                borderTopRightRadius: 0,
                            }}
                        />
                    </Stack>
                </Collapse>
                <Flipper
                    flipKey={fragmentStores
                        .filter((_, i) => !(formOpen && i === 0))
                        .map(getStoreKey)
                        .join(',')}
                >
                    {fragmentStores.map((store, index) => {
                        // skip the store being edited in the nested form
                        if (formOpen && index === 0) return null;

                        const key = getStoreKey(store);
                        const showRowActions = key === newKey;
                        const animate =
                            key !== outgoingKey && key !== incomingKey;

                        return (
                            <Collapse
                                key={key}
                                in={animate}
                                onExited={handleStoreRemoveExited}
                                unmountOnExit
                            >
                                <Flipped flipId={key}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ mb: 1 }}
                                    >
                                        <CompactStoreRow
                                            sx={{ flex: 1 }}
                                            store={store}
                                            inactive={index > 0}
                                        />
                                        {showRowActions ? (
                                            <StoreRowActions
                                                onEdit={() => setFormOpen(true)}
                                                onRemove={() =>
                                                    handleRemoveStore(key)
                                                }
                                            />
                                        ) : null}
                                    </Stack>
                                </Flipped>
                            </Collapse>
                        );
                    })}
                </Flipper>
                <Collapse in={showHistoricalDataNote}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Previous stores are kept for historical data. New data
                        will be directed to the primary store.
                    </Typography>
                </Collapse>
            </Stack>
        </>
    );
}
