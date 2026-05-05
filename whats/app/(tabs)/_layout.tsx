import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useStore } from '../../store/useStore';
import { calls } from '../../data/dummy';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const chats = useStore((state) => state.chats);
  const unreadChats = chats.reduce((sum, chat) => sum + (chat.unread || 0), 0);
  
  const missedCalls = calls.filter(call => call.type === 'missed').length;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.divider,
        },
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerRight: () => (
          <View style={{ flexDirection: 'row', gap: 20, paddingRight: 15 }}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Ionicons name="search" size={24} color="#fff" />
            <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
          </View>
        )
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'WhatsApp',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={24} color={color} />,
          tabBarBadge: unreadChats > 0 ? unreadChats : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.tint }
        }}
      />
      <Tabs.Screen
        name="updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color }) => <MaterialIcons name="motion-photos-on" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Communities',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calls"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color }) => <Ionicons name="call" size={24} color={color} />,
          tabBarBadge: missedCalls > 0 ? missedCalls : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.tint }
        }}
      />
    </Tabs>
  );
}
