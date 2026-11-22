import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCustomerDeliveries, getDeliveryUserShipments } from '@/services/deliveries';
import { useUserContext } from '@/context/UserContext';
import DeliveryCard from '@/components/card';
import { SafeAreaView } from 'react-native-safe-area-context';

const Shipment = () => {
  const [acceptedDeliveries, setAcceptedDeliveries] = useState([]);
  const [suggestedDeliveries, setSuggestedDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserContext();

  const fetchData = async () => {
    try {
      if (user.role === 'customer') {
        const response = await getCustomerDeliveries();
        setAcceptedDeliveries(response);
        setSuggestedDeliveries([]);
      } else {
        const response = await getDeliveryUserShipments();
        setAcceptedDeliveries(response.accepted);
        setSuggestedDeliveries(response.suggestions);
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  

  useEffect(() => {
    if (!user?.role) return;

    fetchData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-5 bg-white border-b border-gray-300">
        <Text className="text-2xl color-blue-500 font-pbold">Shipment</Text>
      </View>

      <FlatList
        ListHeaderComponent={
          <>
            {/* Accepted Section */}
            {acceptedDeliveries.length > 0 ? (
              acceptedDeliveries.map((item) => (
                <DeliveryCard key={`accepted-${item.id}`} delivery={item} />
              ))
            ) : (
              <Text className="text-gray-500 px-4">No accepted deliveries.</Text>
            )}

            {/* Suggestions Section (only for delivery users) */}
            {user.role === 'driver' && (
              <>
                <Text className="text-xl font-bold px-4 mt-6 mb-2 text-gray-800">Suggestions</Text>
                {suggestedDeliveries.length > 0 ? (
                  suggestedDeliveries.map((item) => (
                    <DeliveryCard key={`suggestion-${item.id}`} delivery={item} />
                  ))
                ) : (
                  <Text className="text-gray-500 px-4">No suggested deliveries.</Text>
                )}
              </>
            )}
          </>
        }
        data={[]}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ paddingBottom: 100 }}
        className='bg-gray-100'
      />

    </SafeAreaView>

  );
};


export default Shipment;



