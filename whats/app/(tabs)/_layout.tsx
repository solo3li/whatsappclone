import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
          tabBarBadge: 3,
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
        }}
      />
    </Tabs>
  );
}
