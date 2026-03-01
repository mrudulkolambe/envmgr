"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { EnvmgrClient, Flags } from '../core/sdk.js';

interface EnvmgrContextType {
    flags: Flags;
    loading: boolean;
    error: Error | null;
    client: EnvmgrClient | null;
}

const EnvmgrContext = createContext<EnvmgrContextType | undefined>(undefined);

export interface EnvmgrProviderProps {
    apiKey: string;
    apiUrl?: string;
    children: React.ReactNode;
}

export const EnvmgrProvider: React.FC<EnvmgrProviderProps> = ({
    apiKey,
    apiUrl = "https://envmgr.vercel.app",
    children
}) => {
    const [flags, setFlags] = useState<Flags>({});
    const client = useMemo(() => new EnvmgrClient(apiKey, apiUrl), [apiKey, apiUrl]);

    return (
        <EnvmgrContext.Provider value={{ flags, loading: false, error: null, client }}>
            {children}
        </EnvmgrContext.Provider>
    );
};

export const useEnvmgr = () => {
    const context = useContext(EnvmgrContext);
    if (context === undefined) {
        throw new Error('useEnvmgr must be used within an EnvmgrProvider');
    }
    return context;
};

export const useFeatureFlag = (key: string, defaultValue = false) => {
    const { client } = useEnvmgr();
    const [isEnabled, setIsEnabled] = useState<boolean>(defaultValue);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!client) return;

        let mounted = true;

        async function checkFlag() {
            setLoading(true);
            const val = await client!.isFeatureEnabled(key, defaultValue);
            if (mounted) {
                setIsEnabled(val);
                setLoading(false);
            }
        }

        checkFlag();

        return () => {
            mounted = false;
        };
    }, [client, key, defaultValue]);

    return isEnabled;
};
