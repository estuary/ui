import { useJournalDataLogsStore } from 'src/stores/JournalData/Logs/Store';

describe('fetchMoreLogs', () => {
    beforeEach(() => {
        useJournalDataLogsStore.getState().resetState();
    });

    test('declines when fetching more is not allowed yet', () => {
        const refresh = vi.fn();
        useJournalDataLogsStore.getState().setRefresh(refresh);

        expect(useJournalDataLogsStore.getState().fetchMoreLogs('old')).toBe(
            false
        );
        expect(refresh).not.toHaveBeenCalled();
    });

    test('declines while another fetch is running', () => {
        const refresh = vi.fn();
        const state = useJournalDataLogsStore.getState();
        state.setRefresh(refresh);
        state.setAllowFetchingMore(true);
        state.setFetchingMore(true);

        expect(useJournalDataLogsStore.getState().fetchMoreLogs('new')).toBe(
            false
        );
        expect(refresh).not.toHaveBeenCalled();
    });

    test('starts a fetch when allowed', () => {
        const refresh = vi.fn();
        const state = useJournalDataLogsStore.getState();
        state.setRefresh(refresh);
        state.setAllowFetchingMore(true);

        expect(useJournalDataLogsStore.getState().fetchMoreLogs('old')).toBe(
            true
        );
        expect(refresh).toHaveBeenCalledTimes(1);
        expect(useJournalDataLogsStore.getState().fetchingMore).toBe(true);
    });
});
