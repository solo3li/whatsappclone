import { View, Text, StyleSheet, ImageBackground, FlatList, TextInput, KeyboardAvoidingView, Platform, useColorScheme, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import EmojiPicker from 'rn-emoji-keyboard';
import { messages, chats } from '../../data/dummy';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const chatInfo = chats.find(c => c.id === id);
  const initialMessages = messages[id as keyof typeof messages] || [];

  const [chatMessages, setChatMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Math.random().toString(),
      text: inputText,
      sender: 'Me',
      time: '12:00 PM', // Using dummy date
      isMe: true
    };
    setChatMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  const handleCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Camera permissions are required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      const newMessage = {
        id: Math.random().toString(),
        text: '',
        image: result.assets[0].uri,
        sender: 'Me',
        time: '12:00 PM', // Using dummy date
        isMe: true
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleFilePick = async () => {
    // Instead of general documents, let's open the image gallery for the attach button for better UX
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      const newMessage = {
        id: Math.random().toString(),
        text: '',
        image: result.assets[0].uri,
        sender: 'Me',
        time: '12:00 PM', // Using dummy date
        isMe: true
      };
      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  const renderMessage = ({ item, index }: { item: any, index: number }) => {
    const isMe = item.isMe;
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 50).duration(300)}
        style={[
          styles.messageWrapper,
          isMe ? styles.messageWrapperMe : styles.messageWrapperOther
        ]}
      >
        <View style={[
          styles.messageBubble,
          isMe 
            ? { backgroundColor: colors.messageBackground, borderTopRightRadius: 0 } 
            : { backgroundColor: colors.messageIncoming, borderTopLeftRadius: 0 }
        ]}>
          {item.image && (
            <Image 
              source={{ uri: item.image }} 
              style={[styles.messageImage, { marginBottom: item.text ? 5 : 0 }]} 
            />
          )}
          {item.text ? <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text> : null}
          <Text style={[styles.messageTime, { color: colors.secondaryText }]}>{item.time}</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {chatInfo && <Image source={{ uri: chatInfo.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />}
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{chatInfo?.user || 'Chat'}</Text>
            </View>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <Ionicons name="videocam" size={22} color="#fff" />
              <Ionicons name="call" size={20} color="#fff" />
              <Ionicons name="ellipsis-vertical" size={20} color="#fff" />
            </View>
          )
        }} 
      />
      <ImageBackground 
        source={{ uri: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' }} 
        style={styles.bg}
        imageStyle={{ opacity: colorScheme === 'dark' ? 0.1 : 0.5 }}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            data={chatMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageContainer}
          />
          <Animated.View entering={FadeInUp.duration(400)} style={styles.inputContainer}>
            <View style={[styles.inputInner, { backgroundColor: colors.background }]}>
              <TouchableOpacity onPress={() => setIsEmojiPickerOpen(true)}>
                <Ionicons name="happy-outline" size={24} color={colors.secondaryText} style={styles.icon} />
              </TouchableOpacity>
              <TextInput 
                style={[styles.input, { color: colors.text }]} 
                placeholder="Message" 
                placeholderTextColor={colors.secondaryText}
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity onPress={handleFilePick}>
                <Ionicons name="attach" size={24} color={colors.secondaryText} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCamera}>
                <Ionicons name="camera-outline" size={24} color={colors.secondaryText} style={styles.icon} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.micButton, { backgroundColor: colors.tint }]}
              onPress={inputText.trim() ? handleSend : undefined}
            >
              <Ionicons name={inputText.trim() ? "send" : "mic"} size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </ImageBackground>
      <EmojiPicker 
        onEmojiSelected={handleEmojiSelect} 
        open={isEmojiPickerOpen} 
        onClose={() => setIsEmojiPickerOpen(false)}
        theme={{
          backdrop: '#16161888',
          knob: colors.tint,
          container: colors.background,
          header: colors.text,
          skinTonesContainer: colors.divider,
          category: {
            icon: colors.tabIconDefault,
            iconActive: colors.tint,
            container: colors.background,
            containerActive: colors.divider,
          },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  messageContainer: {
    padding: 10,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  messageWrapperMe: {
    alignSelf: 'flex-end',
  },
  messageWrapperOther: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'flex-end',
    marginBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  inputInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 10,
    marginRight: 10,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingTop: 10,
    paddingBottom: 10,
  },
  icon: {
    marginHorizontal: 5,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  }
});