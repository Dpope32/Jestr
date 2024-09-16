import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faSync } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, wp } from '../../../theme/theme';
import { useTheme } from '../../../theme/ThemeContext';
import AnalyticsBoard from './AnalyticsBoard';
import Toast from 'react-native-toast-message';

interface Meme {
  MemeURL: string;
  Caption: string;
}

interface AdminData {
  userCount: number;
  memeCount: number;
  dailyActiveUsers: number;
  userGrowthRate: number;
}

const AdminPage = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [adminData, setAdminData] = useState<AdminData>({
    userCount: 0,
    memeCount: 0,
    dailyActiveUsers: 0,
    userGrowthRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const storedData = await AsyncStorage.getItem('adminData');
    if (storedData) {
      setAdminData(JSON.parse(storedData));
      setIsLoading(false);
    } else {
      fetchAdminData();
    }
  };

  const fetchAdminData = async () => {
    try {
      const baseUrl = 'https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/';
      const operations = ['getTotalUsers', 'getTotalMemes', 'getDAU', 'getUserGrowthRate'];

      const results = await Promise.all(
        operations.map((operation) =>
          fetch(`${baseUrl}${operation}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operation }),
          }).then((response) => response.json())
        )
      );

      const [userData, memeData, dauData, growthData] = results;

      const newAdminData: AdminData = {
        userCount: userData?.data?.totalUsers || 0,
        memeCount: memeData?.data?.totalMemes || 0,
        dailyActiveUsers: dauData?.data?.dailyActiveUsers || 0,
        userGrowthRate: parseFloat(growthData?.data?.userGrowthRate) || 0,
      };

      setAdminData(newAdminData);
      await AsyncStorage.setItem('adminData', JSON.stringify(newAdminData));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to fetch admin data: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    fetchAdminData();
  };

  const handleOpenAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleCloseAnalytics = () => {
    setShowAnalytics(false);
  };

  const toggleAnalyticsBoard = () => {
    setShowAnalytics(!showAnalytics);
  };

  const renderListHeader = () => (
    <View style={styles.gridContainer}>
      <View style={styles.gridItem}>
        <Text style={styles.statHeader}>Total Users</Text>
        <Text style={styles.statValue}>{adminData.userCount}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.statHeader}>Total Memes</Text>
        <Text style={styles.statValue}>{adminData.memeCount}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.statHeader}>User Growth Rate</Text>
        <Text style={styles.statValue}>{adminData.userGrowthRate}%</Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.statHeader}>Daily Active Users</Text>
        <Text style={styles.statValue}>{adminData.dailyActiveUsers}</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.darkContainer : styles.lightContainer]}>
      {showAnalytics ? (
       <View style={[styles.analyticsContainer, { flex: 1 }]}>
       <TouchableOpacity onPress={toggleAnalyticsBoard} style={styles.backButton}>
         <FontAwesomeIcon icon={faArrowLeft} size={20} color={COLORS.primary} />
       </TouchableOpacity>
       <View style={{ flex: 1 }}>
       <AnalyticsBoard onClose={handleCloseAnalytics} />
       </View>
     </View>
     
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Admin Dashboard</Text>
            <TouchableOpacity onPress={refreshData} style={styles.refreshButton}>
              <FontAwesomeIcon icon={faSync} size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={[]}
            renderItem={null}
            ListHeaderComponent={renderListHeader}
            keyExtractor={(_, index) => index.toString()}
            style={styles.flatList} 
          />

          <TouchableOpacity onPress={toggleAnalyticsBoard} style={styles.analyticsButton}>
            <Text style={styles.analyticsButtonText}>View User Feedback</Text>
          </TouchableOpacity>
        </>
      )}
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    
  },
  darkContainer: {
    backgroundColor: '#1C1C1C',
  },
  lightContainer: {
    backgroundColor: '#1C1C1C',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: 10,
    fontSize: 18,
  },
  flatList: {
    flexGrow: 0,  // Ensure FlatList doesn't take all available space
    marginBottom: 20, // Add margin to separate the button
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    paddingTop: 150,
  },
  backButton: {
    padding: 10,
  },
  refreshButton: {
    padding: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsContainer: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 5,
  },
  analyticsButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  analyticsButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default AdminPage;
