import { View, StyleSheet, SafeAreaView, Dimensions, Text, ActivityIndicator, TouchableOpacity, Alert, Vibration } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Swiper from 'react-native-deck-swiper';
import HomeHeader from '../../components/headers/HomeHeader';
import SwipeCard from '../../components/cards/SwiperCard';
import { StatusBar } from 'react-native';
import { matchService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import MatchFoundModal from '../../components/modals/MatchFoundModal';
const { width, height } = Dimensions.get('window');


const transformMatchToProfile = (profile: any) => {
  return {
    id: profile.id,
    userId: profile.id,
    name: profile.displayName || 'No Name',
    image: profile.profilePicture || 'https://via.placeholder.com/400x600?text=No+Image',
    bio: profile.bio || ((profile.occupation || '') + ' ' + (profile.religion ? 'Religion: ' + profile.religion : '')).trim() || 'No bio available',
    match: profile.compatibility || Math.floor(Math.random() * 30) + 70, // Fallback to random score between 70-99 if not provided
    age: profile.age,
    location: profile.location ? 
      (profile.location.city || '') + 
      (profile.location.city && profile.location.state ? ', ' : '') + 
      (profile.location.state || '') + 
      (profile.location.country ? ', ' + profile.location.country : '') : 
      undefined,
    occupation: profile.occupation,
    education: profile.education
  };
};


type SwipeDirection = 'left' | 'right';

const ExploreScreen = () => {
  const swiperRef = useRef<any>(null);
  const [potentialMatches, setPotentialMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMoreMatches, setHasMoreMatches] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [chatRoomId, setChatRoomId] = useState<string | undefined>(undefined);
  const [swipeDirection, setSwipeDirection] = useState<SwipeDirection | null>(null);


  const fetchPotentialMatches = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (pageNum === 1) {
        setIsLoading(true);
      }
      
      setError('');
      const data = await matchService.getPotentialMatches(20, pageNum);
      console.log(data);
      
      const transformedMatches = data.map(transformMatchToProfile);
      
      if (transformedMatches.length === 3) {
        console.log('Only 3 potential matches remaining!');
        Alert.alert(
          'Almost Out of Matches',
          'You have only 3 potential matches remaining. Complete your profile to get more personalized matches!',
          [
            { text: 'OK', onPress: () => console.log('User acknowledged low matches') }
          ]
        );
      }
      
      if (refresh || pageNum === 1) {
        setPotentialMatches(transformedMatches);
      } else {
        setPotentialMatches(prev => [...prev, ...transformedMatches]);
      }
      
      setHasMoreMatches(data.pagination.hasNextPage);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.error || 'Failed to load matches. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPotentialMatches();
  }, []);

  const handleSwipeLeft = (cardIndex: number) => {
    console.log(`Swiped LEFT (REJECT) on card at index ${cardIndex}`);
    const match = potentialMatches[cardIndex];
    
    if (!match) {
      console.error('No match found at index', cardIndex);
      return;
    }
    
    console.log(`Rejecting match: ${match.name} (ID: ${match.id})`);

    if (match.userId) { 
      matchService.makeMatchDecision(match.id, 'REJECTED')
        .then(() => {
          console.log(`Successfully rejected match ${match.id}`);
        })
        .catch(err => {
          console.error(`Error rejecting match: ${err}`);
        });
    } else {
      console.error('Match has no userId:', match);
    }
    
    console.log(`Silently rejected profile: ${match.name}`);
  };

  const handleSwipeRight = (cardIndex: number) => {
    console.log(`Swiped RIGHT (ACCEPT) on card at index ${cardIndex}`);
    const match = potentialMatches[cardIndex];
    
    if (!match) {
      console.error('No match found at index', cardIndex);
      return;
    }
    
    // Debug info - show match name instead of the whole object
    console.log(`Accepting match: ${match.name} (ID: ${match.id})`);
    
    if (match.userId) {
      // Call API to express interest in this user
      console.log(`Calling expressInterest with userId: ${match.userId}`);
      
      matchService.expressInterest(match.userId)
        .then(response => {
          console.log(response)
          console.log(`Successfully expressed interest in ${match.name}`, response);
          
          // Check if it's a mutual match (both users liked each other)
          if (response && (response.status === 'ACCEPTED' || response.isMutualMatch)) {
            // It's a match! Show the match modal
            Vibration.vibrate([0, 100, 200, 100]); // Vibration pattern for match notification
            setMatchedUser({
              name: match.name,
              image: match.image
            });
            setChatRoomId(response.chatRoomId);
            setMatchModalVisible(true);
          }
        })
        .catch(err => {
          console.error(`Error expressing interest: ${JSON.stringify(err)}`);
          // For development, show an alert with the error
          Alert.alert(
            'Error',
            `Could not express interest in ${match.name}. Please try again later.`,
            [{ text: 'OK' }]
          );
        });
    }
  };

  // Load more matches when running out
  const handleAllCardsSwipedOut = () => {
    if (hasMoreMatches && !isLoading) {
      fetchPotentialMatches(page + 1);
    }
  };

  // Refresh matches
  const handleRefresh = () => {
    fetchPotentialMatches(1, true);
  };

  // Render loading state
  if (isLoading && potentialMatches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <HomeHeader onPress={() => {}} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Finding potential matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render error state
  if (error && potentialMatches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <HomeHeader onPress={fetchPotentialMatches} />
        <View style={styles.centerContent}>
          <Ionicons name="cloud-offline-outline" size={60} color="#FF6F00" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render empty state
  if (potentialMatches.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="white" barStyle="dark-content" />
        <HomeHeader onPress={fetchPotentialMatches} />
        <View style={styles.centerContent}>
          <Ionicons name="search-outline" size={60} color="#FF6F00" />
          <Text style={styles.emptyText}>No potential matches found</Text>
          <Text style={styles.emptySubText}>Try adjusting your preferences or check back later</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      
      {/* Header */}
      <HomeHeader onPress={fetchPotentialMatches} />

      {/* Loading overlay when refreshing */}
      {isRefreshing && (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator size="small" color="#FF6F00" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

      {/* Swiper Card Container */}
      <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        cards={potentialMatches}
        renderCard={(card, cardIndex) => {
          if (!card) return null;

          return (
            <View style={styles.cardWrapper}>
              {/* Card content */}
              <SwipeCard
                profile={card}
                onSwipeLeft={() => swiperRef.current?.swipeLeft()}
                onSwipeRight={() => swiperRef.current?.swipeRight()}
              />
            </View>
          );
        }}
        stackSize={3}
        verticalSwipe={false}
        backgroundColor="transparent"
        containerStyle={styles.swiperContainer}
        onSwipedLeft={handleSwipeLeft}
        onSwipedRight={handleSwipeRight}
        onSwipedAll={handleAllCardsSwipedOut}
        cardIndex={0}
        stackSeparation={14}
        animateOverlayLabelsOpacity
        animateCardOpacity
        swipeBackCard
        overlayLabels={{
          left: {
            title: 'NOPE',
            style: {
              label: {
                backgroundColor: '#FF5864',
                color: 'white',
                fontSize: 24,
                borderColor: '#FF5864',
                borderWidth: 1,
                padding: 10,
              },
              wrapper: {
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: '',
            style: {
              wrapper: {
                width: width * 0.4,
                height: height * 0.1,
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />
    </View>

      {/* Loading more indicator at bottom */}
      {isLoading && potentialMatches.length > 0 && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#FF6F00" />
          <Text style={styles.loadingMoreText}>Loading more matches...</Text>
        </View>
      )}

      {/* Match Found Modal */}
      {matchedUser && (
        <MatchFoundModal
          visible={matchModalVisible}
          onClose={() => setMatchModalVisible(false)}
          matchedUser={matchedUser}
          chatRoomId={chatRoomId}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  swiperWrapper: {
    flex: 1,
    marginTop: height * 0.02, // Responsive margin-top
    marginBottom: height * 0.1, // Space for bottom navigation
    alignItems: 'center',
  },

  cardWrapper: {
    position: 'relative',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 150,
    zIndex: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  swiperContainer: {
    width: width * 0.9, // Adjusts width based on screen size
    height: height * 0.7, // Adjusts height dynamically
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF5864',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  refreshOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  refreshText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  loadingMoreContainer: {
    position: 'absolute',
    bottom: height * 0.12,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default ExploreScreen;
