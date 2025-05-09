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
  Alert
} from 'react-native';
import MatchesHeader from '../../components/headers/MatchesHeader';
import { useRouter } from 'expo-router';
import { matchService } from '../../services/api'; // Assuming you create/use this service
import { Ionicons } from '@expo/vector-icons'; // For error icon

// --- Frontend Interface for a displayed match ---
// This should reflect the data you want to DISPLAY for each match card.
// It's derived from the `targetUser` part of the BackendMatch.
interface DisplayMatch {
  id: string;          // This will be targetUser.id or the match.id itself, depending on navigation needs
  targetUserId: string; // Useful for navigation or further actions
  name: string;        // From targetUser.displayName
  image: string;       // From targetUser.avatarUrl
  matchStatus: "PENDING" | "ACCEPTED" | "REJECTED"; // Status of the match interaction
  onlineStatus: 'online' | 'offline' | 'unknown'; // Online status of the targetUser
}

// --- Backend Match Structure (for reference from your API docs) ---
interface BackendMatch {
  id: string; // The ID of the match record itself
  userId: string;
  targetUserId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED"; // Match interaction status
  initiatedBy: string;
  matchScore?: number;
  createdAt: string;
  updatedAt: string;
  targetUser: { // Profile info of the other user in the match
    id: string;
    displayName?: string;
    avatarUrl?: string;
    // Ideally, backend provides an online status or lastSeen for targetUser
    // For now, let's assume it might be 'online' | 'offline' or we default it
    currentStatus?: 'ONLINE' | 'OFFLINE'; // Example from a hypothetical backend field
    // ... other relevant fields from targetUser's profile
  };
}

interface PaginatedMatchesResponse {
    data: BackendMatch[]; // Assuming backend wraps matches in a 'data' array
    // Add other pagination fields if your backend provides them:
    // totalItems: number;
    //totalPages: number;
    //currentPage: number;
}


const { width } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.33;
const CARD_WIDTH = width * 0.45;

const MatchesScreen = () => {
  const router = useRouter();
  const [matches, setMatches] = useState<DisplayMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  // For pagination (optional, implement if needed)
  // const [currentPage, setCurrentPage] = useState(1);
  // const [isLoadingMore, setIsLoadingMore] = useState(false);
  // const [hasMore, setHasMore] = useState(true);


  const fetchMatches = useCallback(async (/* pageToFetch = 1 */) => {
    // if (pageToFetch === 1) {
      setIsLoading(true);
    // } else {
    //   setIsLoadingMore(true);
    // }
    setApiError(null);

    try {
      // Example: Fetching potential matches. Change to confirmed or add a toggle.
      // const response: PaginatedMatchesResponse = await matchService.getPotentialMatches({ limit: 20, page: pageToFetch }); 
      const response = await matchService.getConfirmedMatches(); // Assuming this returns BackendMatch[] or { data: BackendMatch[] }
      
      let backendMatchesData: BackendMatch[];

      if (Array.isArray(response)) { // If response is directly an array of matches
        backendMatchesData = response;
      } else if (response && Array.isArray(response.data)) { // If response is an object with a 'data' array
        backendMatchesData = response.data;
      } else {
        console.warn("Unexpected matches response format:", response);
        backendMatchesData = [];
      }


      const newDisplayMatches: DisplayMatch[] = backendMatchesData.map(backendMatch => ({
        id: backendMatch.id, // Use the match ID for the card key and potential navigation
        targetUserId: backendMatch.targetUser.id,
        name: backendMatch.targetUser.displayName || 'Unknown User',
        image: backendMatch.targetUser.avatarUrl || 'https://via.placeholder.com/150/CCCCCC/FFFFFF?text=No+Image', // Placeholder
        matchStatus: backendMatch.status,
        // Map backend's online status if available, otherwise default
        onlineStatus: backendMatch.targetUser.currentStatus === 'ONLINE' ? 'online' : 
                      backendMatch.targetUser.currentStatus === 'OFFLINE' ? 'offline' : 'unknown',
      }));

      // if (pageToFetch === 1) {
        setMatches(newDisplayMatches);
      // } else {
      //   setMatches(prevMatches => [...prevMatches, ...newDisplayMatches]);
      // }
      // setHasMore(newDisplayMatches.length > 0); // Basic check for more data

    } catch (error: any) {
      console.error("Error fetching matches:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to load matches.";
      setApiError(errorMessage);
      // Alert.alert("Error", errorMessage); // Can be intrusive
    } finally {
      setIsLoading(false);
      // setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleProfilePress = (matchItem: DisplayMatch) => {
    // Navigate to a generic profile page, passing the targetUserId.
    // That profile page will then fetch details for that user.
    // Or, if you want to pass more data directly:
    router.push({
      pathname: "/(tab)/profile", // Or your specific user profile view route
      params: { 
        userId: matchItem.targetUserId, // Key to fetch specific user profile
        // You can pass other readily available info if your profile page can use it as initial data
        // name: matchItem.name, 
        // image: matchItem.image 
      }
    });
  };

  const renderItem = ({ item }: { item: DisplayMatch }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => handleProfilePress(item)}
    >
      <Image source={{ uri: item.image }} style={[styles.image, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.statusContainer}>
        <View style={[
            styles.statusDot, 
            { backgroundColor: item.onlineStatus === 'online' ? '#27AE60' : item.onlineStatus === 'offline' ? '#E74C3C' : '#95A5A6' } // Grey for unknown
        ]} />
        <Text style={[
            styles.statusText, 
            { color: item.onlineStatus === 'online' ? '#27AE60' : item.onlineStatus === 'offline' ? '#E74C3C' : '#7F8C8D' }
        ]}>
            {item.onlineStatus.charAt(0).toUpperCase() + item.onlineStatus.slice(1)}
        </Text>
      </View>
      {/* You might want to show the matchStatus (PENDING, ACCEPTED) as well */}
      {/* <Text style={styles.matchInteractionStatus}>{item.matchStatus}</Text> */}
    </TouchableOpacity>
  );

  // const loadMoreMatches = () => {
  //   if (!isLoadingMore && hasMore) {
  //     const nextPage = currentPage + 1;
  //     setCurrentPage(nextPage);
  //     fetchMatches(nextPage);
  //   }
  // };


  if (isLoading && matches.length === 0) { // Show full screen loader only on initial load
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Finding your matches...</Text>
      </SafeAreaView>
    );
  }

  if (apiError && matches.length === 0) { // Show full screen error only if no data could be loaded
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={60} color="#888" />
        <Text style={styles.errorText}>{apiError}</Text>
        <TouchableOpacity onPress={()=> {
          router.push("/auth/login")
        }}>  
        <Text>Go to Login~</Text>

        </TouchableOpacity>
        <Button title="Try Again" onPress={() => fetchMatches()} color="#FF6F00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MatchesHeader />
      <Button
        title="Temp: Go to Onboarding Q31" // Changed title for clarity
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
            keyExtractor={(item) => item.id} // Using match.id as key
            numColumns={2}
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            // onEndReached={loadMoreMatches} // For pagination
            // onEndReachedThreshold={0.5}      // For pagination
            // ListFooterComponent={isLoadingMore ? <ActivityIndicator style={{ marginVertical: 20 }} size="small" color="#FF6F00" /> : null}
          />
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
  centered: { // For loading and error states
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
    borderRadius: 15, // Keep original image border radius
    backgroundColor: '#E0E0E0', // Placeholder background for image
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
    textAlign: 'center', // Center name if it wraps
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 10, // Slightly smaller dot
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13, // Slightly smaller status text
    fontWeight: '500',
  },
  // Optional style for match interaction status
  matchInteractionStatus: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  retryButton: { // Generic retry button
    marginTop: 20,
    backgroundColor: '#FF8F00', // Slightly different color for distinction
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