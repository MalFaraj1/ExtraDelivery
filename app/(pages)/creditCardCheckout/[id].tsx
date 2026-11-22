import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDeliveryById } from "@/services/deliveries";
import { submitCreditCardPayment } from "@/services/payments";

export default function CreditCardCheckout() {
  const { id: deliveryId } = useLocalSearchParams();
  const router = useRouter();

  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cardNumber, setCardNumber] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDeliveryById(deliveryId);
        setDelivery(data);
      } catch (err) {
        Alert.alert("Error", "Could not load delivery");
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [deliveryId]);

  const handlePay = async () => {
    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return Alert.alert("Validation", "All fields are required.");
    }
    setSubmitting(true);
    try {
      await submitCreditCardPayment(deliveryId, {
        card_number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
        cvc,
      });
      Alert.alert("Success", "Your payment was processed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", err.response?.data?.error || "Payment failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Pay ${delivery.price} by Credit Card
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Card Number"
        keyboardType="number-pad"
        value={cardNumber}
        onChangeText={setCardNumber}
      />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="MM"
          keyboardType="number-pad"
          value={expMonth}
          onChangeText={setExpMonth}
        />
        <TextInput
          style={[styles.input, styles.half]}
          placeholder="YY"
          keyboardType="number-pad"
          value={expYear}
          onChangeText={setExpYear}
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="CVC"
        keyboardType="number-pad"
        value={cvc}
        onChangeText={setCvc}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handlePay}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? "Processing…" : "Submit Payment"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  half: { width: "48%" },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
