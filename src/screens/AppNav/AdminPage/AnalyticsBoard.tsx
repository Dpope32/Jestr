import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../theme/theme';
import { getAllFeedback, updateFeedback } from '../../../services/userService';
import { useTabBarStore } from '../../../stores/tabBarStore';
import Toast from 'react-native-toast-message';
import { FeedbackItem } from '../../../types/types';

// Utility function to format the timestamp
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Formats the date to a readable format
};


interface AnalyticsBoardProps {
  onClose: () => void;  // Prop to handle closing action
}

const AnalyticsBoard: React.FC<AnalyticsBoardProps> = ({ onClose }) => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTabBarVisibility } = useTabBarStore();

  useEffect(() => {
    setTabBarVisibility(false);
    fetchAllFeedback();

    return () => {
      setTabBarVisibility(true);
    };
  }, []);

  const fetchAllFeedback = async () => {
    setIsLoading(true);
    console.log('Fetching all feedback...');
    try {
      const fetchedFeedback = await getAllFeedback();
      setFeedbackItems(fetchedFeedback);
      console.log('Feedback items set:', fetchedFeedback);
    } catch (err) {
      setError('Failed to fetch feedback items');
      console.error('Error fetching feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string) => {
    try {
      await updateFeedback(feedbackId, newStatus);
      console.log(`Feedback ${feedbackId} status updated to ${newStatus}`);

      // Show success toast with custom background color
      Toast.show({
        type: 'success',
        text1: 'Status Updated',
        text2: `Feedback status updated to ${newStatus}`,
        props: { style: { backgroundColor: '#1C1C1C' } },  // Custom background color
      });

      // Update the local state and filter out "Closed" items
      setFeedbackItems(prevItems =>
        prevItems
          .map(item => (item.FeedbackID === feedbackId ? { ...item, Status: newStatus } : item))
          .filter(item => item.Status !== 'Closed')
      );
    } catch (err) {
      console.error('Failed to update feedback status:', err);
    }
  };

  const renderFeedbackItem = ({ item }: { item: FeedbackItem }) => {
    console.log('Rendering Feedback Item:', item);
    return (
      <View style={styles.feedbackItem}>
        <Text style={styles.feedbackEmail}>{item.Email}</Text>
        <Text style={styles.feedbackMessage}>{item.Message}</Text>
        <Text style={styles.feedbackTimestamp}>{formatDate(item.Timestamp)}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: {item.Status}</Text>
          <View style={styles.statusButtons}>
            {['New', 'In Progress', 'Closed'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  item.Status === status && styles.activeStatusButton]}
                onPress={() => handleUpdateStatus(item.FeedbackID, status)} >
                <Text style={[styles.statusButtonText, item.Status === status && styles.activeStatusButtonText]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return <ActivityIndicator size="large" color={COLORS.primary} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Close Button to close the Analytics Board */}
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>

      <FlatList
        data={feedbackItems}
        renderItem={renderFeedbackItem}
        keyExtractor={item => item.FeedbackID}
        ListEmptyComponent={<Text style={styles.emptyText}>No feedback items found.</Text>}
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,  // Move content to the top
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  feedbackItem: {
    backgroundColor: '#444',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
  },
  feedbackEmail: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feedbackMessage: {
    color: '#FFF',
    marginBottom: 5,
    fontSize: 14,
  },
  feedbackTimestamp: {
    color: '#AAA',
    fontSize: 12,
  },
  statusContainer: {
    marginTop: 10,
  },
  statusLabel: {
    color: '#FFF',
    marginBottom: 5,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#555',
  },
  activeStatusButton: {
    backgroundColor: COLORS.primary,
  },
  activeStatusButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusButtonText: {
    color: '#FFF',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  emptyText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default AnalyticsBoard;
