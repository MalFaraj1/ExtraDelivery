import AsyncStorage from "@react-native-async-storage/async-storage";
import {api} from "./api";

export const getAvailableDeliveries = async (page = 1, filters = {}) => {
  try {
    const params = { page, ...filters };
    const response = await api.get(`/api/delivery/available`, { params });
    return response;
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    throw error;
  }
};

export const getCustomerDeliveries = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await api.get("/api/delivery/customer", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch customer deliveries:", error);
    throw error;
  }
};

export const getDeliveryUserShipments = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await api.get("/api/delivery/delivery-user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // contains { accepted: [...], suggestions: [...] }
  } catch (error) {
    console.error("Failed to fetch delivery user shipments:", error);
    throw error;
  }
};

// GET /api/delivery/:id
export const getDeliveryById = async (id) => {
  const token = await AsyncStorage.getItem("token");
  const response = await api.get(`/api/delivery/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;   
};

// POST /api/delivery/:id/apply
export const applyForDelivery = async (id) => {
  const token = await AsyncStorage.getItem("token");
  const response = await api.post(
    `/api/delivery/${id}/apply`,
    {},                      
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data; 
};

// Fetch history deliveries
export const getDeliveryHistory = async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await api.get("/api/delivery/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createDelivery = async (data) => {
  const token = await AsyncStorage.getItem('token');
  const res = await api.post('/api/delivery', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const completeDelivery = async (deliveryId) => {
  const token = await AsyncStorage.getItem("token");
  const response = await api.post(
    `/api/delivery/${deliveryId}/complete`,
    {}, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const respondToApplication = async (deliveryId, action) => {
  const token = await AsyncStorage.getItem("token");
  const response = await api.post(
    `/api/delivery/${deliveryId}/respond`,
    { action }, 
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const cancelDelivery = async (deliveryId) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.post(
    `/api/delivery/${deliveryId}/cancel`,
    {}, // no body
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

// Record a cash payment
export const recordPayment = async (deliveryId, method) => {
  const token = await AsyncStorage.getItem("token");
  const { data } = await api.post(
    `/api/delivery/${deliveryId}/pay`,
    { method },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};



