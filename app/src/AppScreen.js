import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Bike, Clock3, CreditCard, MapPin, Minus, Plus, Search, ShoppingBag, Star } from "lucide-react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";

const restaurants = [
  {
    id: 1,
    name: "Bombay Bowl House",
    cuisine: "North Indian",
    rating: 4.7,
    eta: "24-30 min",
    offer: "40% off",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    tags: ["Biryani", "Paneer", "Thali"],
    menu: [
      { id: "bbh-1", name: "Butter Paneer Bowl", price: 229 },
      { id: "bbh-2", name: "Lucknowi Veg Biryani", price: 249 },
      { id: "bbh-3", name: "Dal Makhani Meal", price: 199 },
    ],
  },
  {
    id: 2,
    name: "Tandoor Street",
    cuisine: "Mughlai",
    rating: 4.5,
    eta: "18-25 min",
    offer: "Free delivery",
    image: "https://images.unsplash.com/photo-1628294896516-344152572ee8?auto=format&fit=crop&w=900&q=80",
    tags: ["Kebabs", "Rolls", "Naan"],
    menu: [
      { id: "ts-1", name: "Chicken Tikka Roll", price: 179 },
      { id: "ts-2", name: "Tandoori Platter", price: 349 },
      { id: "ts-3", name: "Roomali Roti Combo", price: 149 },
    ],
  },
  {
    id: 3,
    name: "Urban Dosa Co.",
    cuisine: "South Indian",
    rating: 4.8,
    eta: "20-28 min",
    offer: "Buy 1 Get 1",
    image: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80",
    tags: ["Dosa", "Idli", "Coffee"],
    menu: [
      { id: "ud-1", name: "Ghee Roast Masala Dosa", price: 159 },
      { id: "ud-2", name: "Podi Idli Basket", price: 129 },
      { id: "ud-3", name: "Mini Tiffin Combo", price: 189 },
    ],
  },
];

const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

export default function App() {
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUser, setRegisteredUser] = useState({
    name: "Food Hungry Customer",
    email: "customer@foodhungry.com",
    mobile: "9876543210",
    password: "password123",
  });
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "customer@foodhungry.com",
    mobile: "",
    password: "password123",
  });
  const [authMessage, setAuthMessage] = useState("");
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [query, setQuery] = useState("");
  const [restaurantList, setRestaurantList] = useState(restaurants);
  const [selected, setSelected] = useState(restaurants[0]);
  const [cart, setCart] = useState({});
  const [apiStatus, setApiStatus] = useState("Connecting to backend...");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    async function loadRestaurants() {
      try {
        const response = await fetch(`${apiUrl}/api/restaurants`);
        if (!response.ok) {
          throw new Error(`Backend returned ${response.status}`);
        }
        const data = await response.json();
        setRestaurantList(data);
        setSelected(data[0] || restaurants[0]);
        setApiStatus("Live data from API Gateway");
      } catch (error) {
        setRestaurantList(restaurants);
        setSelected(restaurants[0]);
        setApiStatus("Using sample data because backend is not reachable");
      }
    }

    loadRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return restaurantList;
    return restaurantList.filter((restaurant) => {
      return (
        restaurant.name.toLowerCase().includes(cleanQuery) ||
        restaurant.cuisine.toLowerCase().includes(cleanQuery) ||
        restaurant.tags.some((tag) => tag.toLowerCase().includes(cleanQuery))
      );
    });
  }, [query, restaurantList]);

  const cartItems = Object.values(cart);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal === 0 || subtotal > 399 ? 0 : 29;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  const updateAuthField = (field, value) => {
    setAuthForm((current) => ({ ...current, [field]: value }));
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid email or password.");
      }

      const user = await response.json();
      setCurrentUser(user);
      setShowAuthPrompt(false);
      setAuthMessage("");
      setOrderStatus("");
    } catch (error) {
      setAuthMessage("Invalid email or password.");
    }
  };

  const handleRegister = async () => {
    if (!authForm.name.trim() || !authForm.email.trim() || !authForm.mobile.trim() || !authForm.password.trim()) {
      setAuthMessage("Please fill all registration fields.");
      return;
    }

    if (authForm.password.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: authForm.name,
          email: authForm.email,
          mobile: authForm.mobile,
          password: authForm.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Registration failed.");
      }

      const user = await response.json();
      setRegisteredUser({ ...user, password: authForm.password });
      setCurrentUser(user);
      setShowAuthPrompt(false);
      setAuthMessage("");
      setOrderStatus("");
    } catch (error) {
      setAuthMessage("Registration failed. Email may already be registered.");
    }
  };

  const addItem = (item) => {
    setCart((current) => ({
      ...current,
      [item.id]: { ...item, qty: (current[item.id]?.qty || 0) + 1 },
    }));
  };

  const removeItem = (item) => {
    setCart((current) => {
      const next = { ...current };
      if (!next[item.id]) return next;
      next[item.id] = { ...next[item.id], qty: next[item.id].qty - 1 };
      if (next[item.id].qty <= 0) delete next[item.id];
      return next;
    });
  };

  const placeOrder = async () => {
    if (!cartItems.length) return;

    if (!currentUser) {
      setShowAuthPrompt(true);
      setOrderStatus("Please login or register before placing your order.");
      return;
    }

    setOrderStatus("Sending order to backend...");
    try {
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: selected.id,
          customerName: currentUser?.name || "Food Hungry Customer",
          address: "Hyderabad, India",
          items: cartItems.map((item) => ({
            menuItemId: item.id,
            name: item.name,
            quantity: item.qty,
            unitPrice: item.price,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Order service returned ${response.status}`);
      }

      const order = await response.json();
      setCart({});
      setOrderStatus(`Order placed successfully. Order id: ${order.id}`);
    } catch (error) {
      setOrderStatus("Order service is not reachable. Please check backend.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ExpoStatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Food Hungry</Text>
            <View style={styles.location}>
              <MapPin size={16} color="#ef3b2d" />
              <Text style={styles.locationText}>
                {currentUser ? `Hi ${currentUser.name} • Hyderabad, India` : "Hyderabad, India"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {currentUser ? (
              <Pressable
                onPress={() => {
                  setCurrentUser(null);
                  setCart({});
                  setOrderStatus("");
                }}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Logout</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  setShowAuthPrompt(true);
                  setAuthMode("login");
                  setOrderStatus("");
                }}
                style={styles.logoutButton}
              >
                <Text style={styles.logoutText}>Login</Text>
              </Pressable>
            )}
            <View style={styles.bagButton}>
              <ShoppingBag size={22} color="#fff" />
              <Text style={styles.bagCount}>{cartItems.length}</Text>
            </View>
          </View>
        </View>

        {showAuthPrompt && !currentUser ? (
          <AuthPanel
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            updateAuthField={updateAuthField}
            authMessage={authMessage}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
          />
        ) : null}

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Hungry? Food is coming fast.</Text>
          <Text style={styles.heroText}>Find nearby restaurants, build your order, and track delivery from one app.</Text>
          <Text style={styles.apiStatus}>{apiStatus}</Text>
          <View style={styles.searchBox}>
            <Search size={20} color="#766b61" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search biryani, dosa, rolls..."
              placeholderTextColor="#9a8c80"
              style={styles.searchInput}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Restaurants near you</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.restaurantList}>
          {filteredRestaurants.map((restaurant) => (
            <Pressable
              key={restaurant.id}
              onPress={() => setSelected(restaurant)}
              style={[styles.restaurantCard, selected.id === restaurant.id && styles.restaurantCardActive]}
            >
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.restaurantBody}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.muted}>{restaurant.cuisine}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.rating}><Star size={13} color="#fff" fill="#fff" /> {restaurant.rating}</Text>
                  <Text style={styles.muted}><Clock3 size={13} color="#756b61" /> {restaurant.eta}</Text>
                </View>
                <Text style={styles.offer}>{restaurant.offer}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>{selected.name} menu</Text>
          {(selected.menu || []).map((item) => (
            <View key={item.id} style={styles.menuLine}>
              <View style={styles.menuInfo}>
                <Text style={styles.menuName}>{item.name}</Text>
                <Text style={styles.muted}>Rs {item.price}</Text>
              </View>
              <View style={styles.stepper}>
                <Pressable onPress={() => removeItem(item)} style={styles.stepButton}>
                  <Minus size={16} color="#ef3b2d" />
                </Pressable>
                <Text style={styles.qty}>{cart[item.id]?.qty || 0}</Text>
                <Pressable onPress={() => addItem(item)} style={styles.stepButton}>
                  <Plus size={16} color="#ef3b2d" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.cartTitle}>
            <CreditCard size={22} color="#1f1b16" />
            <Text style={styles.sectionTitle}>Checkout</Text>
          </View>
          {cartItems.length === 0 ? (
            <Text style={styles.muted}>Your cart is empty.</Text>
          ) : (
            cartItems.map((item) => (
              <View key={item.id} style={styles.billLine}>
                <Text style={styles.billText}>{item.qty}x {item.name}</Text>
                <Text style={styles.billStrong}>Rs {item.qty * item.price}</Text>
              </View>
            ))
          )}
          <View style={styles.divider} />
          <BillRow label="Subtotal" value={`Rs ${subtotal}`} />
          <BillRow label="Delivery" value={delivery ? `Rs ${delivery}` : "Free"} />
          <BillRow label="Tax" value={`Rs ${tax}`} />
          <View style={styles.totalLine}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalText}>Rs {total}</Text>
          </View>
          {orderStatus ? <Text style={styles.orderStatus}>{orderStatus}</Text> : null}
          <Pressable
            disabled={!cartItems.length}
            onPress={placeOrder}
            style={[styles.checkoutButton, !cartItems.length && styles.disabled]}
          >
            <Bike size={19} color="#fff" />
            <Text style={styles.checkoutText}>Place order</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BillRow({ label, value }) {
  return (
    <View style={styles.billLine}>
      <Text style={styles.billText}>{label}</Text>
      <Text style={styles.billStrong}>{value}</Text>
    </View>
  );
}

function AuthPanel({
  authMode,
  setAuthMode,
  authForm,
  updateAuthField,
  authMessage,
  handleLogin,
  handleRegister,
}) {
  return (
    <View style={styles.authPanel}>
      <Text style={styles.authInlineTitle}>Login or register to continue ordering</Text>
      <View style={styles.authTabs}>
        <Pressable
          onPress={() => setAuthMode("login")}
          style={[styles.authTab, authMode === "login" && styles.authTabActive]}
        >
          <Text style={[styles.authTabText, authMode === "login" && styles.authTabTextActive]}>Login</Text>
        </Pressable>
        <Pressable
          onPress={() => setAuthMode("register")}
          style={[styles.authTab, authMode === "register" && styles.authTabActive]}
        >
          <Text style={[styles.authTabText, authMode === "register" && styles.authTabTextActive]}>Register</Text>
        </Pressable>
      </View>

      {authMode === "register" ? (
        <LabeledInput label="Full name" value={authForm.name} onChangeText={(value) => updateAuthField("name", value)} />
      ) : null}
      <LabeledInput
        label="Email"
        value={authForm.email}
        keyboardType="email-address"
        onChangeText={(value) => updateAuthField("email", value)}
      />
      {authMode === "register" ? (
        <LabeledInput
          label="Mobile number"
          value={authForm.mobile}
          keyboardType="phone-pad"
          onChangeText={(value) => updateAuthField("mobile", value)}
        />
      ) : null}
      <LabeledInput
        label="Password"
        value={authForm.password}
        secureTextEntry
        onChangeText={(value) => updateAuthField("password", value)}
      />

      {authMessage ? <Text style={styles.authError}>{authMessage}</Text> : null}

      <Pressable style={styles.authButton} onPress={authMode === "login" ? handleLogin : handleRegister}>
        <Text style={styles.authButtonText}>{authMode === "login" ? "Login and continue" : "Register and continue"}</Text>
      </Pressable>

      <Text style={styles.demoText}>Demo login: customer@foodhungry.com / password123</Text>
    </View>
  );
}

function LabeledInput({ label, ...inputProps }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        autoCapitalize="none"
        placeholderTextColor="#9a8c80"
        style={styles.authInput}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff8ef",
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  page: {
    alignSelf: "center",
    maxWidth: 1080,
    padding: 18,
    paddingBottom: 36,
    width: "100%",
  },
  authPage: {
    alignSelf: "center",
    maxWidth: 980,
    padding: 18,
    paddingBottom: 34,
    width: "100%",
  },
  authHero: {
    backgroundColor: "#ef3b2d",
    borderRadius: 8,
    marginBottom: 18,
    padding: 24,
  },
  authLogo: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 34,
  },
  authTitle: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
  },
  authSubtitle: {
    color: "#ffe9dc",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    maxWidth: 560,
  },
  authPanel: {
    backgroundColor: "#fffaf4",
    borderColor: "#f0dfcc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 18,
  },
  authInlineTitle: {
    color: "#1f1b16",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  authTabs: {
    backgroundColor: "#fff3e8",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginBottom: 18,
    padding: 6,
  },
  authTab: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    padding: 12,
  },
  authTabActive: {
    backgroundColor: "#1f1b16",
  },
  authTabText: {
    color: "#756b61",
    fontWeight: "900",
  },
  authTabTextActive: {
    color: "#fff",
  },
  inputGroup: {
    gap: 7,
    marginBottom: 14,
  },
  inputLabel: {
    color: "#1f1b16",
    fontSize: 14,
    fontWeight: "900",
  },
  authInput: {
    backgroundColor: "#fffaf4",
    borderColor: "#f0dfcc",
    borderRadius: 8,
    borderWidth: 1,
    color: "#1f1b16",
    minHeight: 48,
    outlineStyle: "none",
    paddingHorizontal: 14,
  },
  authError: {
    color: "#ef3b2d",
    fontWeight: "900",
    marginBottom: 12,
  },
  authButton: {
    alignItems: "center",
    backgroundColor: "#ef3b2d",
    borderRadius: 8,
    padding: 15,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
  demoText: {
    color: "#756b61",
    fontSize: 13,
    marginTop: 14,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  logoutButton: {
    backgroundColor: "#fff",
    borderColor: "#f0dfcc",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  logoutText: {
    color: "#1f1b16",
    fontWeight: "900",
  },
  logo: {
    color: "#1f1b16",
    fontSize: 27,
    fontWeight: "900",
  },
  location: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginTop: 4,
  },
  locationText: {
    color: "#756b61",
    fontSize: 14,
  },
  bagButton: {
    alignItems: "center",
    backgroundColor: "#1f1b16",
    borderRadius: 8,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bagCount: {
    color: "#fff",
    fontWeight: "800",
  },
  hero: {
    backgroundColor: "#ef3b2d",
    borderRadius: 8,
    marginBottom: 24,
    padding: 22,
  },
  heroTitle: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    maxWidth: 640,
  },
  heroText: {
    color: "#ffe9dc",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
    maxWidth: 620,
  },
  apiStatus: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 12,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: "#1f1b16",
    flex: 1,
    minHeight: 48,
    outlineStyle: "none",
  },
  sectionTitle: {
    color: "#1f1b16",
    fontSize: 22,
    fontWeight: "900",
  },
  restaurantList: {
    gap: 14,
    paddingVertical: 14,
  },
  restaurantCard: {
    backgroundColor: "#fff",
    borderColor: "#f0dfcc",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    width: 260,
  },
  restaurantCardActive: {
    borderColor: "#ef3b2d",
  },
  restaurantImage: {
    height: 145,
    width: "100%",
  },
  restaurantBody: {
    gap: 7,
    padding: 12,
  },
  restaurantName: {
    color: "#1f1b16",
    fontSize: 17,
    fontWeight: "900",
  },
  muted: {
    color: "#756b61",
    fontSize: 14,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rating: {
    alignItems: "center",
    backgroundColor: "#13803f",
    borderRadius: 6,
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  offer: {
    color: "#ef3b2d",
    fontWeight: "900",
  },
  panel: {
    backgroundColor: "#fff",
    borderColor: "#f0dfcc",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  menuLine: {
    alignItems: "center",
    borderTopColor: "#f0dfcc",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  menuInfo: {
    flex: 1,
    paddingRight: 12,
  },
  menuName: {
    color: "#1f1b16",
    fontSize: 16,
    fontWeight: "800",
  },
  stepper: {
    alignItems: "center",
    borderColor: "#ef3b2d",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    height: 38,
  },
  stepButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  qty: {
    color: "#ef3b2d",
    fontWeight: "900",
    textAlign: "center",
    width: 30,
  },
  cartTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  billLine: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  billText: {
    color: "#4a4038",
    flex: 1,
    paddingRight: 14,
  },
  billStrong: {
    color: "#1f1b16",
    fontWeight: "800",
  },
  divider: {
    backgroundColor: "#f0dfcc",
    height: 1,
    marginVertical: 10,
  },
  totalLine: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  totalText: {
    color: "#1f1b16",
    fontSize: 20,
    fontWeight: "900",
  },
  orderStatus: {
    color: "#ef3b2d",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8,
  },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: "#1f1b16",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 12,
    padding: 15,
  },
  disabled: {
    opacity: 0.45,
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});
