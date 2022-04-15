import { SWRConfig } from 'swr';
import { BaseComponentProps } from 'types';

const middleware = {
    cache: () => {
        // When initializing, we restore the data from `localStorage` into a map.
        const loggingMap = {
            data: new Map(
                JSON.parse(localStorage.getItem('app-cache') ?? '[]')
            ),
            delete: (key: unknown) => {
                console.log('SWR:cache:del', {
                    key,
                });

                return loggingMap.data.delete(key);
            },
            get: (key: unknown) => {
                const response = loggingMap.data.get(key);

                console.log('SWR:cache:get', {
                    key,
                    response,
                });

                return response;
            },
            set: (key: unknown, val: unknown) => {
                console.log('SWR:cache:set', {
                    key,
                    val,
                });

                return loggingMap.data.set(key, val);
            },
        };

        // Before unloading the app, we write back all the data into `localStorage`.
        window.addEventListener('beforeunload', () => {
            const appCache = JSON.stringify(
                Array.from(loggingMap.data.entries())
            );
            localStorage.setItem('app-cache', appCache);
        });

        // We still use the map for write & read for performance.
        return loggingMap;
    },
    logger:
        process.env.NODE_ENV === 'production'
            ? (fn: any) => fn
            : process.env.REACT_APP_SWR_LOG_REQUESTS === 'true'
            ? (useSWRNext: any) => {
                  return (key: any, fetcher: any, config: any) => {
                      // Add logger to the original fetcher.
                      const extendedFetcher = (...args: any) => {
                          console.log('SWR:req:', key);
                          return fetcher(...args);
                      };

                      // Execute the hook with the new fetcher.
                      return useSWRNext(key, extendedFetcher, config);
                  };
              }
            : (fn: any) => fn,
};

const SwrConfigProvider = ({ children }: BaseComponentProps) => {
    const options = {
        provider:
            process.env.NODE_ENV === 'production'
                ? undefined
                : process.env.REACT_APP_SWR_LOG_CACHE === 'true'
                ? middleware.cache
                : undefined,
        use: [middleware.logger],
    };
    return <SWRConfig value={options}>{children}</SWRConfig>;
};

export default SwrConfigProvider;
