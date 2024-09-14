import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../../../theme/theme';
import { getFeedback, updateFeedback } from '../../../services/userService';
import { useTabBarStore } from '../../../stores/tabBarStore';
import Toast from 'react-native-toast-message';

// Utility function to format the timestamp
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Formats the date to a readable format
};

interface FeedbackItem {
  FeedbackID: string;
  Email: string;
  Message: string;
  Status: string;
  Timestamp: string;
}

interface AnalyticsBoardProps {
  onClose: () => void;  // Prop to handle closing action
}

const AnalyticsBoard: React.FC<AnalyticsBoardProps> = ({ onClose }) => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTabBarVisibility } = useTabBarStore();

  useEffect(() => {
    setTabBarVisibility(false); // Hide tab bar when AnalyticsBoard is opened
    fetchAllFeedback();

    return () => {
      setTabBarVisibility(true); // Show tab bar when AnalyticsBoard is closed
    };
  }, []);

  const fetchAllFeedback = async () => {
    setIsLoading(true);
    console.log('Fetching all feedback...');
    try {
      const response = await fetch(`https://uxn7b7ubm7.execute-api.us-east-2.amazonaws.com/Test/getAllFeedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ operation: 'getAllFeedback' }),
      });

      console.log('API Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch feedback. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched Data:', data);

      if (!data || !data.data) {
        throw new Error('Invalid data format returned from API');
      }

      // Filter out feedback items with status "Closed"
      const filteredFeedback = data.data.filter((item: FeedbackItem) => item.Status !== 'Closed');

      setFeedbackItems(filteredFeedback);
      console.log('Feedback items set:', filteredFeedback);
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
                  item.Status === status && styles.activeStatusButton
                ]}
                onPress={() => handleUpdateStatus(item.FeedbackID, status)}
              >
                <Text style={styles.statusButtonText}>{status}</Text>
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
    fontWeight: 'bold',
    marginBottom: 5,
  },
  feedbackMessage: {
    color: '#FFF',
    marginBottom: 5,
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
