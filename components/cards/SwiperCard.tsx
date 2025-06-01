import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import React from 'react';
import { FontAwesome, MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window'); // 📲 Get Screen Size

interface ProfileProps {
  id: string;
  userId: string;
  name: string;
  image: string;
  bio: string;
  match: number;
  age?: number;
  location?: string;
  occupation?: string;
  education?: string;
}

interface SwipeCardProps {
  profile: ProfileProps;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SwipeCard = ({ profile, onSwipeLeft, onSwipeRight }: SwipeCardProps) => {
  if (!profile) return null; //  Prevents "profile is undefined" error

  return (
    <View style={styles.card}>
      {/* Profile Image */}
      <Image source={{ uri: profile.image }} style={styles.image} />

      {/* Match Percentage */}
      <View style={styles.matchBadge}>
        <FontAwesome name="heart" size={14} color="white" />
        <Text style={styles.matchText}>{profile.match}% Match!</Text>
      </View>

      {/* Profile Info Container */}
      <ScrollView style={styles.infoContainer} showsVerticalScrollIndicator={false}>
        {/* Name & Age */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{profile.name}</Text>
          {profile.age && <Text style={styles.age}>{profile.age}</Text>}
        </View>

        {/* Location */}
        {profile.location && (
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{profile.location}</Text>
          </View>
        )}

        {/* Occupation */}
        {profile.occupation && (
          <View style={styles.detailRow}>
            <FontAwesome5 name="briefcase" size={14} color="#666" />
            <Text style={styles.detailText}>{profile.occupation}</Text>
          </View>
        )}

        {/* Education */}
        {profile.education && (
          <View style={styles.detailRow}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{profile.education}</Text>
          </View>
        )}

        {/* Bio */}
        <Text style={styles.bioLabel}>About</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: '#FF5864' }]}
          onPress={onSwipeLeft}
          activeOpacity={0.7}
        >
          <FontAwesome6 name="heart-crack" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: '#6A0DAD' }]}
          onPress={onSwipeRight}
          activeOpacity={0.7}
        >
          <FontAwesome name="heart" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: width * 0.9, // 📲 Responsive width
    maxHeight: height * 0.75, // 🔥 Prevents overflow on smaller screens
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: height * 0.45, // 📲 Responsive image height (slightly smaller to fit more info)
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#6A0DAD',
    padding: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  matchText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  infoContainer: {
    width: '100%',
    paddingHorizontal: 15,
    paddingTop: 10,
    maxHeight: height * 0.25, // Limit the height to prevent overflow
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 5,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  age: {
    fontSize: 22,
    fontWeight: '400',
    color: '#444',
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 5,
    marginBottom: 10,
  },
  iconButton: {
    padding: 15,
    borderRadius: 50,
  },
});

export default SwipeCard;
