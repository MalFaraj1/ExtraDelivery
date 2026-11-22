import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Modal,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Ionicons } from "@expo/vector-icons";
import {
  getDeliveryById,
  applyForDelivery,
  respondToApplication,
  completeDelivery,
  cancelDelivery,
  recordPayment,
} from "@/services/deliveries";
import { getPaymentByDeliveryId } from "@/services/payments";
import { useUserContext } from "@/context/UserContext";
import { SafeAreaView } from "react-native-safe-area-context";

const GOOGLE_MAPS_APIKEY = "AIzaSyDlDH30chD_FFQ3ewtahu3-kSot1S3vOX0";

export default function DeliveryDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUserContext();
  const mapRef = useRef(null);

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const [payModalVisible, setPayModalVisible] = useState(false);
  const [method, setMethod] = useState<'cash'|'credit_card'|null>(null);

  const [payment, setPayment] = useState(null);

  useEffect(() => {
    fetchDelivery();
  }, [id]);

  const fetchDelivery = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryById(id);
      setDelivery(data);
      if(data.status !== 'canceled'){
        const payments = await getPaymentByDeliveryId(id);
        setPayment(payments);
      }
    } catch {
      Alert.alert("Error", "Could not load delivery details.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleApply = async () => {
    try {
      await applyForDelivery(id);
      Alert.alert("Success", "You have applied for this delivery.");
      fetchDelivery();
    } catch {
      Alert.alert("Error", "Failed to apply for delivery.");
    }
  };

  const handleRespond = async (action) => {
    try {
      await respondToApplication(id, action);
      Alert.alert("Success", `You’ve ${action}ed the application.`);
      fetchDelivery();
    } catch {
      Alert.alert("Error", "Could not respond.");
    }
  };

  const handleComplete = async () => {
    try {
      await completeDelivery(id);
      Alert.alert("Success", "Delivery marked as delivered.");
      fetchDelivery();
    } catch {
      Alert.alert("Error", "Could not mark delivered.");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelDelivery(id);
      Alert.alert("Success", "Your delivery request has been canceled.");
      fetchDelivery();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not cancel your request.");
    }
  };

  const handlePayment = () => {
    setMethod(null);
    setPayModalVisible(true);
  };

  const submitPayment = async () => {
    if (!method) {
      Alert.alert('Please pick a method.');
      return;
    }
    if (method === 'cash') {
      try {
        await recordPayment(id, 'cash');
        Alert.alert('Paid in cash!');
        setPayModalVisible(false);
        fetchDelivery();
      } catch {
        Alert.alert('Error','Payment failed.');
      }
    } else {
      // credit card: route to your checkout flow
      setPayModalVisible(false);
      router.push(`/creditCardCheckout/${id}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }
  if (!delivery) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: "#555" }}>Delivery not found.</Text>
      </SafeAreaView>
    );
  }

  const origin = {
    latitude: parseFloat(delivery.pickup_lat),
    longitude: parseFloat(delivery.pickup_long),
  };
  const destination = {
    latitude: parseFloat(delivery.dropoff_lat),
    longitude: parseFloat(delivery.dropoff_long),
  };

  const statusColors = {
    pending: "#FFA500",
    pending_application: "#FFC107",
    in_transit: "#007AFF",
    delivered: "#28A745",
    canceled: "#FF3B30",
  };
  const color = statusColors[delivery.status] || "#999";

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="font-pbold" style={styles.headerTitle}>Delivery Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* poster */}
        <TouchableOpacity
          onPress={() =>
            router.push(
              user.id === delivery.customer_id
                ? "/profile"
                : `/userProfile/${delivery.customer_id}`
            )
          }
        >
          <View style={styles.personRow}>
            <Text style={{ fontWeight: "bold" }}>Poster: </Text>
            <Image
              source={
                delivery.customer_pfp
                  ? { uri: `http://192.168.0.100:5000${delivery.customer_pfp}` }
                  : require("../../../assets/images/avatar.png")
              }
              style={styles.avatar}
            />
            <Text style={styles.personName}>
              {delivery.customer_name}
            </Text>
          </View>
        </TouchableOpacity>

        {/* if driver assigned */}
        {delivery.driver_id && (
          <TouchableOpacity
            onPress={() =>
              router.push(
                user.id === delivery.driver_id
                  ? "/profile"
                  : `/userProfile/${delivery.driver_id}`
              )
            }
          >
            <View style={styles.personRow}>
              <Text style={{ fontWeight: "bold" }}>Driver: </Text>
              <Image
                source={
                  delivery.driver_pfp
                    ? { uri: `http://192.168.0.100:5000${delivery.driver_pfp}` }
                    : require("../../../assets/images/avatar.png")
                }
                style={styles.avatar}
              />
              <Text style={styles.personName}>
                {delivery.driver_name}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* status */}
        <View style={styles.statusRow}>
          <View style={[styles.statusIndicator, { backgroundColor: color }]} />
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusValue, { color }]}>
            {delivery.status.replace("_", " ")}
          </Text>
        </View>
        
         {/* Details */}
        <View style={styles.card}>
          <Row icon="pricetag"      label="Category"          value={delivery.category}           />
          <Row icon="reader"        label="Description"       value={delivery.item_description||'—'} />
          <Row icon="time"          label="ETA"               value={delivery.estimated_time}     />
          <Row icon="cash-outline"  label="Price"             value={delivery.price}        />
        </View>

        {/* map + route */}
        <View style={styles.mapCard}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: origin.latitude,
              longitude: origin.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          >
            <Marker coordinate={origin} title="Pickup" pinColor="gray" />
            <Marker
              coordinate={destination}
              title="Dropoff"
              pinColor="green"
            />
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="#007AFF"
              onReady={(res) =>
                mapRef.current.fitToCoordinates(res.coordinates, {
                  edgePadding: {
                    top: 50,
                    right: 50,
                    bottom: 50,
                    left: 50,
                  },
                  animated: true,
                })
              }
            />
          </MapView>
          <View style={styles.addresses}>
            <Text style={styles.addrLabel}>Pickup:</Text>
            <Text style={styles.addrText}>
              {delivery.pickup_location}
            </Text>
            <Text style={styles.addrLabel}>Dropoff:</Text>
            <Text style={styles.addrText}>
              {delivery.dropoff_location}
            </Text>
          </View>
        </View>

        {/* application buttons for customer */}
        {user.role === "customer" &&
          delivery.status === "pending_application" && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 12,
              }}
            >
              <TouchableOpacity
                style={styles.respondBtn}
                onPress={() => handleRespond("accept")}
              >
                <Text style={styles.respondText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.respondBtn, { backgroundColor: "#DC3545" }]}
                onPress={() => handleRespond("decline")}
              >
                <Text style={styles.respondText}>Decline</Text>
              </TouchableOpacity>
            </View>
          )}

        {/* apply button for driver */}
        {user.role === "driver" && !delivery.driver_id && (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={handleApply}
          >
            <Text style={styles.applyText}>Apply for Delivery</Text>
          </TouchableOpacity>
        )}

        {/* mark delivered button */}
        {user.role === "driver" &&
          delivery.status === "in_transit" && (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handleComplete}
            >
              <Text style={styles.applyText}>Mark Delivered</Text>
            </TouchableOpacity>
          )}

        {user.role === "customer" &&
          delivery.status === "pending" && (
            <TouchableOpacity
              style={[styles.completeBtn, { backgroundColor: "#DC3545" }]}
              onPress={handleCancel}
            >
              <Text style={styles.applyText}>Cancle Request</Text>
            </TouchableOpacity>
        )}

        {user.role === "customer" &&
          delivery.status === "delivered" && payment.status === 'pending' &&(
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={handlePayment}
            >
              <Text style={styles.applyText}>Pay</Text>
            </TouchableOpacity>
        )}
      </ScrollView>

      {/* ===== PAYMENT METHOD MODAL ===== */}
      <Modal
        visible={payModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose a method</Text>
            <TouchableOpacity
              style={[
                styles.methodBtn,
                method === 'cash' && styles.methodBtnSelected
              ]}
              onPress={() => setMethod('cash')}
            >
              <Text style={styles.methodText}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.methodBtn,
                method === 'credit_card' && styles.methodBtnSelected
              ]}
              onPress={() => setMethod('credit_card')}
            >
              <Text style={styles.methodText}>Credit Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={submitPayment}
            >
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPayModalVisible(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// small helper component
const Row = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#2563eb"/>
    <Text style={styles.rowLabel}>{label}:</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerTitle: {
    marginLeft: 16,
    fontSize: 18,
    color: "#1f2937",
  },
  content: { padding: 16 },
  card:       { backgroundColor:'#fff',borderRadius:8,padding:12,marginBottom:12,elevation:1 },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 8 },
  personName: { fontWeight: "600", fontSize: 16 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  statusIndicator: { width: 6, height: 30, borderRadius: 3, marginRight: 12 },
  statusLabel: { fontSize: 14, color: "#374151" },
  statusValue: { marginLeft: 8, fontSize: 14, fontWeight: "600" },
  applyBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  completeBtn: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  applyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  respondBtn: {
    flex: 1,
    backgroundColor: "#007aff",
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  respondText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  mapCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 1,
  },
  map: { width: "100%", height: 250 },
  addresses: { padding: 12 },
  addrLabel: { color: "#374151", fontSize: 13 },
  addrText: { fontWeight: "600", marginBottom: 6, color: "#1f2937" },
  row:        { flexDirection:'row',alignItems:'center',marginBottom:8 },
  rowLabel:   { marginLeft:8,color:'#374151',fontSize:14 },
  rowValue:   { marginLeft:'auto',fontSize:14,fontWeight:'600',color:'#1f2937' },

  // modal
  modalOverlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.5)',
    justifyContent:'center',
    alignItems:'center'
  },
  modalContent: {
    width:'80%',
    backgroundColor:'#fff',
    borderRadius:8,
    padding:16,
    alignItems:'stretch'
  },
  modalTitle: {
    fontSize:18, fontWeight:'600', marginBottom:12, textAlign:'center'
  },
  methodBtn: {
    padding:12,
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:6,
    marginBottom:8
  },
  methodBtnSelected: {
    borderColor:'#2563eb',
    backgroundColor:'#e5f0ff'
  },
  methodText: {
    fontSize:16, textAlign:'center'
  },
  submitBtn: {
    backgroundColor:'#2563eb',
    padding:12,
    borderRadius:6,
    marginTop:8
  },
  submitText: {
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  closeBtn: {
    marginTop:8
  },
  closeText: {
    textAlign:'center',
    color:'#2563eb'
  }
});
