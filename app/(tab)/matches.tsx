import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  Button, // Keep for your "Add Match" button
  ActivityIndicator,
  Alert,
  RefreshControl, // Added for pull-to-refresh
} from 'react-native';
import MatchesHeader from '../../components/headers/MatchesHeader';
import { useRouter } from 'expo-router';
import { matchService } from '../../services/api'; // Assuming you create/use this service
import { Ionicons } from '@expo/vector-icons'; // For error icon

// --- Interface for data coming directly from the API ---
// This should reflect the actual structure of a single match object from your backend.
// Based on your log: {"chatRoomId": "...", "displayName": ..., "matchId": ..., "profilePicture": ..., "userId": ...}
// IMPORTANT: Added 'status' and 'currentStatus' based on their usage for DisplayMatch.
// Verify these field names and their presence in your actual API response.
interface BackendMatchFromAPI {
  matchId: string;
  userId: string;           // This is the ID of the other user in the match
  displayName: string;
  profilePicture: string;   // URL for the profile picture
  status: "PENDING" | "ACCEPTED" | "REJECTED"; // The match status (e.g., confirmed match)
  currentStatus?: 'ONLINE' | 'OFFLINE' | string; // Online status of the other user (e.g., 'ONLINE', 'OFFLINE')

  // Optional fields from your log - include if needed for other purposes
  chatRoomId?: string;
  // lastMessage?: { content: string; isSentByMe: boolean; sentAt: string; };
  // matchedOn?: string;
}

// --- Frontend Interface for a displayed match ---
// This remains the same as it defines what you want to display.
interface DisplayMatch {
  id: string;          // Unique ID for the list item (derived from matchId)
  targetUserId: string; // ID of the other user, for navigation/actions
  displayName: string;
  profilePicture: string;
  matchStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  onlineStatus: 'online' | 'offline' | 'unknown';
}


const { width } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.33;
const CARD_WIDTH = width * 0.45;

const MatchesScreen = () => {
  const router = useRouter();
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // For pull-to-refresh

  const fetchMatches = useCallback(async () => {
    if (!refreshing) setIsLoading(true); // Only show full loader if not refreshing
    setApiError(null);

    try {
      // Assuming matchService.getConfirmedMatches() returns Promise<{ data: BackendMatchFromAPI[] } | BackendMatchFromAPI[]>
      const response: any = await matchService.getConfirmedMatches();
      
      let rawApiMatches: BackendMatchFromAPI[];

      if (Array.isArray(response)) {
        rawApiMatches = response;
      } else if (response && Array.isArray(response.data)) {
        rawApiMatches = response.data;
      } else {
        console.warn("Unexpected matches response format:", response);
        rawApiMatches = [];
      }

      // Log the first raw item to verify its structure if needed
      if (rawApiMatches.length > 0) {
        // console.log("First raw API match data:", rawApiMatches[0]);
      }

      console.log("rawApiMatches", rawApiMatches[0]);
      const newDisplayMatches: DisplayMatch[] = rawApiMatches.map(apiMatch => ({
        id: apiMatch.matchId, // Use matchId as the unique ID for DisplayMatch
        targetUserId: apiMatch.userId,
        displayName: apiMatch.displayName || 'Unknown User',
        profilePicture: apiMatch.profilePicture || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image',
        matchStatus: apiMatch.status, // Assumes 'status' field exists on apiMatch
        onlineStatus: apiMatch.currentStatus === 'ONLINE' ? 'online' : 'offline', // Assumes 'currentStatus' field exists
      }));

      setMatches(newDisplayMatches);

    } catch (error: any) {
      console.error("Error fetching matches:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to load matches.";
      setApiError(errorMessage);
    } finally {
      setIsLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [refreshing]); // Add refreshing to dependency array if its change should trigger a re-creation of fetchMatches (though not strictly necessary here as onRefresh controls it)

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]); // fetchMatches is memoized by useCallback

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // fetchMatches will set refreshing to false in its finally block
    await fetchMatches();
  }, [fetchMatches]); // Re-create onRefresh if fetchMatches changes

  const handleProfilePress = (matchItem: DisplayMatch) => {
    router.push({
      pathname: "/(tab)/profile",
      params: {
        userId: matchItem.targetUserId,
      }
    });
  };

  const renderItem = ({ item }: { item: DisplayMatch }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleProfilePress(item)}
    >
      <Image source={{ uri: item.profilePicture }} style={[styles.image, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} />
      <Text style={styles.name}>{item.displayName}</Text>
      <View style={styles.statusContainer}>
        <View style={[
            styles.statusDot,
            { backgroundColor: item.onlineStatus === 'online' ? '#27AE60' : item.onlineStatus === 'offline' ? '#E74C3C' : '#95A5A6' }
        ]} />
        <Text style={[
            styles.statusText,
            { color: item.onlineStatus === 'online' ? '#27AE60' : item.onlineStatus === 'offline' ? '#E74C3C' : '#7F8C8D' }
        ]}>
            {item.onlineStatus.charAt(0).toUpperCase() + item.onlineStatus.slice(1)}
        </Text>
      </View>
      <Text style={styles.matchInteractionStatus}>{item.matchStatus}</Text>
    </TouchableOpacity>
  );

  if (isLoading && matches.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Finding your matches...</Text>
      </SafeAreaView>
    );
  }

  if (apiError && matches.length === 0) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color="#888" />
        <Text style={styles.errorText}>{apiError}</Text>
        <TouchableOpacity onPress={()=> {
          router.push("/auth/login") // Consider if this is always the right action
        }}>
          <Text style={{color: '#FF6F00', marginTop: 10, textDecorationLine: 'underline'}}>Go to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.retryButton, {marginTop: 20}]} onPress={() => fetchMatches()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MatchesHeader />
      <Button
        title="Temp: Go to Onboarding Q31"
        onPress={() => router.push('/onboarding/values&futureplans/Question31')}
      />
      <View style={styles.content}>
        {matches.length === 0 && !isLoading ? (
          <View style={styles.centered}>
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No matches found yet.</Text>
            {apiError && <Text style={[styles.errorText, {marginTop: 10}]}>Error: {apiError}</Text>}
             <TouchableOpacity style={styles.retryButton} onPress={() => fetchMatches()}>
                <Text style={styles.retryButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            refreshControl={ // Added RefreshControl
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#FF6F00"]}
                tintColor={"#FF6F00"} 
              />
            }
                     />
        )}
        {/* Inline API error display if matches are already present but a refresh failed */}
        {apiError && matches.length > 0 && (
            <Text style={[styles.errorText, { padding: 10, backgroundColor: '#FFF0F0' }]}>
                Could not refresh: {apiError}
            </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  image: {
    borderRadius: (IMAGE_SIZE * 0.1), // Make it slightly rounded, or use 15 if you prefer the original card's radius
    backgroundColor: '#E0E0E0',
  },
  name: {
    fontSize: 16, // Adjusted for better fit
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8, // Adjusted
    textAlign: 'center',
    minHeight: 38, // To accommodate two lines of text if name is long
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5, // Adjusted
  },
  statusDot: {
    width: 9, // Adjusted
    height: 9,
    borderRadius: 4.5,
    marginRight: 5, // Adjusted
  },
  statusText: {
    fontSize: 12, // Adjusted
    fontWeight: '500',
  },
  matchInteractionStatus: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#FF8F00',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchesScreen;