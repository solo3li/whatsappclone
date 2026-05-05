import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, TextInput, useColorScheme } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import Colors from '../constants/Colors';

export default function ContactsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const contacts = useStore(state => state.contacts);
  const createChat = useStore(state => state.createChat);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactPress = (userId: string) => {
    createChat(userId);
    router.replace(`/chat/${userId}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.contactItem} onPress={() => handleContactPress(item.id)}>
      <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
      <View style={styles.contactDetails}>
        <Text style={[styles.userName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.status, { color: colors.secondaryText }]} numberOfLines={1}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: 'Select Contact',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Ionicons name="search" size={24} color="#fff" />
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </View>
          )
        }} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.searchContainer, { backgroundColor: colors.divider }]}>
          <Ionicons name="search" size={20} color={colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search contacts"
            placeholderTextColor={colors.secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={() => (
            <View style={{ marginBottom: 10 }}>
              <TouchableOpacity style={styles.actionItem}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.tint }]}>
                  <Ionicons name="people" size={24} color="#fff" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>New group</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionItem}>
                <View style={[styles.actionIconContainer, { backgroundColor: colors.tint }]}>
                  <Ionicons name="person-add" size={24} color="#fff" />
                </View>
                <Text style={[styles.actionText, { color: colors.text }]}>New contact</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  contactItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  contactDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
  },
  actionItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});
