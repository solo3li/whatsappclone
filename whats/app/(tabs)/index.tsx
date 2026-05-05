import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { chats } from '../../data/dummy';
import Colors from '../../constants/Colors';

export default function ChatsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Link href={`/chat/${item.id}`} asChild>
      <TouchableOpacity>
        <Animated.View 
          entering={FadeInDown.delay(index * 100).duration(400)}
          style={[styles.chatItem, { borderBottomColor: colors.divider }]}
        >
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={styles.chatDetails}>
            <View style={styles.chatHeader}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.user}</Text>
              <Text style={[styles.timestamp, { color: item.unread ? colors.tint : colors.secondaryText }]}>{item.timestamp}</Text>
            </View>
            <View style={styles.chatFooter}>
              <Text style={[styles.lastMessage, { color: colors.secondaryText }]} numberOfLines={1}>
                {item.lastMessage}
              </Text>
              {item.unread > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.tint }]}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
      <Animated.View entering={FadeInDown.delay(600).duration(500)} style={[styles.fab, { backgroundColor: colors.tint }]}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/plus-math.png' }} style={{ width: 24, height: 24 }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  chatDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 10,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});
