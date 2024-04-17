import { useShallow } from 'zustand/react/shallow';
import { useEnpointConfigStore } from './Store';

export const useEndpointConfigStore_errorsExist = () => {
    return useEnpointConfigStore((state) => state.errorsExist);
};

export const useEndpointConfigStore_endpointConfigErrors = () => {
    return useEnpointConfigStore((state) => state.endpointConfigErrors);
};

export const useEndpointConfigStore_reset = () => {
    return useEnpointConfigStore((state) => state.resetState);
};

export const useEndpointConfigStore_changed = () => {
    return useEnpointConfigStore(useShallow((state) => state.stateChanged));
};

export const useEndpointConfigStore_endpointSchema = () => {
    return useEnpointConfigStore((state) => state.endpointSchema);
};

export const useEndpointConfigStore_customErrors = () => {
    return useEnpointConfigStore((state) => state.customErrors);
};

export const useEndpointConfigStore_setCustomErrors = () => {
    return useEnpointConfigStore((state) => state.setCustomErrors);
};

export const useEndpointConfigStore_setEndpointSchema = () => {
    return useEnpointConfigStore((state) => state.setEndpointSchema);
};

export const useEndpointConfigStore_encryptedEndpointConfig_data = () => {
    return useEnpointConfigStore((state) => state.encryptedEndpointConfig.data);
};

export const useEndpointConfigStore_setEncryptedEndpointConfig = () => {
    return useEnpointConfigStore((state) => state.setEncryptedEndpointConfig);
};

export const useEndpointConfigStore_previousEndpointConfig_data = () => {
    return useEnpointConfigStore((state) => state.previousEndpointConfig.data);
};

export const useEndpointConfigStore_setPreviousEndpointConfig = () => {
    return useEnpointConfigStore((state) => state.setPreviousEndpointConfig);
};

export const useEndpointConfigStore_endpointConfig_data = () => {
    return useEnpointConfigStore((state) => state.endpointConfig.data);
};

export const useEndpointConfigStore_setEndpointConfig = () => {
    return useEnpointConfigStore((state) => state.setEndpointConfig);
};

export const useEndpointConfig_hydrated = () => {
    return useEnpointConfigStore((state) => state.hydrated);
};

export const useEndpointConfig_setHydrated = () => {
    return useEnpointConfigStore((state) => state.setHydrated);
};

export const useEndpointConfig_hydrationErrorsExist = () => {
    return useEnpointConfigStore((state) => state.hydrationErrorsExist);
};

export const useEndpointConfig_setHydrationErrorsExist = () => {
    return useEnpointConfigStore((state) => state.setHydrationErrorsExist);
};

export const useEndpointConfig_hydrateState = () => {
    return useEnpointConfigStore((state) => state.hydrateState);
};

export const useEndpointConfig_setActive = () => {
    return useEnpointConfigStore((state) => state.setActive);
};

export const useEndpointConfig_serverUpdateRequired = () => {
    return useEnpointConfigStore((state) => state.serverUpdateRequired);
};

export const useEndpointConfig_setServerUpdateRequired = () => {
    return useEnpointConfigStore((state) => state.setServerUpdateRequired);
};

export const useEndpointConfig_endpointCanBeEmpty = () => {
    return useEnpointConfigStore((state) => state.endpointCanBeEmpty);
};

export const useEndpointConfig_setEndpointCanBeEmpty = () => {
    return useEnpointConfigStore((state) => state.setEndpointCanBeEmpty);
};
