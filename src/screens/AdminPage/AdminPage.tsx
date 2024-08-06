import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import BottomPanel from '../../components/Panels/BottomPanel';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types/types';
import { COLORS, wp, elevationShadowStyle } from '../../theme/theme';
import { TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSync } from '@fortawesome/free-solid-svg-icons';

type AdminPageProps = {
  route: RouteProp<RootStackParamList, 'AdminPage'>;
  navigation: any;
};

const AdminPage: React.FC<AdminPageProps> = ({ route, navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [memeCount, setMemeCount] = useState(0);
  const [dailyActiveUsers, setDailyActiveUsers] = useState(0);
  const [popularMemes, setPopularMemes] = useState<any[]>([]);
  const [userGrowthRate, setUserGrowthRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  setIsLoading(true);
  fetchAdminData()
    .catch((error) => {
      console.error('Error in fetchAdminData:', error);
      setError('Failed to fetch admin data: ' + String(error));
    })
    .finally(() => setIsLoading(false));
}, []);

const fetchAdminData = async () => {
    try {
      const baseUrl = 'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/';
      const operations = [
        'getTotalUsers',
        'getTotalMemes',
        'getDAU',
        'getPopularMemes',
        'getUserGrowthRate'
      ];
  
      const fetchPromises = operations.map(operation => {
        const url = `${baseUrl}${operation}`; // Append operation to the URL
        const requestBody = JSON.stringify({ operation });
   //     console.log('Sending request to:', url, 'with operation:', operation);
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody
        }).then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        }).then(data => {
          if (!data || !data.data) {
            throw new Error(`Data fetch failed for ${operation}`);
          }
          return data;
        });
      });
      const results = await Promise.all(fetchPromises);
      const [userData, memeData, dauData, popularData, growthData] = results;
  
      // Ensure data integrity before setting state
      setUserCount(userData?.data?.totalUsers || 0);
      setMemeCount(memeData?.data?.totalMemes || 0);
      setDailyActiveUsers(dauData?.data?.dailyActiveUsers || 0);
      setPopularMemes(Array.isArray(popularData?.data?.popularMemes) ? popularData.data.popularMemes : []);
      setUserGrowthRate(parseFloat(growthData?.data?.userGrowthRate) || 0);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to fetch admin data: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  
  
  
  

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesomeIcon icon={faArrowLeft} size={14} color="#1bd40b" />
        </TouchableOpacity>
        <Text style={styles.header}>Admin Dashboard</Text>
        
        <View style={styles.statContainer}>
          <Text style={styles.statHeader}>Total Users</Text>
          <Text style={styles.statValue}>{userCount}</Text>
        </View>
  
        <View style={styles.statContainer}>
          <Text style={styles.statHeader}>Total Memes</Text>
          <Text style={styles.statValue}>{memeCount}</Text>
        </View>
  
        <View style={styles.statContainer}>
          <Text style={styles.statHeader}>User Growth Rate</Text>
          <Text style={styles.statValue}>{userGrowthRate}%</Text>
        </View>
  
        {/* New section for displaying DAU */}
        <View style={styles.statContainer}>
          <Text style={styles.statHeader}>Daily Active Users</Text>
          <Text style={styles.statValue}>{dailyActiveUsers}</Text>
        </View>
  
        <View style={styles.chartContainer}>
          <Text style={styles.chartHeader}>Popular Memes</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularMemes.map((meme, index) => (
              <View key={index} style={styles.memeContainer}>
                <Image source={{ uri: meme.MemeURL }} style={styles.memeImage} />
                <Text style={styles.memeText}>{meme.Caption}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
      <BottomPanel
        onHomeClick={() => navigation.navigate('Feed')}  // Assuming 'Home' is the route name of your home screen
        handleLike={() => {}}
        handleDislike={() => {}}
        likedIndices={new Set()}
        dislikedIndices={new Set()}
        likeDislikeCounts={{}}
        currentMediaIndex={0}
        toggleCommentFeed={() => {}}
        user={null} // Adjust accordingly if you need to pass user details
/>

    </View>
  );
}  

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#1C1C1C',  // Dark theme background
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#1C1C1C',
    },
    loadingText: {
      color: COLORS.primary,
      marginTop: 10,
      fontSize: 20,
    },
    scrollView: {
      padding: 20,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1bd40b',  // Highlight color
      marginBottom: 20,
      marginTop: 30
    },
    statContainer: {
      backgroundColor: '#333333',  // Darker section background
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: '#000',  // Adding shadow
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    statHeader: {
      fontSize: 18,
      color: '#FFF',
    },
    activityIndicatorContainer: {
      ...elevationShadowStyle(5),
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: wp(10),
      width: wp(30),
      height: wp(30),
      backgroundColor: 'transparent',
    },
    backButton: {
      flex: 1,
      marginTop:30,
      padding: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1bd40b',
    },
    chartContainer: {
      backgroundColor: '#333333',
      padding: 15,
      borderRadius: 10,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 5,
    },
    chartHeader: {
      fontSize: 18,
      color: '#FFF',
      marginBottom: 10,
    },
    chart: {
      marginVertical: 8,
      borderRadius: 16,
      marginBottom: 24,
    },
    memeContainer: {
      width: 100,
      height: 100,
      marginRight: 10,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#FFF',  // Adding border to images
    },
    memeImage: {
      width: '100%',
      height: '100%',
    },
    memeText: {
      color: '#FFF',
      textAlign: 'center',
      marginTop: 5,
    },
  });
  

export default AdminPage;
