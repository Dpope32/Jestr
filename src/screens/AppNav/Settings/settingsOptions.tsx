import { faUser, faKey, faUserSlash, faUserCircle, faDownload, faBell, faShieldAlt, faFileAlt, faHandsHelping, faCommentDots, faUniversalAccess } from '@fortawesome/free-solid-svg-icons';
import PrivacySafetySettings from './PrivacySafetySettings';
import AccessibilitySettings from './AccessibilitySettings';
import AccountInformation from './AccountInformation';
import { ReactNode } from 'react';
import NotiSettings from './NotiSettings';
import FeedbackForm from './feedbackForm';
import SupportHelp from './supportHelp';
import ChangePassword from './changePassword';
import DeactivateAccount from './DeactivateAccount'; 
import DownloadDataArchive from './DownloadDataArchive';

export interface SettingOption {
  icon: any;
  label: string;
  description: string;
  content: ReactNode | ((props: { closeModal: () => void }) => ReactNode);
  subOptions?: SettingOption[];
}


export const settingsOptions: SettingOption[] = [
  
  {
    icon: faUser,
    label: 'Account Settings',
    description: 'Manage your account settings',
    content: null,
    subOptions: [
      {
        icon: faUserCircle,
        label: 'Account Information',
        description: 'View and edit your account details',
        content: ({ closeModal }) => <AccountInformation closeModal={closeModal} />,
      },
      {
        icon: faKey,
        label: 'Change Password',
        description: 'Update your account password',
        content: ({ closeModal }) => <ChangePassword closeModal={closeModal} />, 
      },
      {
        icon: faUserSlash,
        label: 'Deactivate Account',
        description: 'Temporarily deactivate your account',
        content: ({ closeModal }) => <DeactivateAccount closeModal={closeModal} />,
      },
        {
            icon: faDownload,
            label: 'Download Data Archive',
            description: 'Download your data archive',
            content: ({ closeModal }) => <DownloadDataArchive closeModal={closeModal} />,
        },
      ],
    },
    {
      icon: faBell,
      label: 'Notifications',
      description: "Manage the kinds of notifications you'll receive",
      content: <NotiSettings />,
    },
    {
      icon: faShieldAlt,
      label: 'Privacy & Safety',
      description: 'Adjust privacy and safety settings',
      content: <PrivacySafetySettings />,
    },
    {
      icon: faHandsHelping,
      label: 'Support (Help)',
      description: 'Get help and support',
      content: <SupportHelp />,
    },
    {
      icon: faCommentDots,
      label: 'Feedback',
      description: 'Provide feedback to the developer',
      content: <FeedbackForm />,
    },
    {
      icon: faUniversalAccess,
      label: 'Accessibility',
      description: 'Customize accessibility options',
      content: <AccessibilitySettings />,
    },
  ];