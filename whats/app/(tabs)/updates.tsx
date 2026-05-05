import { View, Text, StyleSheet, FlatList, Image, useColorScheme } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { updates } from '../../data/dummy';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function UpdatesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={[styles.updateItem, { borderBottomColor: colors.divider }]}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isMe && (
          <View style={[styles.addIcon, { backgroundColor: colors.tint, borderColor: colors.background }]}>
            <Ionicons name="add" size={12} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.updateDetails}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.user}</Text>
        <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{item.time}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 15,
  },
  updateItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#25D366',
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
  },
});
