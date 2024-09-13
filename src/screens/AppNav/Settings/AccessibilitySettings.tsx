import React from 'react';
import {View, Text, Switch, TouchableOpacity} from 'react-native';
import Slider from '@react-native-community/slider';
import {useSettingsStore} from '../../../stores/settingsStore';
import styles from './Settings.styles';

const AccessibilitySettings: React.FC = () => {
  const {
    accessibility,
    privacySafety,
    updatePrivacySafety,
    updateAccessibility,
  } = useSettingsStore();

  return (
    <View>
      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Font Size</Text>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={accessibility.fontSize}
          onValueChange={value => updateAccessibility({fontSize: value})}
        />
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
        </View>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Language</Text>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => {
            /* Open language selection modal */
          }}>
          <Text style={styles.languageButtonText}>Change Language</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.settingSection}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Likes Public</Text>
          <Switch
            value={privacySafety.likesPublic}
            onValueChange={value => updatePrivacySafety({likesPublic: value})}
          />
        </View>
      </View>
    </View>
  );
};

export default AccessibilitySettings;
