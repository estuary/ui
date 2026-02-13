import type {
    CloudProvider,
    FragmentStore,
    StorageMappingFormData,
} from 'src/components/admin/Settings/StorageMappings/Dialog/schema';

import { useCallback, useEffect, useState } from 'react';

import {
    Box,
    Collapse,
    IconButton,
    Link,
    Stack,
    Typography,
} from '@mui/material';

import { Check, EditPencil, Xmark } from 'iconoir-react';
import { Flipped, Flipper } from 'react-flip-toolkit';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { StorageFields } from 'src/components/admin/Settings/StorageMappings/Dialog/shared/StorageFields';
import CardWrapper from 'src/components/shared/CardWrapper';
import { cardHeaderSx } from 'src/context/Theme';

function CompactStoreRow({
    store,
    inactive,
}: {
    store: FragmentStore;
    inactive?: boolean;
}) {
    const details: string[] = [store.provider];
    if (store.region) details.push(store.region);
    if (store.storage_prefix) details.push(store.storage_prefix);

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: 'background.default',
                opacity: inactive ? 0.6 : 1,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">{store.bucket}</Typography>
                <Typography
                    variant="caption"
                    sx={{
                        color: inactive ? 'text.disabled' : 'text.secondary',
                        fontStyle: inactive ? 'italic' : undefined,
                    }}
                >
                    {inactive ? 'Inactive' : 'Primary'}
                </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {details.join(' \u00B7 ')}
            </Typography>
        </Box>
    );
}

const getStoreKey = (store: FragmentStore) =>
    store.provider + store.region + store.bucket;

export function StorageLocationsCard() {
    const { control, watch, trigger, formState } =
        useFormContext<StorageMappingFormData>();
    const {
        // fields: fragmentStores,
        prepend,
        // append,
        remove,
        update,
    } = useFieldArray({
        control,
        name: 'fragment_stores',
    });

    const defaultDataPlane = watch('default_data_plane');
    const fragmentStores = watch('fragment_stores');
    // const newIndex = fragmentStores.length - 1;
    const hasNewStore = fragmentStores.some((f) => f._isNew);
    const hasPendingStore = fragmentStores.some((f) => f._isPending);

    const [addingKey, setAddingKey] = useState<string | null>(null);
    const [removingKey, setRemovingKey] = useState<string | null>(null);

    useEffect(() => {
        if (!addingKey) return;
        const frame = requestAnimationFrame(() => setAddingKey(null));
        return () => cancelAnimationFrame(frame);
    }, [addingKey]);

    const handleStartAdding = () => {
        prepend({
            // TODO (Greg): provider type is non-null, but the value might not be defined here...
            provider: defaultDataPlane?.cloudProvider as CloudProvider,
            region: defaultDataPlane?.region ?? '',
            bucket: '',
            storage_prefix: '',
            _isNew: true,
            _isPending: true,
        });
    };

    const handleAccept = async () => {
        const valid = await trigger([
            `fragment_stores.0.bucket`,
            `fragment_stores.0.provider`,
            `fragment_stores.0.region`,
        ]);
        if (valid) {
            setAddingKey(getStoreKey(fragmentStores[0]));
            update(0, { ...fragmentStores[0], _isPending: false });
        }
    };

    const [closing, setClosing] = useState(false);

    const handleCancel = () => {
        setClosing(true);
    };

    const handleExited = useCallback(() => {
        if (closing) {
            setClosing(false);
            remove(0);
        }
    }, [closing, remove]);

    const handleRemoveStore = (key: string) => {
        setRemovingKey(key);
    };

    const handleStoreRemoveExited = useCallback(() => {
        if (!removingKey) return;
        const index = fragmentStores.findIndex(
            (s) => getStoreKey(s) === removingKey
        );
        if (index !== -1) {
            remove(index);
        }
        setRemovingKey(null);
    }, [removingKey, fragmentStores, remove]);

    const newStoreErrors = formState.errors.fragment_stores?.[0];
    const newStoreIsValid =
        hasPendingStore &&
        !newStoreErrors?.bucket &&
        !newStoreErrors?.provider &&
        !newStoreErrors?.region;

    return (
        <CardWrapper sx={{}}>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                }}
            >
                <Typography sx={cardHeaderSx}>Storage Locations</Typography>
                {hasPendingStore && !closing ? (
                    <Stack direction="row" spacing={0.5}>
                        <IconButton
                            size="small"
                            color="success"
                            disabled={!newStoreIsValid}
                            onClick={handleAccept}
                        >
                            <Check width={20} height={20} />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancel}>
                            <Xmark width={20} height={20} />
                        </IconButton>
                    </Stack>
                ) : (
                    <Link
                        component="button"
                        variant="body2"
                        underline="hover"
                        onClick={handleStartAdding}
                        sx={{
                            opacity: hasNewStore ? 0.5 : 1,
                            pointerEvents: hasNewStore ? 'none' : 'auto',
                        }}
                    >
                        Change primary store
                    </Link>
                )}
            </Box>
            <Stack spacing={1}>
                <Collapse
                    in={hasPendingStore && !closing}
                    onExited={handleExited}
                    unmountOnExit
                >
                    <StorageFields index={0} />
                </Collapse>
                <Flipper
                    flipKey={fragmentStores
                        .filter((s) => !s._isPending)
                        .map(getStoreKey)
                        .join(',')}
                >
                    <Box>
                        {fragmentStores.map((store, index) => {
                            if (store._isPending) return null;
                            const key = getStoreKey(store);
                            return (
                                <Collapse
                                    key={key}
                                    in={
                                        key !== removingKey &&
                                        key !== addingKey
                                    }
                                    onExited={handleStoreRemoveExited}
                                    unmountOnExit
                                >
                                    <Flipped flipId={key}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                mb: 1,
                                            }}
                                        >
                                            <Box sx={{ flex: 1 }}>
                                                <CompactStoreRow
                                                    store={store}
                                                    inactive={index > 0}
                                                />
                                            </Box>
                                            {store._isNew ? (
                                                <>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            update(index, {
                                                                ...store,
                                                                _isPending:
                                                                    true,
                                                            });
                                                        }}
                                                    >
                                                        <EditPencil
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleRemoveStore(
                                                                key
                                                            )
                                                        }
                                                    >
                                                        <Xmark
                                                            width={16}
                                                            height={16}
                                                        />
                                                    </IconButton>
                                                </>
                                            ) : null}
                                        </Box>
                                    </Flipped>
                                </Collapse>
                            );
                        })}
                    </Box>
                </Flipper>
                {fragmentStores.length > 1 ? (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Inactive stores are kept for historical data. New data
                        will be routed to the primary store.
                    </Typography>
                ) : null}
            </Stack>
        </CardWrapper>
    );
}
