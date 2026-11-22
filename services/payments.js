import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";


export const getPaymentByDeliveryId = async (deliveryId) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.get(
    `/api/payment/${deliveryId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

export const submitCreditCardPayment = async (deliveryId, cardInfo) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.post(
    "/api/payment/charge",
    {
      delivery_id: deliveryId,
      ...cardInfo
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};