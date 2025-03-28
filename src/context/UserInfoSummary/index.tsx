import FullPageError from 'src/components/fullPage/Error';
import useUserInfoSummary from 'src/hooks/useUserInfoSummary';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'src/types';
import { useUserInfoSummaryStore } from './useUserInfoSummaryStore';

const UserInfoSummaryStoreProvider = ({ children }: BaseComponentProps) => {
    const { data, isLoading, isValidating, error, mutate } =
        useUserInfoSummary();

    const populateAll = useUserInfoSummaryStore((state) => state.populateAll);
    const setMutate = useUserInfoSummaryStore((state) => state.setMutate);

    useEffect(() => {
        if (data) {
            populateAll(data);
        }
    }, [data, populateAll]);

    useEffect(() => {
        setMutate(mutate);
    }, [mutate, setMutate]);

    // if we're loading that means an initial load
    // if we're validating with data then we're running a mutate and don't want to mess with the view
    if (isLoading || (!data && isValidating)) {
        return null;
    }

    if (error) {
        return (
            <FullPageError
                error={error}
                message={
                    <FormattedMessage id="fullPage.userInfoSummary.error" />
                }
            />
        );
    }

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>{children}</>
    );
};

export { UserInfoSummaryStoreProvider };
