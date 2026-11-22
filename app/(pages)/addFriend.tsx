import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RNPickerSelect from 'react-native-picker-select';
import { useUserContext } from '@/context/UserContext';
import {
  getFriendSuggestions,
  sendFriendRequest,
  getPendingRequests,
  respondToFriendRequest,
} from '@/services/friends';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BASE_URL = 'http://192.168.0.100:5000';

const AddFriend = () => {
  const { user } = useUserContext();
  const [suggestions, setSuggestions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState(null);
  const [locationFilter, setLocationFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const sugg = await getFriendSuggestions();
      const reqs = await getPendingRequests();
      setSuggestions(sugg);
      setRequests(reqs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleSendRequest = async (friendId) => {
    try {
      await sendFriendRequest(friendId);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await respondToFriendRequest(requestId, action);
      fetchData();
    } catch (err) {
      Alert.alert('Error', 'Failed to respond to request');
    }
  };

  const renderUserCard = (item, isRequest = false) => {
    const imageUrl = item.profile_image ? `${BASE_URL}${item.profile_image}` : null;

    return (
      <View className="bg-white rounded-xl shadow px-4 py-3 mb-3 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.push(`/userProfile/${item.id}`)}>
            <View className="flex-row items-center">
              <Image
                source={
                  imageUrl
                    ? { uri: imageUrl }
                    : require('../../assets/images/avatar.png')
                }
                style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }}
              />
              <Text className="text-base font-medium text-gray-800">{item.name}</Text>
            </View>
        </TouchableOpacity>

        {isRequest ? (
          <View className="flex-row gap-3">
            <TouchableOpacity onPress={() => handleRespond(item.id, 'accept')}>
              <Text className="text-green-600 font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRespond(item.id, 'decline')}>
              <Text className="text-red-500 font-semibold">Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => handleSendRequest(item.id)}>
            <Text className="text-blue-600 font-semibold">Add</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const filteredSuggestions = suggestions.filter((sugg) =>
    sugg.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (roleFilter ? sugg.role === roleFilter : true) &&
    (locationFilter ? sugg.location === locationFilter : true)
  );
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-4">
        <View className='bg-white -mx-4 p-4 mb-4 flex-row items-center border-b border-gray-300'>
            <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name='arrow-back' size={20} color="#3b82f6"/>
            </TouchableOpacity>
            <Text className='font-pbold text-2xl mx-4'>Friends</Text>
        </View>
      {/* Pending Requests */}
      <Text className="text-2xl font-bold mb-3 text-blue-600">Friend Requests</Text>
      {requests.length === 0 ? (
        <Text className="text-gray-500 italic mb-6">You have no friend requests.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          className="mb-6"
          renderItem={({ item }) => renderUserCard(item, true)}
        />
      )}

      {/* Search Field */}
      <Text className="text-2xl font-bold mb-3 text-blue-600">Friend Suggestions</Text>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className="bg-blue-100 px-4 py-2 rounded-lg mb-4 self-start"
        >
          <Text className="text-blue-600 font-semibold">
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Text>
        </TouchableOpacity>

      <TextInput
        className="bg-white rounded-lg px-4 py-2 mb-3 border border-gray-300"
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

        {showFilters && (
          <View className="mb-4 space-y-4">
            <View>
              <Text className="text-sm text-gray-700 mb-1">Filter by Role</Text>
              <View className="bg-white border border-gray-300 rounded-lg">
                <RNPickerSelect
                  onValueChange={(value) => setRoleFilter(value)}
                  items={[
                    { label: 'All', value: null },
                    { label: 'Driver', value: 'driver' },
                    { label: 'Customer', value: 'customer' },
                  ]}
                  placeholder={{ label: 'Select a role...', value: null }}
                />
              </View>
            </View>
              
            <View>
              <Text className="text-sm text-gray-700 mb-1">Filter by Location</Text>
              <View className="bg-white border border-gray-300 rounded-lg">
                <RNPickerSelect
                  onValueChange={(value) => setLocationFilter(value)}
                  items={[
                    { label: "Tripoli", value: "Tripoli" },
                    { label: "Beirut", value: "Beirut" },
                    { label: "Sayda", value: "Sayda" },
                    { label: "Tyre", value: "Tyre" },
                    { label: "Byblos", value: "Byblos" },
                    { label: "Junyeh", value: "Junyeh" },
                    { label: "Baalbak", value: "Baalbak" },
                    { label: "Bikaa", value: "Bikaa" },
                    { label: "Akkar", value: "Akkar" },
                    { label: "Zahle", value: "Zahle" },
                    { label: "Hermel", value: "Hermel" },
                  ]}
                  placeholder={{ label: 'Select a city...', value: null }}
                />
              </View>
            </View>
          </View>
        )}



      {/* Filtered Friend Suggestions */}
      <FlatList
        data={filteredSuggestions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => renderUserCard(item)}
      />
    </SafeAreaView>
  );
};

export default AddFriend;
