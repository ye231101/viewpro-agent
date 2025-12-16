# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## EAS Build

This project uses [EAS Build](https://docs.expo.dev/build/introduction/) for creating production-ready builds.

1. Install EAS CLI globally

   ```bash
   npm install -g eas-cli
   ```

2. Log in to your Expo account

   ```bash
   eas login
   ```

3. Configure the project for EAS Build

   To configure an Android or an iOS project for EAS Build, run the following command:

   ```bash
   eas build:configure
   ```

   To learn more about what happens behind the scenes, see [build configuration process reference](https://docs.expo.dev/build-reference/build-configuration/).

### Development Builds

For development, we recommend creating a development build, which is a debug build of your app and contains the `expo-dev-client` library. It helps you iterate as quickly as possible and provides a more flexible, reliable, and complete development environment.

To install the library, run the following command:

```bash
npx expo install expo-dev-client
```

### Additional Configuration

Additional configuration may be required for some scenarios:

- **Environment variables**: Does your app code depend on environment variables? [Add them to your build configuration](https://docs.expo.dev/build-reference/variables/).
- **Monorepo**: Is your project inside of a monorepo? [Follow these instructions](https://docs.expo.dev/guides/monorepos/).
- **Private npm packages**: Do you use private npm packages? [Add your npm token](https://docs.expo.dev/build-reference/private-npm-packages/).
- **Tool versions**: Does your app depend on specific versions of tools like Node, Yarn, npm, CocoaPods, or Xcode? [Specify these versions in your build configuration](https://docs.expo.dev/build-reference/infrastructure/).

### Building the App

4. Build for Android

   ```bash
   eas build --platform android
   ```

5. Build for iOS

   ```bash
   eas build --platform ios
   ```

6. Build for both platforms

   ```bash
   eas build --platform all
   ```

### Build Profiles

You can configure different build profiles in `eas.json`:

- **development**: Creates a development build with dev client
- **preview**: Creates an internal distribution build for testing
- **production**: Creates a production-ready build for app stores

```bash
# Development build
eas build --profile development --platform android

# Preview build
eas build --profile preview --platform android

# Production build
eas build --profile production --platform android
```

For more information, see the [EAS Build documentation](https://docs.expo.dev/build/setup/).

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
