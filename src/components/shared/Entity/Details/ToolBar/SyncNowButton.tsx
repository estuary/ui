import type { SyncNowProgress } from 'src/api/syncNow';

import { useEffect, useRef, useState } from 'react';

import { Alert, Button, CircularProgress, Stack, Tooltip } from '@mui/material';

import { syncNow, SyncNowError } from 'src/api/syncNow';
import { useEntityType } from 'src/context/EntityContext';
import { useUserStore } from 'src/context/User/useUserContextStore';
import {
    useShardDetail_readDictionary,
    useShardDetail_runtimeV2,
} from 'src/stores/ShardDetail/hooks';
import {
    authorizeTask,
    formatEndpointAddress,
} from 'src/utils/dataPlane-utils';

type Status = SyncNowProgress | 'idle' | 'success' | 'error' | 'stopped';

function SyncNowAction({
    taskName,
    disabled = false,
}: {
    taskName: string;
    disabled?: boolean;
}) {
    const [status, setStatus] = useState<Status>('idle');
    const [errorCode, setErrorCode] = useState<number>();
    const request = useRef<AbortController | null>(null);
    const pending =
        status === 'connecting' ||
        status === 'waiting' ||
        status === 'reconnecting';

    useEffect(
        () => () => {
            request.current?.abort();
        },
        []
    );

    const start = async () => {
        if (request.current || disabled) return;
        const controller = new AbortController();
        request.current = controller;
        setErrorCode(undefined);
        try {
            await syncNow({
                taskName,
                signal: controller.signal,
                onProgress: (progress) => {
                    if (!controller.signal.aborted) setStatus(progress);
                },
                authorize: async () => {
                    const token = useUserStore.getState().session?.access_token;
                    if (!token) throw new SyncNowError('Sign in to sync.', 16);
                    const auth = await authorizeTask(token, taskName);
                    return {
                        ...auth,
                        reactorAddress: formatEndpointAddress(
                            auth.reactorAddress
                        ),
                    };
                },
            });
            if (!controller.signal.aborted) setStatus('success');
        } catch (error) {
            if (!controller.signal.aborted) {
                setErrorCode(
                    error instanceof SyncNowError ? error.code : undefined
                );
                setStatus('error');
            }
        } finally {
            if (request.current === controller) request.current = null;
        }
    };

    const messages: Record<Status, string> = {
        idle: '',
        connecting: 'Requesting an immediate sync…',
        waiting:
            'Sync requested. Waiting for the data to be queryable in the destination.',
        reconnecting:
            'Connection interrupted. Reconnecting to confirm completion…',
        success:
            'Sync complete. Data received before this request is queryable in the destination.',
        error:
            errorCode === 5
                ? 'This materialization is not available for syncing. It must be running on the V2 runtime in this data plane.'
                : errorCode === 7 || errorCode === 16
                  ? 'You are not authorized to sync this materialization. Check your access or sign in again.'
                  : 'Could not confirm sync completion. Try syncing again.',
        stopped:
            'Stopped waiting for confirmation. A sync already requested will continue in the background.',
    };

    return (
        <Stack spacing={1} sx={{ alignItems: 'flex-end', maxWidth: 480 }}>
            <Tooltip
                title={
                    disabled
                        ? 'Enable this materialization before syncing.'
                        : 'Commit the data this materialization has received so it is queryable in the destination. Your sync schedule stays unchanged.'
                }
            >
                <span>
                    <Button
                        variant="outlined"
                        disabled={disabled || pending}
                        onClick={() => void start()}
                        startIcon={
                            pending ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : undefined
                        }
                    >
                        {pending ? 'Syncing…' : 'Sync now'}
                    </Button>
                </span>
            </Tooltip>
            {status !== 'idle' ? (
                <Alert
                    severity={
                        status === 'error'
                            ? 'error'
                            : status === 'success'
                              ? 'success'
                              : 'info'
                    }
                    aria-live={status === 'error' ? 'assertive' : 'polite'}
                    action={
                        pending ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    request.current?.abort();
                                    request.current = null;
                                    setStatus('stopped');
                                }}
                            >
                                Stop waiting
                            </Button>
                        ) : undefined
                    }
                >
                    {messages[status]}
                </Alert>
            ) : null}
        </Stack>
    );
}

export default function SyncNowButton({ taskName }: { taskName: string }) {
    const entityType = useEntityType();
    const runtimeV2 = useShardDetail_runtimeV2(taskName);
    const { disabled } = useShardDetail_readDictionary(taskName);
    if (entityType !== 'materialization' || !runtimeV2) return null;
    return (
        <SyncNowAction key={taskName} taskName={taskName} disabled={disabled} />
    );
}
