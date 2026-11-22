import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getGivenReviews, getReceivedReviews } from '@/services/reviews';
import ReviewCard from '@/components/reviewCard';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Reviews() {
  const [given, setGiven] = useState([]);
  const [received, setReceived] = useState([]);
  const [tab, setTab] = useState<'given'|'received'>('received');

  useEffect(() => {
    load();
  }, [tab]);

  const load = async () => {
    if (tab === 'given') {
      const data = await getGivenReviews();
      setGiven(data);
    } else {
      const data = await getReceivedReviews();
      setReceived(data);
    }
  };

  const data = tab === 'given' ? given : received;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className='flex-row bg-white p-4 border-b border-gray-300 items-center'>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name='arrow-back' size={20} color="#2563eb"/>
        </TouchableOpacity>
        <Text className='mx-4 font-pbold text-2xl'>Reviews</Text>
      </View>
      <View className="flex-row justify-around bg-white py-2">
        <TouchableOpacity onPress={() => setTab('received')}>
          <Text className={`${tab==='received'?'text-blue-600 font-bold':'text-gray-600'}`}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('given')}>
          <Text className={`${tab==='given'?'text-blue-600 font-bold':'text-gray-600'}`}>Given</Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No reviews to display.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({item}) => <ReviewCard review={item} tab={tab} />}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );

}
