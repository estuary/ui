import { START_OF_LOGS_UUID } from 'components/tables/Logs/shared';
import produce from 'immer';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { JournalDataStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';
import { JournalDataLogsState } from './types';

const getInitialStateData = (): Pick<
    JournalDataLogsState,
    | 'documents'
    | 'documentCount'
    | 'lastCount'
    | 'lastParsed'
    | 'loading'
    | 'fetchingNewer'
    | 'fetchingOlder'
    | 'olderFinished'
    | 'refresh'
    | 'scrollOnLoad'
    | 'lastTimeCheckedForNew'
> => ({
    documents: null,
    documentCount: -1,
    lastCount: -1,
    lastParsed: -1,
    lastTimeCheckedForNew: null,
    loading: false,
    fetchingNewer: false,
    fetchingOlder: false,
    olderFinished: false,
    scrollOnLoad: true,
    refresh: () => {},
});

const getInitialState = (
    set: NamedSet<JournalDataLogsState>,
    get: StoreApi<JournalDataLogsState>['getState']
): JournalDataLogsState => ({
    ...getInitialStateData(),
    ...getInitialHydrationData(),
    ...getStoreWithHydrationSettings('JournalsData:Logs', set),

    hydrate: async (response) => {
        if (!get().active) {
            return;
        }

        const {
            setHydrated,
            setHydrationErrorsExist,
            setLoading,
            setNetworkFailed,
        } = get();

        setHydrationErrorsExist(Boolean(response.error));
        setLoading(response.loading);

        if (response.error) {
            setNetworkFailed(response.error.message);

            return set(
                produce((state: JournalDataLogsState) => {
                    state.documents = null;
                    state.documentCount = -1;
                    state.loading = false;
                }),
                false,
                'JournalsData:Logs:Hydrate: Error'
            );
        }

        // Get the mete data out of the response
        const meta = response.data?.meta;

        // Figure out what the last document offset is
        const parsedEnd = meta?.docsMetaResponse.offset
            ? parseInt(meta.docsMetaResponse.offset, 10)
            : null;

        // Since journalData is read kinda async we need to wait to
        //  update documents until we know the meta data changed
        if (parsedEnd && parsedEnd !== get().lastParsed) {
            const documents = response.data?.documents;

            if (documents && documents.length > 0) {
                const newDocs = [...documents, ...(get().documents ?? [])];
                const hitStartOfLogs = parsedEnd === 0;

                if (hitStartOfLogs) {
                    newDocs.unshift({
                        _meta: {
                            uuid: START_OF_LOGS_UUID,
                        },
                        level: 'info',
                        message: 'ops.logsTable.allOldLogsLoaded',
                        ts: '',
                    });
                }

                set(
                    produce((state: JournalDataLogsState) => {
                        state.loading = false;
                        state.documents = newDocs;
                        state.documentCount = newDocs.length;
                        state.olderFinished = hitStartOfLogs;
                        state.lastParsed = parsedEnd;
                        state.refresh = response.refresh;
                    }),
                    false,
                    'JournalsData:Logs:Hydrate: Populating'
                );
                setHydrated(true);
            }
        }
    },

    setDocuments: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.documents = newState;
                state.documentCount = newState?.length ?? -1;
            }),
            false,
            'JournalsData:Logs: Documents Set'
        );
    },

    setLastCount: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.lastCount = newState;
            }),
            false,
            'JournalsData:Logs: Last Count Set'
        );
    },

    setLastParsed: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.lastParsed = newState;
            }),
            false,
            'JournalsData:Logs: Last Parsed Set'
        );
    },

    setLoading: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.loading = newState;
            }),
            false,
            'JournalsData:Logs: Loading Set'
        );
    },

    setFetchingNewer: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.fetchingNewer = newState;
            }),
            false,
            'JournalsData:Logs: Fetching Newer Set'
        );
    },

    setFetchingOlder: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.fetchingOlder = newState;
            }),
            false,
            'JournalsData:Logs: Fetching Older Set'
        );
    },

    setOlderFinished: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.olderFinished = newState;
            }),
            false,
            'JournalsData:Logs: Older Finished Set'
        );
    },

    setScrollOnLoad: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.scrollOnLoad = newState;
            }),
            false,
            'JournalsData:Logs: Scroll On Load Set'
        );
    },

    setLastTimeCheckedForNew: (newState) => {
        set(
            produce((state: JournalDataLogsState) => {
                state.lastTimeCheckedForNew = newState;
            }),
            false,
            'JournalsData:Logs: Last Time Checked For New Set'
        );
    },

    resetState: () => {
        set(
            { ...getInitialStateData(), ...getInitialHydrationData() },
            false,
            'JournalsData:Logs: Reset'
        );
    },
});

export const createJournalDataLogsStore = (key: JournalDataStoreNames) => {
    return create<JournalDataLogsState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
