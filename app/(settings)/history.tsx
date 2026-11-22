import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import DeliveryCard from '@/components/card';
import { getDeliveryHistory } from '@/services/deliveries';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function History() {
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = async () => {
    try {
      const data = await getDeliveryHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} color="#2563eb"/>
        </TouchableOpacity>
        <Text className='mx-4 font-pbold text-2xl'>History</Text>
      </View>
      {history.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No completed or canceled deliveries.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <DeliveryCard delivery={item} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}
    </SafeAreaView>
  );
}