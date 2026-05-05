import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useStore } from '../../store/useStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';

export default function ChatsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const chats = useStore((state) => state.chats);
  const fetchChats = useStore((state) => state.fetchChats);
  const loadStoredAuth = useStore((state) => state.loadStoredAuth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await loadStoredAuth();
      await fetchChats();
      setLoading(false);
    };
    init();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchChats();
    setRefreshing(false);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Link href={`/chat/${item.id}`} asChild>
      <TouchableOpacity>
        <Animated.View 
          entering={FadeInDown.delay(index * 100).duration(400)}
          style={[styles.chatItem, { borderBottomColor: colors.divider }]}
        >
          <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
          <View style={styles.chatDetails}>
            <View style={styles.chatHeader}>
              <Text style={[styles.userName, { color: colors.text }]}>{item.user}</Text>
              <Text style={[styles.timestamp, { color: item.unread ? colors.tint : colors.secondaryText }]}>{item.timestamp}</Text>
            </View>
            <View style={styles.chatFooter}>
              <Text style={[styles.lastMessage, { color: colors.secondaryText }]} numberOfLines={1}>
                {item.lastMessage || 'No messages yet'}
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

  if (loading && chats.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ color: colors.secondaryText }}>No chats yet. Start a new one!</Text>
          </View>
        }
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.tint }]} onPress={() => router.push('/contacts')}>
        <Animated.View entering={FadeInDown.delay(600).duration(500)}>
          <Ionicons name="chatbubble-ellipses" size={24} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
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
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 100,
  }
});
