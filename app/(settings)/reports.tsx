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
import { getReports } from '@/services/reports';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Reports() {
  const router = useRouter()
  const [reports, setReports] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
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
        <TouchableOpacity className='flex-row justify-center items-center' onPress={() => router.push(`/userProfile/${item.reporter_id}`)}>
            <Image
              source={
                item.reporter_pfp
                  ? { uri: `http://192.168.0.100:5000${item.reporter_pfp}` }
                  : require('../../assets/images/avatar.png')
              }
              style={styles.avatar}
            />
            <Text style={styles.bold}>{item.reporter_name}</Text>
        </TouchableOpacity>
        <Text style={styles.arrow}>→</Text>
        <TouchableOpacity className='flex-row justify-center items-center' onPress={() => router.push(`/userProfile/${item.reported_id}`)}>
            <Image
              source={
                item.reported_pfp
                  ? { uri: `http://192.168.0.100:5000${item.reported_pfp}` }
                  : require('../../assets/images/avatar.png')
              }
              style={styles.avatar}
            />
            <Text style={styles.bold}>{item.reported_name}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.reason}>{item.reason}</Text>
      <Text style={styles.reason}>{item.description}</Text>
      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
        <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name='arrow-back' size={20} color="#2563eb"/>
            </TouchableOpacity>
            <Text className='mx-4 font-pbold text-2xl'>Reports</Text>
        </View>
      {reports.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No reports found.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={r => r.id.toString()}
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
    marginHorizontal: 4,
  },
  bold: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1f2937',
  },
  arrow: {
    marginHorizontal: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  reason: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
});
