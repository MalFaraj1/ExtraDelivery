import { View, Text, FlatList, RefreshControl, TouchableOpacity, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useUserContext } from "@/context/UserContext";
import { useState, useEffect } from "react";
import { getAvailableDeliveries } from "@/services/deliveries";
import DeliveryCard from "@/components/card";
import { Filter } from "lucide-react-native";
import RNPickerSelect from "react-native-picker-select";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { getNotifications } from '@/services/notifications';



export default function Home() {
  const router = useRouter();
  const {user} = useUserContext();

  const [deliveries, setDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnread] = useState(0);

  const [isFilterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);


  const fetchDeliveries = async (pageNumber = 1, isRefresh = false) => {
    try {
      const filters = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (selectedCity) filters.location = selectedCity;
  
      const res = await getAvailableDeliveries(pageNumber, filters);
      const newDeliveries = res.data;
  
      if (isRefresh) {
        setDeliveries(newDeliveries);
      } else {
        setDeliveries(prev => [...prev, ...newDeliveries]);
      }
  
      if (newDeliveries.length === 0 || newDeliveries.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === "driver") {
      fetchDeliveries();
    }
  }, [user]);
  useEffect(() => {
  getNotifications().then(arr =>
    setUnread(arr.filter(n=>!n.is_read).length)
  );
}, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchDeliveries(1, true);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (!isFetchingMore && hasMore) {
      setIsFetchingMore(true);
      const nextPage = page + 1;
      await fetchDeliveries(nextPage);
      setPage(nextPage);
      setIsFetchingMore(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="p-5 border-b border-gray-300 flex-row justify-between items-center">
        <Text className="text-blue-500 text-2xl font-pbold text-left">ExtraDelivery</Text>
        <View className="flex-row">
          <TouchableOpacity onPress={() => router.push("/addFriend")}>
            <Ionicons name="person-add" className="mx-8" size={25} color="#3b82f6"/>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Ionicons name="notifications" size={25} color="#3b82f6" />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute', top: -2, right: -2,
                backgroundColor: 'red', width: 12, height: 12, borderRadius: 6 }}
              />
            )}
          </TouchableOpacity>

        </View>
      </View>

      <Modal visible={isFilterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <BlurView intensity={50} tint="dark" className="absolute inset-0" />

          <View className="bg-white p-5 rounded-2xl w-full max-w-md z-10 relative">
            {/* X Close Button */}
            <TouchableOpacity
              onPress={() => setFilterVisible(false)}
              className="absolute top-3 right-3 z-20"
            >
              <Text className="text-xl text-gray-500">✕</Text>
            </TouchableOpacity>

            <Text className="text-lg font-semibold mb-3 text-gray-800 text-center">Filter Deliveries</Text>

            <Text className="text-base font-medium mb-1">Category</Text>
            <View className="border border-gray-300 rounded-lg mb-4">
              <RNPickerSelect
                onValueChange={value => setSelectedCategory(value)}
                items={[
                  { label: "Food", value: "food" },
                  { label: "Groceries", value: "groceries" },
                  { label: "Packages", value: "packages" },
                  { label: "Furniture", value: "furniture" },
                ]}
                placeholder={{ label: "Select a category...", value: null }}
                value={selectedCategory}
              />
            </View>
              
            <Text className="text-base font-medium mb-1">Location</Text>
            <View className="border border-gray-300 rounded-lg mb-4">
              <RNPickerSelect
                onValueChange={value => setSelectedCity(value)}
                items={[
                  { label: "Beirut", value: "Beirut" },
                  { label: "Tripoli", value: "Tripoli" },
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
                placeholder={{ label: "Select a city...", value: null }}
                value={selectedCity}
              />
            </View>
              
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-lg"
              onPress={() => {
                setFilterVisible(false);
                onRefresh();
              }}
            >
              <Text className="text-white text-center font-semibold text-lg">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {user?.role === "driver" ? (
        <>
          <View className="flex-row items-center justify-between px-5 pt-4 pb-2 bg-gray-100">
            <Text className="text-xl font-bold text-gray-800">Available Deliveries</Text>
            <TouchableOpacity onPress={() => setFilterVisible(true)}>
              <Filter color="#2563EB" size={24} />
            </TouchableOpacity>

          </View>

          <FlatList
            data={deliveries}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <DeliveryCard delivery={item} />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetchingMore ? <Text className="text-center my-4">Loading more...</Text> : null
            }
            className="bg-gray-100"
          />
        </>
      ) : (
        <ScrollView className="flex-1 px-6 bg-gray-100" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View className="justify-center items-center py-10 ">
            <Text className="text-blue-600 text-3xl font-pbold mb-2">Welcome, {user?.name?.split(" ")[0]} 👋</Text>
            <Text className="text-gray-700 text-lg text-center mb-2">
              This is <Text className="font-bold text-blue-500">ExtraDelivery</Text>, your go-to app for sending anything, anywhere.
            </Text>
            <Text className="text-gray-700 text-md text-center mb-8">
              Tap below to create a new delivery request and let one of our trusted drivers help you.
            </Text>

            <TouchableOpacity
              className="bg-blue-600 px-8 py-4 rounded-xl"
              onPress={() => router.push("/(pages)/deliveryRequest")}
            >
              <Text className="text-white text-lg font-semibold">Create Delivery Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
  
}




