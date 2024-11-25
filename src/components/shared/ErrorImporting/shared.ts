// Based on - https://mitchgavan.com/code-splitting-react-safely/

const LAZY_LOAD_FAILED_KEY = 'chunk_failed';
export type LazyLoadFailureStates = 'reloaded';

export const setWithExpiry = (value: LazyLoadFailureStates | null) => {
    if (value === null) {
        localStorage.removeItem(LAZY_LOAD_FAILED_KEY);
    } else {
        localStorage.setItem(
            LAZY_LOAD_FAILED_KEY,
            JSON.stringify({
                value,
                expiry: new Date().getTime() + 5000,
            })
        );
    }
};

export const getWithExpiry = (): null | LazyLoadFailureStates => {
    const itemString = window.localStorage.getItem(LAZY_LOAD_FAILED_KEY);
    const item = itemString ? JSON.parse(itemString) : null;

    // Either there is no setting or we couldn't parse it. Either way we should try reloading again
    if (item === null) {
        return null;
    }

    // We have waited long enough to allow trying again so clearing out the key
    if (new Date().getTime() > item.expiry) {
        setWithExpiry(null);
        return null;
    }

    // Return value so we do not try reloading again
    return item.value;
};
