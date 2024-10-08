import {MMKV} from 'react-native-mmkv';
import {PersistedClient, Persister} from '@tanstack/react-query-persist-client';

export const storage = new MMKV();

export const createMMKVPersister = ({
  key = 'REACT_QUERY_OFFLINE_CACHE',
  serialize = JSON.stringify,
  deserialize = JSON.parse,
} = {}): Persister => {
  return {
    persistClient: (client: PersistedClient) => {
      try {
        const serializedClient = serialize(client);
        storage.set(key, serializedClient);
      } catch (error) {
        console.error('Error persisting client:', error);
      }
    },
    restoreClient: (): PersistedClient | undefined => {
      try {
        const serializedClient = storage.getString(key);
        if (!serializedClient) {
          return undefined;
        }
        return deserialize(serializedClient) as PersistedClient;
      } catch (error) {
        console.error('Error restoring client:', error);
        return undefined;
      }
    },
    removeClient: () => {
      storage.delete(key);
    },
  };
};
