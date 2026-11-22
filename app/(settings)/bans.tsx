import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { getBans } from '@/services/bans';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Bans() {
  const router = useRouter();  
  const [bans, setBans] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getBans();
      setBans(data);
    } catch (err) {
      console.error('Failed to load bans:', err);
    }
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={
            item.user_pfp
              ? { uri: `http://192.168.0.100:5000${item.user_pfp}` }
              : require('../../assets/images/avatar.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.by}>banned by</Text>
        <Text style={styles.adminName}>{item.admin_name}</Text>
      </View>
      <Text style={styles.reason}>Reason: {item.reason}</Text>
      <Text style={styles.until}>
        Until: {item.ban_until
          ? new Date(item.ban_until).toLocaleDateString()
          : 'Indefinite'}
      </Text>
      <Text style={styles.date}>
        Date: {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={20} color="#2563eb"/>
            </TouchableOpacity>
            <Text className='mx-4 font-pbold text-2xl'>Bans</Text>
        </View>
      {bans.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No banned users.</Text>
        </View>
      ) : (
        <FlatList
          data={bans}
          keyExtractor={b => b.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
  },
  by: {
    marginHorizontal: 6,
    color: '#6b7280',
    fontSize: 12,
  },
  adminName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#dc2626',
  },
  reason: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  until: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
});
