// app/(pages)/notifications.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';
import {
  getNotifications,
  markNotificationRead
} from '@/services/notifications';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const router = useRouter();
  const [notes, setNotes] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const data = await getNotifications();
    setNotes(data);
  };

  const onPress = async (item) => {
    if (!item.is_read) {
      await markNotificationRead(item.id);
      load();
    }
    router.push(`/deliveryDetails/${item.entity_id}`);
  };

  const renderItem = ({ item }) => {
    // pick an icon per type
    const icons = {
      application_request: 'mail-outline',
      application_accepted: 'checkmark-circle-outline',
      application_declined: 'close-circle-outline',
      delivery_completed: 'cube-outline',
      payment_method: 'card-outline',
    };
    const icon = icons[item.type] || 'notifications-outline';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          !item.is_read && styles.unread
        ]}
        onPress={() => onPress(item)}
      >
        <View style={styles.row}>
          <Ionicons
            name={icon}
            size={24}
            color={item.is_read ? '#888' : '#2563eb'}
          />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              {item.type.replace(/_/g, ' ')}
            </Text>
            <Text style={styles.message}>
              {item.message}
            </Text>
          </View>
          <Text style={styles.time}>
            {moment(item.created_at).fromNow()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={20} color="#2563eb"/>
          </TouchableOpacity>
          <Text className='mx-4 font-pbold text-2xl'>Notifications</Text>
        </View>
      {notes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No notifications.</Text>
        </View>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={n => n.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6'
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1,
    marginHorizontal: 12
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2
  },
  message: {
    fontSize: 13,
    color: '#4b5563'
  },
  time: {
    fontSize: 11,
    color: '#9ca3af'
  }
});
