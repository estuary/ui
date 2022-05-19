import { createContext, ReactNode, useContext } from 'react';
import { Stores, useStoreRepo } from 'stores/Repo';

interface Props {
    routeStoreKey: Stores;
    children: ReactNode | ReactNode[];
}

const RouteStoreContext = createContext<Stores>(Stores.EMPTY);

function RouteStoreProvider({ children, routeStoreKey }: Props) {
    return (
        <RouteStoreContext.Provider value={routeStoreKey}>
            {children}
        </RouteStoreContext.Provider>
    );
}

const useRouteStore = () => {
    const routeStoreKey = useContext(RouteStoreContext);
    return useStoreRepo(routeStoreKey);
};

export { RouteStoreProvider, useRouteStore };
