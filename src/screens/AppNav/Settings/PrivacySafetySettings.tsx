import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSettingsStore } from '../../../stores/settingsStore';
import styles from './Settings.styles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faEnvelope,
  faAddressBook,
  faUserLock,
  faFileAlt,
  faPlus,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../../../constants/uiConstants';

const PrivacySafetySettings: React.FC = () => {
  const { privacySafety, updatePrivacySafety, blockAccount, unblockAccount } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('directMessages');
  const [showAddBlockedAccount, setShowAddBlockedAccount] = useState(false);
  const [newBlockedAccount, setNewBlockedAccount] = useState('');
  const [showPolicy, setShowPolicy] = useState<'privacy' | 'terms' | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleDMSettings = (allowEveryone: boolean) => {
    updatePrivacySafety({
      allowDMsFromEveryone: allowEveryone,
      allowDMsFromFollowersOnly: !allowEveryone,
    });
  };

  const renderDirectMessages = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Direct Messages</Text>
      <View style={styles.settingItem1}>
        <Text style={styles.settingLabel1}>Allow DMs from Everyone</Text>
        <Switch
          value={privacySafety.allowDMsFromEveryone}
          onValueChange={(value) => toggleDMSettings(value)}
        />
      </View>
      <View style={styles.settingItem1}>
        <Text style={styles.settingLabel1}>Allow DMs from Followers Only</Text>
        <Switch
          value={privacySafety.allowDMsFromFollowersOnly}
          onValueChange={(value) => toggleDMSettings(!value)}
        />
      </View>
    </View>
  );

  const renderDiscoverability = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Discoverability</Text>
      <View style={styles.settingItem1}>
        <Text style={styles.settingLabel1}>Allow Search by Email</Text>
        <Switch
          value={privacySafety.allowSearchByEmail}
          onValueChange={(value) => updatePrivacySafety({ allowSearchByEmail: value })}
        />
      </View>
      <View style={styles.settingItem1}>
        <Text style={styles.settingLabel1}>Allow Search by Phone</Text>
        <Switch
          value={privacySafety.allowSearchByPhone}
          onValueChange={(value) => updatePrivacySafety({ allowSearchByPhone: value })}
        />
      </View>
    </View>
  );

  const renderBlockedAccounts = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Blocked Accounts</Text>
      {privacySafety.blockedAccounts.map((account) => (
        <View key={account} style={styles.settingItem1}>
          <Text style={styles.settingLabel1}>{account}</Text>
          <TouchableOpacity onPress={() => unblockAccount(account)}>
            <Text style={styles.unblockButton}>Unblock</Text>
          </TouchableOpacity>
        </View>
      ))}
      {privacySafety.blockedAccounts.length === 0 && (
        <Text style={styles.noBlockedAccounts}>No blocked accounts</Text>
      )}
      <TouchableOpacity
        style={styles.addBlockedAccountButton}
        onPress={() => setShowAddBlockedAccount(true)}
      >
        <FontAwesomeIcon icon={faPlus} style={styles.addBlockedAccountIcon} />
        <Text style={styles.addBlockedAccountButtonText}>Add Blocked Account</Text>
      </TouchableOpacity>
      {showAddBlockedAccount && (
        <View style={styles.addBlockedAccountContainer}>
          <TextInput
            style={styles.addBlockedAccountInput}
            placeholder="Enter username to block"
            placeholderTextColor="#ffffff"
            value={newBlockedAccount}
            onChangeText={setNewBlockedAccount}
            autoFocus
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }}
          />
          <TouchableOpacity
            style={styles.blockButton}
            onPress={() => {
              if (newBlockedAccount) {
                blockAccount(newBlockedAccount);
                setNewBlockedAccount('');
                setShowAddBlockedAccount(false);
              }
            }}
          >
            <Text style={styles.blockButtonText}>Block</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );


  const renderPolicies = () => (
    <View style={styles.settingSection}>
      <Text style={styles.sectionTitle}>Policies</Text>
      <TouchableOpacity
        style={styles.policyButton}
        onPress={() => setShowPolicy('privacy')}
      >
        <FontAwesomeIcon icon={faFileAlt} style={styles.policyIcon} />
        <Text style={styles.policyButtonText}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.policyButton}
        onPress={() => setShowPolicy('terms')}
      >
        <FontAwesomeIcon icon={faFileAlt} style={styles.policyIcon} />
        <Text style={styles.policyButtonText}>Terms of Service</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPolicy = () => (
    <View style={styles.policyContainer}>
    <TouchableOpacity
      style={styles.policyBackButton}
      onPress={() => setShowPolicy(null)}
    >
      <FontAwesomeIcon icon={faArrowLeft} style={styles.policyBackIcon} />
    </TouchableOpacity>
      <ScrollView style={styles.policyContent}>
        <Text style={styles.policyText}>
          {showPolicy === 'privacy' ? PRIVACY_POLICY : TERMS_OF_SERVICE}
        </Text>
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView ref={scrollViewRef}>
        {!showPolicy ? (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'directMessages' && styles.activeTab]}
                onPress={() => setActiveTab('directMessages')}
              >
                <FontAwesomeIcon icon={faEnvelope} style={styles.tabIcon} />
                <Text style={styles.tabText}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'discoverability' && styles.activeTab]}
                onPress={() => setActiveTab('discoverability')}
              >
                <FontAwesomeIcon icon={faAddressBook} style={styles.tabIcon} />
                <Text style={styles.tabText}>Discoverability</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'blockedAccounts' && styles.activeTab]}
                onPress={() => setActiveTab('blockedAccounts')}
              >
                <FontAwesomeIcon icon={faUserLock} style={styles.tabIcon} />
                <Text style={styles.tabText}>Blocked</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'policies' && styles.activeTab]}
                onPress={() => setActiveTab('policies')}
              >
                <FontAwesomeIcon icon={faFileAlt} style={styles.tabIcon} />
                <Text style={styles.tabText}>Policies</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'directMessages' && renderDirectMessages()}
            {activeTab === 'discoverability' && renderDiscoverability()}
            {activeTab === 'blockedAccounts' && renderBlockedAccounts()}
            {activeTab === 'policies' && renderPolicies()}
          </>
        ) : (
          renderPolicy()
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PrivacySafetySettings;