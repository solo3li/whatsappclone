import { View, Text, StyleSheet, FlatList, Image, useColorScheme, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeInRight, useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { updates } from '../../data/dummy';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function UpdatesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [selectedStatus, setSelectedStatus] = useState<any>(null);
  const progress = useSharedValue(0);

  const closeStatus = () => {
    setSelectedStatus(null);
    progress.value = 0;
  };

  useEffect(() => {
    if (selectedStatus) {
      progress.value = 0;
      progress.value = withTiming(1, { duration: 5000 }, (finished) => {
        if (finished) {
          runOnJS(closeStatus)();
        }
      });
    }
  }, [selectedStatus]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedStatus(item)}>
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
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
      <FlatList
        data={updates}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />

      <Modal visible={!!selectedStatus} transparent animationType="fade" onRequestClose={closeStatus}>
        <View style={styles.statusViewer}>
          {selectedStatus && (
            <>
              <Image source={{ uri: selectedStatus.statusImage }} style={styles.fullImage} resizeMode="cover" />
              
              <View style={styles.statusHeader}>
                <View style={styles.progressBarBg}>
                  <Animated.View style={[styles.progressBarFill, progressStyle]} />
                </View>
                <View style={styles.userInfo}>
                   <Image source={{ uri: selectedStatus.avatar }} style={styles.userAvatar} />
                   <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.statusUserName}>{selectedStatus.user}</Text>
                      <Text style={styles.statusTime}>{selectedStatus.time}</Text>
                   </View>
                   <TouchableOpacity onPress={closeStatus}>
                      <Ionicons name="close" size={30} color="#fff" />
                   </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </View>
      </Modal>
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
  statusViewer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullImage: {
    width: width,
    height: height,
  },
  statusHeader: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  progressBarBg: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusUserName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusTime: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.8,
  }
});
