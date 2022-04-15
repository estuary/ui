import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';

const middleware = {
    cache: () => {
        // When initializing, we restore the data from `localStorage` into a map.
        const map = new Map(
            JSON.parse(localStorage.getItem('app-cache') ?? '[]')
        );

        // Before unloading the app, we write back all the data into `localStorage`.
        window.addEventListener('beforeunload', () => {
            const appCache = JSON.stringify(Array.from(map.entries()));
            localStorage.setItem('app-cache', appCache);
        });

        // We still use the map for write & read for performance.
        return map;
    },
    logger:
        process.env.NODE_ENV === 'production'
            ? (fn: any) => fn
            : (useSWRNext: any) => {
                  return (key: any, fetcher: any, config: any) => {
                      // Add logger to the original fetcher.
                      const extendedFetcher = (...args: any) => {
                          console.log('SWR Request:', key);
                          return fetcher(...args);
                      };

                      // Execute the hook with the new fetcher.
                      return useSWRNext(key, extendedFetcher, config);
                  };
              },
};

const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const options = {
        provider: middleware.cache,
        use: [middleware.logger],
    };
    return <SWRConfig value={options}>{children}</SWRConfig>;
};

export default SwrConfigProvider;
