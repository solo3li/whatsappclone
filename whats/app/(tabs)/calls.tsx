import { View, Text, StyleSheet, FlatList, Image, useColorScheme } from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { calls } from '../../data/dummy';
import Colors from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function CallsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      entering={FadeInLeft.delay(index * 100).duration(400)}
      style={[styles.callItem, { borderBottomColor: colors.divider }]}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.callDetails}>
        <Text style={[styles.userName, { color: item.type === 'missed' ? '#FF3B30' : colors.text }]}>
          {item.user}
        </Text>
        <View style={styles.callTimeContainer}>
          <MaterialIcons 
            name={item.type === 'incoming' || item.type === 'missed' ? "call-received" : "call-made"} 
            size={16} 
            color={item.type === 'missed' ? '#FF3B30' : colors.tint} 
            style={{ marginRight: 5 }}
          />
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>{item.time}</Text>
        </View>
      </View>
      <Ionicons name={item.isVideo ? "videocam" : "call"} size={24} color={colors.tint} />
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.createLinkContainer}>
        <View style={[styles.linkIcon, { backgroundColor: colors.tint }]}>
          <Ionicons name="link" size={24} color="#fff" />
        </View>
        <View>
          <Text style={[styles.userName, { color: colors.text }]}>Create call link</Text>
          <Text style={[styles.timestamp, { color: colors.secondaryText }]}>Share a link for your WhatsApp call</Text>
        </View>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
      <FlatList
        data={calls}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createLinkContainer: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
  },
  linkIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 15,
    paddingTop: 5,
  },
  callItem: {
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
  callDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  callTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 14,
  },
});
