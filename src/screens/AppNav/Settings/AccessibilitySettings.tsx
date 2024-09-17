import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, Modal, FlatList } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSettingsStore } from '../../../stores/settingsStore';
import { useTheme } from '../../../theme/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFont, faMoon, faGlobe, faEye, faCheck } from '@fortawesome/free-solid-svg-icons';
import styles from './Settings.styles';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
];

const AccessibilitySettings: React.FC = () => {
  const {
    accessibility,
    updateAccessibility,
  } = useSettingsStore();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const fontSizeLabels = ['Small', 'Medium', 'Large', 'Extra Large'];

  const handleLanguageChange = (languageCode: string) => {
    updateAccessibility({ language: languageCode });
    setShowLanguageModal(false);
  };

  const renderLanguageItem = ({ item }: { item: { code: string; name: string } }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageChange(item.code)}
    >
      <Text style={styles.languageItemText}>{item.name}</Text>
      {accessibility.language === item.code && (
        <FontAwesomeIcon icon={faCheck} style={styles.languageItemIcon} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container1}>
      <View style={styles.settingSection1}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesomeIcon icon={faFont} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle1}>Font Size</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={3}
          step={1}
          value={accessibility.fontSize}
          onValueChange={value => updateAccessibility({fontSize: value})}
        />
        <View style={styles.fontSizeLabels}>
          {fontSizeLabels.map((label, index) => (
            <Text key={index} style={[styles.fontSizeLabel, accessibility.fontSize === index && styles.activeFontSizeLabel]}>
              {label}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.settingSection1}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesomeIcon icon={faMoon} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle1}>Appearance</Text>
        </View>
        <View style={styles.settingItem1}>
          <Text style={styles.settingLabel1}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
          />
        </View>
      </View>

      <View style={styles.settingSection1}>
        <View style={styles.sectionTitleContainer1}>
          <FontAwesomeIcon icon={faEye} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle1}>Visual Accessibility</Text>
        </View>
        <View style={styles.settingItem1}>
          <Text style={styles.settingLabel1}>High Contrast Mode</Text>
          <Switch
            value={accessibility.highContrastMode}
            onValueChange={value => updateAccessibility({highContrastMode: value})}
          />
        </View>
        <View style={styles.settingItem1}>
          <Text style={styles.settingLabel1}>Reduce Motion</Text>
          <Switch
            value={accessibility.reduceMotion}
            onValueChange={value => updateAccessibility({reduceMotion: value})}
          />
        </View>
      </View>

      <View style={[styles.settingSection1, styles.languageSection]}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesomeIcon icon={faGlobe} style={styles.sectionIcon} />
          <Text style={styles.sectionTitle1}>Language</Text>
        </View>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setShowLanguageModal(true)}>
          <Text style={styles.languageButtonText}>
            {languages.find(lang => lang.code === accessibility.language)?.name || 'Change Language'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.code}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AccessibilitySettings;