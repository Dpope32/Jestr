import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, StyleSheet } from 'react-native';
import { fetchMemes } from './memeService';

const MemeList = () => {
  const [memes, setMemes] = useState<string[]>([]);

  useEffect(() => {
    const loadMemes = async () => {
      const memeUrls = await fetchMemes();
      setMemes(memeUrls);
    };

    loadMemes();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={memes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.memeContainer}>
            <Image source={{ uri: item }} style={styles.memeImage} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  memeContainer: {
    marginBottom: 20,
  },
  memeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});

export default MemeList;
