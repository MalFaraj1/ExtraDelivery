import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, TextInput, Modal, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getUserById } from '@/services/users';
import { getReviewsByDriverId, submitReview } from '@/services/reviews';
import { getFriendStatus, sendFriendRequest, removeFriend } from '@/services/friends';
import { reportUser } from '@/services/reports';
import { banUser } from '@/services/bans';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AirbnbRating } from 'react-native-ratings';
import { useUserContext } from '@/context/UserContext';
import RNPickerSelect from 'react-native-picker-select';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserContext();
  const [userData, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [averageRating, setAverageRating] = useState('N/A');
  const [friendStatus, setFriendStatus] = useState(null);
  const [reportVisible, setReportVisible] = useState(false);
  const [reason, setReason] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await getUserById(id);
      setUser(res);
      if (res.role === 'driver') {
        const reviewRes = await getReviewsByDriverId(id);
        setReviews(reviewRes.reviews);
        setAverageRating(reviewRes.avgRating);
      }
      const status = await getFriendStatus(id);
      setFriendStatus(status);
    } catch (error) {
      console.error('Failed to load user:', error);
      Alert.alert('Error', 'Could not load user profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    try {
      await submitReview(id, newRating, newComment);
      setNewRating(0);
      setNewComment('');
      fetchUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review.');
    }
  };

  const handleFriendAction = async () => {
    try {
      if (friendStatus === 'friends') {
        await removeFriend(id);
      } else if (friendStatus === 'pending') {
        await removeFriend(id); // cancel request
      } else {
        await sendFriendRequest(id);
      }
      fetchUser();
    } catch (error) {
      Alert.alert('Error', 'Failed to update friend status.');
    }
  };

  const handleReport = async () => {
    if (!reason) {
      Alert.alert('Please select a reason');
      return;
    }
    try {
      await reportUser(id, reason, description);
      Alert.alert('Thank you', 'Your report has been submitted.');
      setReportVisible(false);
      setReason(null);
      setDescription('');
    } catch {
      Alert.alert('Error', 'Failed to submit report.');
    }
  };

  const handleBan = async () => {
    try {
      await banUser(userData.id);
      Alert.alert('User has been banned');
      setReportVisible(false);
    } catch {
      Alert.alert('Error','Failed to ban user');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-gray-500">Loading...</Text>
      </SafeAreaView>
    );
  }

  const profileImage = `http://192.168.0.100:5000${userData.profile_image}`;

  const renderFriendButtonLabel = () => {
    switch (friendStatus) {
      case 'friends': return 'Remove Friend';
      case 'pending': return 'Cancel Request';
      default: return 'Add Friend';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row justify-between items-center bg-white px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-2xl font-pbold text-gray-800">Profile</Text>
        <TouchableOpacity onPress={() => setReportVisible(true)}>
        <Ionicons name="information-circle" size={24} color="#2563eb" />
      </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Image & Name */}
        <View className="bg-white rounded-lg shadow items-center p-6 mb-6">
          <Text className='right-48 text-gray-500'>#{userData.id}</Text>
          <Image
            source={userData.profile_image ? { uri: profileImage } : require('../../../assets/images/avatar.png')}
            style={{ width: 150, height: 150, borderRadius: 100 }}
          />
          <Text className="mt-4 text-xl font-extrabold text-gray-800">{userData.name}</Text>
          <Text className="text-gray-500 mt-1">{userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}</Text>

          <View className='flex-1 flex-row'>
            <TouchableOpacity
              onPress={handleFriendAction}
              className={`justify-center items-center border ${friendStatus === "friends"? 'border-red-400' : 'border-blue-400'} rounded-lg m-1 p-2 flex flex-row`}>
              {
                friendStatus === 'friends' &&(
                  <Ionicons name='person-remove' size={25} color="red"/>
                ) ||
                friendStatus === 'pending' &&(
                  <Ionicons name='person-remove-outline' size={25} color="blue"/>
                ) ||
                (
                  <Ionicons name='person-add' size={25} color="blue"/>
                )
              }
              <Text className={`${friendStatus === "friends"? `text-red-600` : `text-blue-600`} text-lg m-1`}>{renderFriendButtonLabel()}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push(`/messageContainer/${userData.id}`)} className='justify-center items-center border border-orange-400 rounded-lg m-1 p-2 flex flex-row'>
              <Ionicons name='chatbox' size={25} color="orange" />
              <Text className='text-orange-500 text-lg m-1'>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bio Section */}
        <View className="bg-white rounded-lg shadow p-4 mb-6">
          <Text className="text-gray-600 text-bold text-xl mb-2 border-b">Bio</Text>
          <Text className="font-medium mb-4">{userData.bio || 'No bio provided.'}</Text>
        </View>

        {/* Details Section */}
        <View className="bg-white rounded-lg shadow p-4 mb-6">
          <Text className="text-gray-700 font-bold text-lg mb-2 border-b pb-1">User Information</Text>

          <View className="mb-4">
            <Text className="text-gray-600">Phone Number</Text>
            <Text className="font-medium text-base">{userData.phone}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-gray-600">Location</Text>
            <Text className="font-medium text-base">{userData.location}</Text>
          </View>

          <View className="mb-2">
            <Text className="text-gray-600">Joined</Text>
            <Text className="font-medium text-base">{new Date(userData.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {userData.role === 'driver' && (
          <View className="bg-white rounded-lg shadow p-4 mb-6">
            <Text className="text-gray-600 text-bold text-xl mb-2 border-b">Vehicle</Text>
            <View className='flex-row justify-center items-center'>
              <View className='border m-2 px-2 rounded-lg justify-center items-center border-gray-400 flex-col'>
                {
                  userData.vehicle === 'sedan' && (
                    <Image source={require('@/assets/icons/car.png')} />
                  ) ||
                  userData.vehicle === 'van' && (
                    <Image source={require('@/assets/icons/van.png')} tintColor="#fde047" />
                  ) ||
                  userData.vehicle === 'truck' && (
                    <Image source={require('@/assets/icons/truck.png')} tintColor="#fde047" />
                  ) ||
                  userData.vehicle === 'motorcycle' && (
                    <Image source={require('@/assets/icons/motorcycle.png')} tintColor="#fde047" />
                  )
                }
                <Text>{userData.vehicle}</Text>
              </View>
            </View>
          </View>
        )}

        {userData.role === 'driver' && (
          <View className="bg-white rounded-lg shadow p-4 mb-6">
            <Text className="text-gray-700 font-bold text-lg mb-3 border-b pb-1">Reviews</Text>
            <Text className="text-lg font-semibold mb-2">Average Rating: {averageRating} ⭐</Text>

            {reviews.map((review, index) => (
              <View key={index} className="mb-3 border-b pb-2">
                <Text className="font-semibold">Rating: {review.rating} ⭐</Text>
                <Text className="text-gray-600 italic">{review.comment}</Text>
              </View>
            ))}

            <Text className="text-lg font-semibold mt-4 mb-2">Leave a Review</Text>
            <AirbnbRating
              count={5}
              defaultRating={newRating}
              onFinishRating={(rating) => setNewRating(rating)}
              showRating={false}
              size={20}
            />
            <TextInput
              className="bg-gray-100 rounded-lg p-3 mt-2 mb-3"
              placeholder="Write a comment..."
              multiline
              value={newComment}
              onChangeText={setNewComment}
            />
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg"
              onPress={handleSubmitReview}
            >
              <Text className="text-white text-center font-semibold text-lg">Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          padding: 20
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 8,
            padding: 16
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              Report User
            </Text>

            <View className='border rounded-lg border-gray-300'>
              <RNPickerSelect
                onValueChange={v => setReason(v)}
                placeholder={{ label: 'Select reason...', value: null }}
                items={[
                  { label: 'Spam', value: 'spam' },
                  { label: 'Harassment', value: 'harassment' },
                  { label: 'Scam', value: 'scammer' },
                  { label: 'Other', value: 'other' },
                ]}
                style={{
                  inputIOS: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 },
                  inputAndroid: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 }
                }}
                value={reason}
              />
            </View>

            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 4,
                padding: 8,
                marginTop: 12,
                height: 80
              }}
              placeholder="Additional details (optional)"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16 }}>
              <TouchableOpacity onPress={() => setReportVisible(false)} style={{ marginRight: 12 }}>
                <Text style={{ color: '#007AFF' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleReport}>
                <Text style={{ color: '#D00' }}>Submit</Text>
              </TouchableOpacity>
            </View>
            {user.role === 'admin' &&(
              <Button title='Ban' color="red" onPress={handleBan}/>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}