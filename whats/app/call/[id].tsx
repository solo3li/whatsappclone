import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import { useStore } from '../../store/useStore';

const { width, height } = Dimensions.get('window');

export default function CallScreen() {
  const { id, type } = useLocalSearchParams();
  const router = useRouter();
  const isVideo = type === 'video';
  const chats = useStore(state => state.chats);
  const chatInfo = chats.find(c => c.id === id);

  const { 
    sendCallOffer, 
    sendCallAnswer, 
    sendIceCandidate, 
    hangUp, 
    callAnswer, 
    iceCandidate, 
    callHungUp 
  } = useStore();

  const [permission, requestPermission] = useCameraPermissions();
  const [callDuration, setCallDuration] = useState(0);

  // Pulse animation for voice call
  const pulseAnim1 = useSharedValue(1);
  const pulseAnim2 = useSharedValue(1);

  useEffect(() => {
    // Initiate Call Offer when screen opens
    if (id) {
      console.log(`Initiating ${type} call to ${id}`);
      sendCallOffer(id as string, { type: 'offer', sdp: 'dummy-sdp-for-prototype' });
    }

    if (!isVideo) {
      pulseAnim1.value = withRepeat(
        withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        true
      );
      setTimeout(() => {
        pulseAnim2.value = withRepeat(
          withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.ease) }),
          -1,
          true
        );
      }, 500);
    }

    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (id) hangUp(id as string);
    };
  }, [isVideo, id]);

  useEffect(() => {
    if (callHungUp) {
      router.back();
    }
  }, [callHungUp]);

  useEffect(() => {
    if (callAnswer) {
      console.log('Received call answer:', callAnswer);
      // In a real app with WebRTC, we would setRemoteDescription here
    }
  }, [callAnswer]);

  useEffect(() => {
    if (iceCandidate) {
      console.log('Received ICE candidate:', iceCandidate);
      // In a real app with WebRTC, we would addIceCandidate here
    }
  }, [iceCandidate]);

  const handleHangUp = () => {
    if (id) hangUp(id as string);
    router.back();
  };

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim1.value }],
    opacity: 1.5 - pulseAnim1.value,
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim2.value }],
    opacity: 1.5 - pulseAnim2.value,
  }));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const renderVoiceCall = () => (
    <View style={styles.voiceContainer}>
      <View style={styles.header}>
        <Text style={styles.statusText}>End-to-end encrypted</Text>
        <Text style={styles.userName}>{chatInfo?.user || 'Unknown'}</Text>
        <Text style={styles.durationText}>{formatTime(callDuration)}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Animated.View style={[styles.pulseRing, animatedStyle2]} />
        <Animated.View style={[styles.pulseRing, animatedStyle1]} />
        <Image source={{ uri: chatInfo?.avatar }} style={styles.avatar} />
      </View>
    </View>
  );

  const renderVideoCall = () => {
    if (!permission) {
      return <View style={styles.videoContainer} />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.videoContainer}>
        {/* Remote User Placeholder (Simulated) */}
        <Image source={{ uri: chatInfo?.avatar }} style={styles.remoteVideo} blurRadius={10} />
        
        {/* Local User Camera */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.localVideoContainer}>
          <CameraView style={styles.localVideo} facing="front" />
        </Animated.View>

        <View style={styles.videoHeader}>
          <Text style={styles.videoUserName}>{chatInfo?.user || 'Unknown'}</Text>
          <Text style={styles.videoDurationText}>{formatTime(callDuration)}</Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {isVideo ? renderVideoCall() : renderVoiceCall()}

        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="volume-high" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="videocam-off" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="mic-off" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]} onPress={handleHangUp}>
            <Ionicons name="call" size={28} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  voiceContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  statusText: {
    color: '#8e8e93',
    fontSize: 14,
    marginBottom: 10,
  },
  userName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  durationText: {
    color: '#fff',
    fontSize: 18,
    opacity: 0.8,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(37, 211, 102, 0.3)',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 4,
    borderColor: '#1E1E1E',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  localVideoContainer: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 110,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      }
    }),
  },
  localVideo: {
    flex: 1,
  },
  videoHeader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  videoUserName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        textShadow: '-1px 1px 10px rgba(0, 0, 0, 0.75)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
      }
    }),
  },
  videoDurationText: {
    color: '#fff',
    fontSize: 16,
    ...Platform.select({
      web: {
        textShadow: '-1px 1px 10px rgba(0, 0, 0, 0.75)',
      },
      default: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
      }
    }),
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallButton: {
    backgroundColor: '#FF3B30',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#25D366',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});