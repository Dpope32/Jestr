import {useEffect} from 'react';
import {MMKV} from 'react-native-mmkv';

const useLogPersistedData = () => {
  useEffect(() => {
    const logPersistedData = () => {
      const storage = new MMKV();
      const allKeys = storage.getAllKeys();
      console.log('All keys in MMKV:', allKeys);

      allKeys.forEach(key => {
        const stringValue = storage.getString(key);

        if (stringValue !== undefined && stringValue !== null) {
          try {
            const parsedValue = JSON.parse(stringValue);
            console.log(`Data for key "${key}":`, parsedValue);
          } catch (error) {
            console.log(`Data for key "${key}":`, stringValue);
          }
        } else {
          const boolValue = storage.getBoolean(key);
          if (boolValue !== undefined && boolValue !== null) {
            console.log(`Data for key "${key}":`, boolValue);
          } else {
            const numberValue = storage.getNumber(key);
            if (numberValue !== undefined && numberValue !== null) {
              console.log(`Data for key "${key}":`, numberValue);
            } else {
              console.log(`No data found for key "${key}".`);
            }
          }
        }
      });

      const specificKey = 'REACT_QUERY_OFFLINE_CACHE';
      const data = storage.getString(specificKey);

      if (data) {
        try {
          const parsedData = JSON.parse(data);
          const queries = parsedData.clientState?.queries || [];

          console.log('Persisted Queries from REACT_QUERY_OFFLINE_CACHE:');
          queries.forEach((query: any) => {
            const queryKey = query.queryKey;
            const queryState = query.state;

            console.log('---');
            console.log('Query Key:', queryKey);
            console.log('Query State Data:', queryState.data);
            console.log('Query State:', queryState);
          });
        } catch (error) {
          console.error(
            'Error parsing persisted data for REACT_QUERY_OFFLINE_CACHE:',
            error,
          );
        }
      } else {
        console.log('No persisted data found for REACT_QUERY_OFFLINE_CACHE.');
      }
    };

    logPersistedData();
  }, []);
};

export default useLogPersistedData;

// import {useEffect} from 'react';
// import {MMKV} from 'react-native-mmkv';

// const useLogPersistedQueries = () => {
//   useEffect(() => {
//     const logPersistedQueries = () => {
//       const storage = new MMKV();
//       const key = 'REACT_QUERY_OFFLINE_CACHE';
//       const data = storage.getString(key);

//       if (data) {
//         try {
//           const parsedData = JSON.parse(data);
//           const queries = parsedData.clientState?.queries || [];

//           queries.forEach((query: any) => {
//             const queryKey = query.queryKey;
//             const queryState = query.state;

//             console.log('---');
//             console.log('Query Key:', queryKey);
//             console.log('Query State Data:', queryState.data);
//             console.log('Query State:', queryState);
//           });
//         } catch (error) {
//           console.error('Error parsing persisted data:', error);
//         }
//       } else {
//         console.log('No persisted data found.');
//       }
//     };

//     logPersistedQueries();
//   }, []);
// };

// export default useLogPersistedQueries;
