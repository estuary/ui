import { createContext, useContext } from 'react';

const CustomContext = createContext('hi');

export function useCustomContext() {
    return useContext(CustomContext);
}

export default CustomContext;
