import React from 'react';
import { View, StyleSheet } from 'react-native';


export  const SkeletonLoader = () => {
    const skeletons = Array.from({ length: 5 });
    return (
      <View>
        {skeletons.map((_, index) => (
          <View key={index} style={styles.skeletonContainer}>
            <View style={styles.skeletonProfilePic} />
            <View style={styles.skeletonTextContainer}>
              <View style={styles.skeletonText} />
              <View style={styles.skeletonTextShort} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    skeletonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8,
      },
      skeletonProfilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#444',
        marginRight: 15,
      },
      skeletonTextContainer: {
        flex: 1,
      },
      skeletonText: {
        height: 20,
        backgroundColor: '#444',
        marginBottom: 10,
        borderRadius: 4,
        width: '80%',
      },
      skeletonTextShort: {
        height: 20,
        backgroundColor: '#444',
        borderRadius: 4,
        width: '50%',
      },
  });