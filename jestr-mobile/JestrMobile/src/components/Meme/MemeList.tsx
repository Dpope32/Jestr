import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, Text, StyleSheet } from 'react-native';
import { fetchMemes } from './memeService';

type Meme = {
  url: string;
  username: string;
  caption: string;
};

const MemeList = () => {
  const [memes, setMemes] = useState<Meme[]>([]);

  useEffect(() => {
    const loadMemes = async () => {
      const memesData = await fetchMemes();
      setMemes(memesData);
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
            <Image source={{ uri: item.url }} style={styles.memeImage} />
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.caption}>{item.caption}</Text>
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
    alignItems: 'center',
  },
  memeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  username: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  caption: {
    color: '#666',
    marginTop: 4,
  },
});

export default MemeList;