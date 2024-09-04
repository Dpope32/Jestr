import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { fetchMemes } from '../services/memeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    console.log('Background fetch started');
    try {
      const userEmail = await AsyncStorage.getItem('userEmail');
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!userEmail || !accessToken) {
        console.log('No user email or access token found');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
  
      const result = await fetchMemes(null, userEmail, 10, accessToken);
      if (result.memes.length > 0) {
        await AsyncStorage.setItem('cachedMemes', JSON.stringify(result.memes));
        console.log(`Background fetch completed: ${result.memes.length} memes cached`);
        return BackgroundFetch.BackgroundFetchResult.NewData;
      } else {
        console.log('Background fetch completed: No new memes');
        return BackgroundFetch.BackgroundFetchResult.NoData;
      }
    } catch (error) {
      console.error("Background fetch failed:", error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });

export async function registerBackgroundFetchAsync() {
  return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60 * 15, // 15 minutes
    stopOnTerminate: false,
    startOnBoot: true,
  });
}

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}