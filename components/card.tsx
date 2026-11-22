import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';
import { useRouter } from 'expo-router';

const statusColors = {
  pending: '#FFA500',
  in_transit: '#007BFF',
  delivered: '#28A745',
  canceled: '#DC3545',
  pending_application: '#FFC107',
};

const DeliveryCard = ({ delivery }) => {
  const router = useRouter();
  const profileImage = `http://192.168.0.100:5000${delivery.customer_pfp}`;
  const timeAgo = moment(delivery.created_at).fromNow(); // fixed field name

  const statusColor = statusColors[delivery.status] || '#9EA0A4';

  return (
    <View style={[styles.cardWrapper]}>
      <View style={[styles.statusStrip, { backgroundColor: statusColor }]} />
      <View style={styles.card}>
        {/* Top: Price and ID */}
        <View style={styles.topRow}>
          <Text style={styles.price}>{delivery.price} $</Text>
          <Text style={styles.orderId}>No. {delivery.id}</Text>
        </View>

        {/* Poster */}
        <View style={styles.posterRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={profileImage ? { uri: profileImage } : require("../assets/images/avatar.png")}
              style={styles.avatar}
            />
            <Text style={styles.posterName}>{delivery.customer_name}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{delivery.status}</Text>
          </View>
        </View>

        {/* Location Info */}
        <View style={styles.locationBlock}>
          <Ionicons name="radio-button-on-outline" size={16} color="gray" />
          <View>
            <Text style={styles.address}>{delivery.pickup_location}</Text>
            <Text style={styles.city}>Pickup</Text>
          </View>
        </View>
        <View style={styles.locationBlock}>
          <Ionicons name="location-outline" size={16} color="green" />
          <View>
            <Text style={styles.address}>{delivery.dropoff_location}</Text>
            <Text style={styles.city}>Dropoff</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.category}>{delivery.category}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>

        {/* Details Button */}
        <TouchableOpacity
          style={styles.detailsBtn}
          onPress={() => router.push(`/deliveryDetails/${delivery.id}`)}
        >
          <Text style={styles.detailsText}>Details &gt;</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: 'row',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  statusStrip: {
    width: 6,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderId: {
    color: '#999',
    fontSize: 12,
  },
  posterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  posterName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    gap: 6,
  },
  address: {
    fontWeight: 'bold',
  },
  city: {
    color: 'gray',
    fontSize: 12,
  },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    backgroundColor: '#E6F4FF',
    color: '#007AFF',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  time: {
    fontSize: 12,
    color: '#888',
  },
  detailsBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  detailsText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default DeliveryCard;
