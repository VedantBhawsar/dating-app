import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const Intro = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {/* Enlarged Rotated Heart SVG */}
      <View style={styles.svgContainer}>
        <Svg width={350} height={350} viewBox="0 0 200 200">
          <Path
            d="M100 180 C30 110 -20 50 40 20 C80 0 140 40 100 100 C100 40 90 0 160 20 C220 50 170 110 100 180"
            stroke="#FF6F00"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-18, 100, 100)"  // Rotating left by 18 degrees
          />
        </Svg>
      </View>

      {/* Text Section */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>
          Embrace{'\n'}A New Way{'\n'}Of Dating
        </Text>
        <Text style={styles.subtitle}>
          We combine cutting-edge technologies with a modern approach to matchmaking.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/basic/Question1')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8F8', padding: 20, justifyContent: 'flex-end' },
  svgContainer: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.5 - 175,
  },
  textContainer: { paddingHorizontal: 20, paddingBottom: 70 },
  title: { 
    fontSize: 44,  
    color: '#000', 
    marginBottom: 12, 
    textAlign: 'left',
    letterSpacing: -0.5, 
    lineHeight: 44, // Adjust line spacing
  },  
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    lineHeight: 26,
    textAlign: 'left',
  },
  button: {
    backgroundColor: '#FF6F00',
    height: 55,
    width: 180,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5, // For Android shadow
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 20,
    marginRight: 8,
  },
  arrow: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  }
});

export default Intro;
