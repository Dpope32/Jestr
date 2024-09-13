import React, {useState} from 'react';
import {View, Text, Switch, TouchableOpacity, ScrollView} from 'react-native';
import {useSettingsStore} from '../../../stores/settingsStore';
import styles from './Settings.styles';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faEnvelope,
  faAddressBook,
  faUserLock,
} from '@fortawesome/free-solid-svg-icons';

const PrivacySafetySettings: React.FC = () => {
  const {privacySafety, updatePrivacySafety, blockAccount, unblockAccount} =
    useSettingsStore();
  const [activeTab, setActiveTab] = useState('directMessages');

  const renderDirectMessages = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Direct Messages</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Allow DMs from Everyone</Text>
        <Switch
          value={privacySafety.allowDMsFromEveryone}
          onValueChange={value =>
            updatePrivacySafety({allowDMsFromEveryone: value})
          }
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Allow DMs from Followers Only</Text>
        <Switch
          value={privacySafety.allowDMsFromFollowersOnly}
          onValueChange={value =>
            updatePrivacySafety({allowDMsFromFollowersOnly: value})
          }
        />
      </View>
    </View>
  );

  const renderDiscoverability = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Discoverability</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Allow Search by Email</Text>
        <Switch
          value={privacySafety.allowSearchByEmail}
          onValueChange={value =>
            updatePrivacySafety({allowSearchByEmail: value})
          }
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Allow Search by Phone</Text>
        <Switch
          value={privacySafety.allowSearchByPhone}
          onValueChange={value =>
            updatePrivacySafety({allowSearchByPhone: value})
          }
        />
      </View>
    </View>
  );

  const renderBlockedAccounts = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Blocked Accounts</Text>
      {privacySafety.blockedAccounts.length > 0 ? (
        privacySafety.blockedAccounts.map(account => (
          <View key={account} style={styles.settingItem}>
            <Text style={styles.settingLabel}>{account}</Text>
            <TouchableOpacity onPress={() => unblockAccount(account)}>
              <Text style={styles.unblockButton}>Unblock</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text style={styles.noBlockedAccounts}>No blocked accounts</Text>
      )}
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'directMessages' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('directMessages')}>
          <FontAwesomeIcon icon={faEnvelope} style={styles.tabIcon} />
          <Text style={styles.tabText}>Direct Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'discoverability' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('discoverability')}>
          <FontAwesomeIcon icon={faAddressBook} style={styles.tabIcon} />
          <Text style={styles.tabText}>Discoverability</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'blockedAccounts' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('blockedAccounts')}>
          <FontAwesomeIcon icon={faUserLock} style={styles.tabIcon} />
          <Text style={styles.tabText}>Blocked Accounts</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'directMessages' && renderDirectMessages()}
      {activeTab === 'discoverability' && renderDiscoverability()}
      {activeTab === 'blockedAccounts' && renderBlockedAccounts()}
    </ScrollView>
  );
};

export default PrivacySafetySettings;
