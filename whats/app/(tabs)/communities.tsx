import { View, Text, StyleSheet, Image, useColorScheme } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import Colors from '../../constants/Colors';

export default function CommunitiesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.Image 
        entering={ZoomIn.duration(600)}
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1000/1000305.png' }} 
        style={[styles.image, { tintColor: colors.tabIconDefault }]} 
      />
      <Animated.Text entering={ZoomIn.delay(200).duration(600)} style={[styles.title, { color: colors.text }]}>
        Introducing communities
      </Animated.Text>
      <Animated.Text entering={ZoomIn.delay(400).duration(600)} style={[styles.subtitle, { color: colors.secondaryText }]}>
        Easily organize your related groups and send announcements. Now, your communities, like neighborhoods or schools, can have their own space.
      </Animated.Text>
      <Animated.View entering={ZoomIn.delay(600).duration(600)} style={[styles.button, { backgroundColor: colors.tint }]}>
        <Text style={styles.buttonText}>Start your community</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 30,
    paddingTop: 60,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
