# Jestr - The Ultimate Meme Sharing Platform 🎭
(in progress)

Jestr is a full-stack mobile platform for meme enthusiasts, built with cutting-edge technologies to provide a seamless and engaging user experience.

## 📱 App Screenshots
(coming soon)

## 🚀 Features

- [x] Share media with other users inside and outside the app
- [x] Advanced media editor
- [x] AI-powered text detection and media classification
- [x] Like, comment, share, and download functionality
- [x] Private encrypted messaging
- [x] Zero loading time when fetching media
- [x] Follow/Unfollow other users
- [x] Earn badges based on interaction thresholds
- [x] Client-side video processing (MLKit)
- [x] React Native Vision Camera for in-app photo capture
- [ ] Visit other profiles
- [ ] Search all memes based on tags
- [ ] Deep linking
- [ ] AdMob integration

## 🔄 App Flow

1. **Onboarding**: Users are greeted with a visually stunning, brief onboarding process.
2. **Authentication**: Sign up / Login screen with options for Google/Apple sign-in.
3. **Profile Completion**: After email verification, users complete their profile, which is then stored in DynamoDB.
4. **Data Management**: User data is stored locally using Zustand with MMKV for speed, periodically syncing with the server for accuracy.

## 🧭 Navigation & Layout

### Left: Custom Drawer
- Profile
- Badges
- Settings

### Top: Header
- Search
- Notifications
- Profile Picture (also opens drawer)
- Admin Page (visible only to admin users)

### Bottom: Tab Navigation
- Home (feed)
- Upload Screen (create, edit, post videos and images)
- Inbox

## 🛠 Tech Stack

### Frontend
- React Native (Expo)
- Zustand for state management
- MMKV for local storage
- Lottie for animations
- Jest for testing

### Backend
- AWS Lambda (Serverless)
- Amazon DynamoDB (NoSQL Database)
- Amazon API Gateway (Routing)
- Amazon S3 (Media hosting)
- Amazon ElastiCache for Redis (Server-side caching)
- Amazon SNS (Notifications)
- Amazon Rekognition (Content moderation/ML)
- Amazon CloudFront (CDN for edge cases)
- Amazon SQS (Queue system for long-running requests)

## 🚀 Getting Started

To get started with Jestr, follow these steps:

Clone the repository:
Copygit clone https://github.com/dpope32/jestr.git

Navigate to the project directory:
Copycd jestr

Install dependencies:
Copynpm install

Start the Expo development server:
Copynpx expo start

Use the Expo Go app on your mobile device to scan the QR code displayed in the terminal or run on an emulator.

Make sure you have Node.js, npm, and Expo CLI installed on your system before running these commands.

## 👥 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).

## 📞 Contact

For any queries or support, please contact us at [jestrdev@gmail.com](mailto:jestrdev@gmail.com).

---

Made with ❤️ by the Jestr Team
