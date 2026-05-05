import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useStore } from '../../store/useStore';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const blockUser = useStore(state => state.blockUser);
  const unblockUser = useStore(state => state.unblockUser);
  const blockedUsers = useStore(state => state.blockedUsers);
  const chats = useStore(state => state.chats);
  
  // Find user details. In a real app this would come from a users table.
  const chatInfo = chats.find(c => c.id === id);
  const isBlocked = blockedUsers.includes(id as string);

  const handleBlockToggle = () => {
    if (isBlocked) {
      unblockUser(id as string);
    } else {
      blockUser(id as string);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'Contact Info',
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push(`/chat/${id}`)}>
               <Ionicons name="chatbox-ellipses-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerContainer}>
          <Image source={{ uri: chatInfo?.avatar }} style={styles.avatar} />
          <Text style={[styles.userName, { color: colors.text }]}>{chatInfo?.user || 'Unknown User'}</Text>
          <Text style={[styles.phone, { color: colors.secondaryText }]}>+1 (555) 123-4567</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/call/${id}?type=voice`)}>
            <Ionicons name="call-outline" size={28} color={colors.tint} />
            <Text style={[styles.actionText, { color: colors.tint }]}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push(`/call/${id}?type=video`)}>
            <Ionicons name="videocam-outline" size={28} color={colors.tint} />
            <Text style={[styles.actionText, { color: colors.tint }]}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="search-outline" size={28} color={colors.tint} />
            <Text style={[styles.actionText, { color: colors.tint }]}>Search</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About and phone number</Text>
          <View style={styles.aboutRow}>
            <View>
              <Text style={[styles.aboutText, { color: colors.text }]}>Hey there! I am using WhatsApp.</Text>
              <Text style={[styles.aboutDate, { color: colors.secondaryText }]}>10 May 2023</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F2F2F7' }]}>
          <TouchableOpacity style={styles.row} onPress={handleBlockToggle}>
            <Ionicons name="ban-outline" size={24} color="#FF3B30" />
            <Text style={[styles.rowText, { color: '#FF3B30' }]}>
              {isBlocked ? 'Unblock' : 'Block'} {chatInfo?.user}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row}>
            <Ionicons name="thumbs-down-outline" size={24} color="#FF3B30" />
            <Text style={[styles.rowText, { color: '#FF3B30' }]}>Report {chatInfo?.user}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    minWidth: 80,
  },
  actionText: {
    marginTop: 8,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 10,
  },
  aboutRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  aboutText: {
    fontSize: 16,
    marginBottom: 5,
  },
  aboutDate: {
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  rowText: {
    fontSize: 16,
    marginLeft: 15,
  }
});
