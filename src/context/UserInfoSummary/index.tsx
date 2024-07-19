import FullPageError from 'components/fullPage/Error';
import useUserInfoSummary from 'hooks/useUserInfoSummary';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';
import { useUserInfoSummaryStore } from './useUserInfoSummaryStore';

const UserInfoSummaryStoreProvider = ({ children }: BaseComponentProps) => {
    const { data, isLoading, isValidating, error, mutate } =
        useUserInfoSummary();

    const populateAll = useUserInfoSummaryStore((state) => state.populateAll);
    const setMutate = useUserInfoSummaryStore((state) => state.setMutate);

    useEffect(() => {
        if (data?.data) {
            console.log('populating all');
            populateAll(data.data);
        }
    }, [data?.data, populateAll]);

    useEffect(() => {
        console.log('setting mutate');
        setMutate(mutate);
    }, [mutate, setMutate]);

    if (isLoading || isValidating) {
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
