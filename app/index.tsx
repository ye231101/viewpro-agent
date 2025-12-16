import { ActivityIndicator, View } from 'react-native';

import { global } from '@/styles';

export default function IndexScreen() {
  return (
    <View style={[global.container, global.justifyCenter, global.alignCenter]}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
