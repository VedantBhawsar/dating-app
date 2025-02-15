import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import React, { useRef } from 'react';
import Swiper from 'react-native-deck-swiper';
import HomeHeader from '../../components/headers/HomeHeader';
import SwipeCard from '../../components/cards/SwiperCard';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const profiles = [
  {
    id: 1,
    name: 'Leanne Graham',
    image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Full-time Traveller. Globe Trotter. Occasional Photographer. Part-time Singer/Dancer.',
    match: 78,
  },
  {
    id: 2,
    name: 'Sarah Walker',
    image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Food Blogger & Adventure Enthusiast. Loves music and dance!',
    match: 85,
  },
  {
    id: 3,
    name: 'Leanne Graham',
    image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Full-time Traveller. Globe Trotter. Occasional Photographer. Part-time Singer/Dancer.',
    match: 78,
  },
  {
    id: 4,
    name: 'Sarah Walker',
    image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Food Blogger & Adventure Enthusiast. Loves music and dance!',
    match: 85,
  },
  {
    id: 5,
    name: 'Leanne Graham',
    image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Full-time Traveller. Globe Trotter. Occasional Photographer. Part-time Singer/Dancer.',
    match: 78,
  },
  {
    id: 6,
    name: 'Sarah Walker',
    image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Food Blogger & Adventure Enthusiast. Loves music and dance!',
    match: 85,
  },
  {
    id: 7,
    name: 'Leanne Graham',
    image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Full-time Traveller. Globe Trotter. Occasional Photographer. Part-time Singer/Dancer.',
    match: 78,
  },
  {
    id: 8,
    name: 'Sarah Walker',
    image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Food Blogger & Adventure Enthusiast. Loves music and dance!',
    match: 85,
  },
  {
    id: 9,
    name: 'Leanne Graham',
    image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Full-time Traveller. Globe Trotter. Occasional Photographer. Part-time Singer/Dancer.',
    match: 78,
  },
  {
    id: 10,
    name: 'Sarah Walker',
    image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    bio: 'Food Blogger & Adventure Enthusiast. Loves music and dance!',
    match: 85,
  },
];

const ExploreScreen = () => {
  const swiperRef = useRef(null);

  return (
    
    <SafeAreaView style={styles.container}>
           <StatusBar backgroundColor="white" barStyle="dark-content" />
      {/* Header */}
      <HomeHeader />

      {/* Swiper Card Container */}
      <View style={styles.swiperWrapper}>
        <Swiper
          ref={swiperRef}
          cards={profiles}
          renderCard={(card) => <SwipeCard profile={card} />}
          stackSize={3}
          verticalSwipe={false}
          backgroundColor="transparent"
          containerStyle={styles.swiperContainer}
        />
      </View>
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
  swiperContainer: {
    width: width * 0.9, // Adjusts width based on screen size
    height: height * 0.7, // Adjusts height dynamically
  },
});

export default ExploreScreen;
