import React from 'react';
import { View, Text, Image } from 'react-native';
import { AirbnbRating } from 'react-native-ratings';

export default function ReviewCard({ review, tab }) {
  const isReceived = tab === 'received';
  const name = isReceived ? review.customer_name : review.driver_name;
  const image = isReceived ? review.customer_image : review.driver_image;

  return (
    <View className="bg-white rounded-lg shadow mb-4 p-4">
      <View className="flex-row items-center mb-2">
        <Image
          source={image?{uri:`http://192.168.0.100:5000${image}`} : require('../assets/images/avatar.png')}
          style={{ width:40, height:40, borderRadius:20, marginRight:10 }}
        />
        <Text className="font-semibold text-lg">{name}</Text>
      </View>
      <AirbnbRating
        count={5}
        defaultRating={review.rating}
        isDisabled
        showRating={false}
        size={16}
      />
      <Text className="mt-2 text-gray-700">{review.comment}</Text>
      <Text className="mt-1 text-gray-400 text-sm">{new Date(review.created_at).toLocaleDateString()}</Text>
    </View>
  );
}