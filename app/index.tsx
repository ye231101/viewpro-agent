import { ActivityIndicator, View } from 'react-native';

import { styles } from '@/styles';

export default function IndexScreen() {
  return (
    <View style={[styles.container, styles.justifyCenter, styles.alignCenter]}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
