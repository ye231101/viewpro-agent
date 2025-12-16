import { ActivityIndicator, View } from 'react-native';

import { globals } from '@/styles';

export default function IndexScreen() {
  return (
    <View style={[globals.container, globals.justifyCenter, globals.alignCenter]}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
}
