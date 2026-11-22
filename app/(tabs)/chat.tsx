import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getChatUsers } from '@/services/messages';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Chat() {
  const [friends, setFriends] = useState([]);
  const [others, setOthers] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      // returns { friends: [...], others: [...] }
      const data = await getChatUsers();
      setFriends(data.friends);
      setOthers(data.others);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filterList = (list) =>
    list.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar backgroundColor="white" />
      <View className='bg-white p-5 border-b border-gray-300'>
        <Text className='text-blue-500 text-2xl font-pbold'>Chat</Text>
      </View>
      <View className="p-4 bg">
        <TextInput
          placeholder="Search users..."
          value={search}
          onChangeText={setSearch}
          className="bg-white p-3 rounded-full shadow mb-4"
        />
        {/* Friends Section */}
        <Text className="text-xl font-bold mb-2">Friends</Text>
        {filterList(friends).length === 0 ? (
          <Text className="text-gray-500 mb-4">No friends found.</Text>
        ) : (
          <FlatList
            data={filterList(friends)}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="items-center mr-4"
                onPress={() => router.push(`/messageContainer/${item.id}`)}
              >
                <Image
                  source={
                    item.profile_image
                      ? { uri: `http://192.168.0.100:5000${item.profile_image}` }
                      : require('../../assets/images/avatar.png')
                  }
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                />
                {item.unread_count > 0 && (
                  <View className="absolute top-0 right-0 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                    <Text className="text-white text-xs">{item.unread_count}</Text>
                  </View>
                )}
                <Text className="mt-2 text-sm font-medium">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Others Section */}
        <Text className="text-xl font-bold mt-6 mb-2">Other Users</Text>
        {filterList(others).length === 0 ? (
          <Text className="text-gray-500">No users found.</Text>
        ) : (
          <FlatList
            data={filterList(others)}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center bg-white p-4 mb-2 rounded-lg shadow"
                onPress={() => router.push(`/messageContainer/${item.id}`)}
              >
                <Image
                  source={
                    item.profile_image
                      ? { uri: `http://192.168.0.100:5000${item.profile_image}` }
                      : require('../../assets/images/avatar.png')
                  }
                  style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text className="text-lg font-medium">{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
