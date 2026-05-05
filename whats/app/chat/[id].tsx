import { View, Text, StyleSheet, ImageBackground, FlatList, TextInput, KeyboardAvoidingView, Platform, useColorScheme, Image, TouchableOpacity, Modal, BlurView } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import Animated, { FadeInUp, SlideInRight, SlideInDown, FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import EmojiPicker from 'rn-emoji-keyboard';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import { useStore } from '../../store/useStore';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const FileMessage = ({ name, uri, size, colors }: { name: string, uri: string, size: string, colors: any }) => {
  const handleDownload = async () => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert("Sharing/Downloading is not available on this platform");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <TouchableOpacity onPress={handleDownload} style={{ width: 240, padding: 5 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.divider, padding: 10, borderRadius: 8 }}>
        <View style={{ width: 40, height: 40, backgroundColor: colors.tint, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
          <Ionicons name="document-text" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 14 }} numberOfLines={1} ellipsizeMode="middle">{name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ color: colors.secondaryText, fontSize: 12 }}>{size}</Text>
            <Text style={{ color: colors.secondaryText, fontSize: 12 }}>DOC</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AnimatedBar = ({ targetHeight, isActive, activeColor, inactiveColor }: { targetHeight: number, isActive: boolean, activeColor: string, inactiveColor: string }) => {
  const animatedHeight = useSharedValue(3);

  useEffect(() => {
    animatedHeight.value = withTiming(Math.max(3, targetHeight), { duration: 80 });
  }, [targetHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    backgroundColor: isActive ? activeColor : inactiveColor
  }));

  return (
    <Animated.View style={[{ width: 3, borderRadius: 2 }, animatedStyle]} />
  );
};

const Waveform = ({ position, duration, activeColor, inactiveColor, meteringData }: { position: number, duration: number, activeColor: string, inactiveColor: string, meteringData?: number[] }) => {
  const [staticBars] = useState(() => Array.from({ length: 40 }, () => Math.random() * 20 + 5));
  const currentBars = meteringData && meteringData.length > 0 ? meteringData : staticBars;
  
  const paddedBars = currentBars.length < 40 
    ? [...Array(40 - currentBars.length).fill(3), ...currentBars]
    : currentBars.slice(currentBars.length - 40);

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 30, flex: 1, marginHorizontal: 10, gap: 2, overflow: 'hidden' }}>
      {paddedBars.map((height, index) => {
        const isActive = duration === 0 || (index / 40) <= progress;
        return (
          <AnimatedBar 
            key={index}
            targetHeight={height}
            isActive={isActive}
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        );
      })}
    </View>
  );
};

const AudioMessage = ({ uri, duration, metering, colors }: { uri: string, duration: number, metering?: number[], colors: any }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  async function togglePlay() {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            newSound.setPositionAsync(0);
            setPosition(0);
          }
        }
      });
      setSound(newSound);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width: 250, paddingVertical: 5, paddingHorizontal: 2 }}>
      <TouchableOpacity onPress={togglePlay}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color={colors.secondaryText} />
      </TouchableOpacity>
      
      <Waveform position={position} duration={duration} activeColor={colors.tint} inactiveColor={colors.divider} meteringData={metering} />
      
      <View style={{ width: 40, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 11, color: colors.secondaryText }}>{formatTime(position > 0 ? position : (duration || 0))}</Text>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const chats = useStore(state => state.chats);
  const allMessages = useStore(state => state.messages);
  const addMessage = useStore(state => state.addMessage);
  const deleteMessage = useStore(state => state.deleteMessage);
  const editMessage = useStore(state => state.editMessage);

  const chatInfo = chats.find(c => c.id === id);
  const chatMessages = allMessages[id as string] || [];

  const [inputText, setInputText] = useState('');
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);

  // Audio Recording State
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [meteringData, setMeteringData] = useState<number[]>([]);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState(0);

  const pulseAnim = useSharedValue(1);
  useEffect(() => {
    if (isRecording) {
      pulseAnim.value = withRepeat(withTiming(1.5, { duration: 500 }), -1, true);
    } else {
      pulseAnim.value = 1;
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }]
  }));

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(() => {
    return () => {
      if (previewSound) previewSound.unloadAsync().catch(() => {});
      if (recording) recording.stopAndUnloadAsync().catch(() => {});
    };
  }, [previewSound, recording]);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        
        setRecordingDuration(0);
        setMeteringData([]);
        setIsRecording(true);

        const { recording } = await Audio.Recording.createAsync(
          {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
            isMeteringEnabled: true,
          },
          (status) => {
            if (status.isRecording) {
              setRecordingDuration(status.durationMillis);
              if (status.metering !== undefined) {
                setMeteringData(prev => {
                  const min = -60;
                  const db = Math.max(status.metering as number, min);
                  const normalized = ((db - min) / Math.abs(min)) * 25 + 5;
                  const newData = [...prev, normalized];
                  if (newData.length > 40) return newData.slice(newData.length - 40);
                  return newData;
                });
              } else {
                setMeteringData(prev => {
                  const simulated = Math.random() * 20 + 5;
                  const newData = [...prev, simulated];
                  if (newData.length > 40) return newData.slice(newData.length - 40);
                  return newData;
                });
              }
            }
          },
          50
        );
        setRecording(recording);
      } else {
        alert('Microphone permission is required');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setPreviewUri(uri);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
    setRecording(null);
  };

  const playPreview = async () => {
    if (previewSound) {
      if (isPlayingPreview) {
        await previewSound.pauseAsync();
        setIsPlayingPreview(false);
      } else {
        await previewSound.playAsync();
        setIsPlayingPreview(true);
      }
    } else if (previewUri) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: previewUri },
        { shouldPlay: true },
        (status: any) => {
          if (status.isLoaded) {
            setPreviewPosition(status.positionMillis);
            setIsPlayingPreview(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlayingPreview(false);
              sound.setPositionAsync(0);
              setPreviewPosition(0);
            }
          }
        }
      );
      setPreviewSound(sound);
    }
  };

  const cancelPreview = () => {
    if (previewSound) {
      previewSound.unloadAsync();
      setPreviewSound(null);
    }
    setPreviewUri(null);
    setIsPlayingPreview(false);
    setPreviewPosition(0);
    setRecordingDuration(0);
    setMeteringData([]);
  };

  const sendAudio = () => {
    if (previewUri) {
      addMessage(id as string, {
        text: '',
        audio: previewUri,
        duration: recordingDuration,
        metering: meteringData,
        time: '12:00 PM', // Using dummy date
      });
      cancelPreview();
    }
  };

  const handleMessageAction = (msg: any) => {
    setSelectedMessage(msg);
  };

  const handleReply = (msg: any) => {
    setReplyingTo(msg);
    setSelectedMessage(null);
  };

  const handleForward = (msg: any) => {
    alert("Forwarding logic would open a contact picker here");
    setSelectedMessage(null);
  };

  const handleEditRequest = (msg: any) => {
    if (msg.text) {
      setEditingMsgId(msg.id);
      setInputText(msg.text);
      setSelectedMessage(null);
    } else {
      alert("Can only edit text messages");
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'ios') {
      import('react-native').then(({ ActionSheetIOS }) => {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['Cancel', 'Camera', 'Photo Library'],
            cancelButtonIndex: 0,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) openCamera();
            if (buttonIndex === 2) openGallery();
          }
        );
      });
    } else {
      import('react-native').then(({ Alert }) => {
        Alert.alert('Select Source', '', [
          { text: 'Camera', onPress: openCamera },
          { text: 'Gallery', onPress: openGallery },
          { text: 'Cancel', style: 'cancel' },
        ]);
      });
    }
  };

  const openCamera = async () => {
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
      addMessage(id as string, {
        text: '',
        image: result.assets[0].uri,
        time: '12:00 PM', // Using dummy date
      });
    }
  };

  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Media library permissions are required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      addMessage(id as string, {
        text: '',
        image: result.assets[0].uri,
        time: '12:00 PM', // Using dummy date
      });
    }
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const sizeStr = asset.size ? (asset.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size';
        addMessage(id as string, {
          text: '',
          fileName: asset.name,
          fileUri: asset.uri,
          fileSize: sizeStr,
          time: '12:00 PM', // Using dummy date
        });
      }
    } catch (error) {
      console.error('Error picking document', error);
    }
  };

  const handleEmojiSelect = (emojiObject: any) => {
    setInputText(prev => prev + emojiObject.emoji);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (editingMsgId) {
      editMessage(id as string, editingMsgId, inputText);
      setEditingMsgId(null);
    } else {
      addMessage(id as string, {
        text: inputText,
        time: '12:00 PM', // Using dummy date
        replyTo: replyingTo?.id,
        replyText: replyingTo?.text || (replyingTo?.image ? '📷 Photo' : replyingTo?.audio ? '🎤 Audio' : replyingTo?.fileUri ? '📄 Document' : undefined)
      });
    }
    setInputText('');
    setReplyingTo(null);
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
        <TouchableOpacity 
          onLongPress={() => handleMessageAction(item)}
          activeOpacity={0.8}
          style={{ flexDirection: 'row', alignItems: 'flex-end' }}
        >
          {!isMe && chatInfo?.avatar && (
            <TouchableOpacity onPress={() => router.push(`/user/${id}`)}>
              <Image source={{ uri: chatInfo.avatar }} style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8, marginBottom: 5 }} />
            </TouchableOpacity>
          )}
          <View style={[
            styles.messageBubble,
            isMe 
              ? { backgroundColor: colors.messageBackground, borderTopRightRadius: 0 } 
              : { backgroundColor: colors.messageIncoming, borderTopLeftRadius: 0 }
          ]}>
            {item.replyTo && (
              <View style={[styles.replyContainerInBubble, { backgroundColor: isMe ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.2)' }]}>
                <View style={[styles.replyBar, { backgroundColor: colors.tint }]} />
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={{ color: colors.tint, fontWeight: 'bold', fontSize: 12 }}>{item.sender === 'Me' ? 'You' : item.sender}</Text>
                  <Text style={{ color: colors.secondaryText, fontSize: 13 }} numberOfLines={1}>{item.replyText}</Text>
                </View>
              </View>
            )}
            {item.isForwarded && (
               <Text style={{ color: colors.secondaryText, fontSize: 12, fontStyle: 'italic', marginBottom: 4 }}><Ionicons name="arrow-redo-outline" size={12} /> Forwarded</Text>
            )}
            {item.image && (
              <Image 
                source={{ uri: item.image }} 
                style={[styles.messageImage, { marginBottom: item.text || item.audio || item.fileUri ? 5 : 0 }]} 
              />
            )}
            {item.audio && (
              <AudioMessage uri={item.audio} duration={item.duration} colors={colors} metering={item.metering} />
            )}
            {item.fileUri && (
              <FileMessage name={item.fileName} uri={item.fileUri} size={item.fileSize} colors={colors} />
            )}
            {item.text ? <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text> : null}
            <Text style={[styles.messageTime, { color: colors.secondaryText }]}>{item.time}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerTitle: () => (
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => router.push(`/user/${id}`)}>
              {chatInfo && <Image source={{ uri: chatInfo.avatar }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />}
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>{chatInfo?.user || 'Chat'}</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 20 }}>
              <TouchableOpacity onPress={() => router.push(`/call/${id}?type=video`)}>
                <Ionicons name="videocam" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push(`/call/${id}?type=voice`)}>
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
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

          {replyingTo && (
            <Animated.View entering={FadeInUp} style={[styles.replyPreview, { backgroundColor: colors.background }]}>
              <View style={[styles.replyBar, { backgroundColor: colors.tint }]} />
              <View style={{ flex: 1, paddingHorizontal: 10 }}>
                <Text style={{ color: colors.tint, fontWeight: 'bold' }}>{replyingTo.isMe ? 'You' : chatInfo?.user}</Text>
                <Text style={{ color: colors.secondaryText }} numberOfLines={1}>
                  {replyingTo.text || (replyingTo.image ? '📷 Photo' : replyingTo.audio ? '🎤 Audio' : '📄 Document')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setReplyingTo(null)} style={{ padding: 10 }}>
                <Ionicons name="close-circle" size={20} color={colors.secondaryText} />
              </TouchableOpacity>
            </Animated.View>
          )}

          <Animated.View entering={FadeInUp.duration(400)} style={styles.inputContainer}>
            {previewUri ? (
              <View style={[styles.inputInner, { backgroundColor: colors.background, justifyContent: 'space-between', paddingHorizontal: 5 }]}>
                <TouchableOpacity onPress={cancelPreview} style={{ padding: 10 }}>
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity onPress={playPreview} style={{ marginLeft: 5 }}>
                  <Ionicons name={isPlayingPreview ? "pause-circle" : "play-circle"} size={32} color={colors.secondaryText} />
                </TouchableOpacity>
                <Waveform position={previewPosition} duration={recordingDuration} activeColor={colors.tint} inactiveColor={colors.divider} meteringData={meteringData} />
              </View>
            ) : isRecording ? (
              <View style={[styles.inputInner, { backgroundColor: colors.background, paddingHorizontal: 15 }]}>
                 <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                   <Animated.View style={[pulseStyle, { width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF3B30', marginRight: 10 }]} />
                   <Text style={{ color: colors.text, fontSize: 16, width: 60 }}>{formatTime(recordingDuration)}</Text>
                   <Waveform position={recordingDuration} duration={recordingDuration} activeColor={colors.tint} inactiveColor={colors.divider} meteringData={meteringData} />
                 </View>
              </View>
            ) : (
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
            )}

            <TouchableOpacity 
              style={[styles.micButton, { backgroundColor: colors.tint }]}
              onPress={
                previewUri 
                  ? sendAudio 
                  : inputText.trim() 
                    ? handleSend 
                    : isRecording 
                      ? stopRecording 
                      : startRecording
              }
            >
              <Ionicons 
                name={previewUri ? "send" : inputText.trim() ? "send" : isRecording ? "stop" : "mic"} 
                size={24} 
                color="#fff" 
              />
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

      <Modal
        visible={!!selectedMessage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMessage(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSelectedMessage(null)}
        >
          <Animated.View 
            entering={SlideInDown.springify().damping(20)}
            exiting={FadeOut}
            style={[styles.menuContainer, { backgroundColor: colors.background }]}
          >
            <TouchableOpacity style={styles.menuItem} onPress={() => handleReply(selectedMessage)}>
              <Ionicons name="arrow-undo-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Reply</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleForward(selectedMessage)}>
              <Ionicons name="arrow-redo-outline" size={22} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Forward</Text>
            </TouchableOpacity>
            {selectedMessage?.isMe && (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={() => handleEditRequest(selectedMessage)}>
                  <Ionicons name="pencil-outline" size={22} color={colors.text} />
                  <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.menuItem, { borderBottomWidth: 0 }]} 
                  onPress={() => {
                    deleteMessage(id as string, selectedMessage.id);
                    setSelectedMessage(null);
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                  <Text style={[styles.menuText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginHorizontal: 10,
    marginBottom: -5,
  },
  replyBar: {
    width: 4,
    height: '80%',
    borderRadius: 2,
    marginLeft: 5,
  },
  replyContainerInBubble: {
    flexDirection: 'row',
    borderRadius: 6,
    paddingVertical: 5,
    marginBottom: 8,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    width: '100%',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  menuText: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: '500',
  }
});
