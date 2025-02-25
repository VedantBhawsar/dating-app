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

      {/* Bigger Responsive SVG */}
      <View style={styles.svgContainer}>
        <Svg width={width} height={height * 0.5} viewBox="0 0 200 200">
          <Path
            d="M100 180 C30 110 -20 30 50 10 C110 00 100 70 100 70 C90 140 00 110 -90 170 M100 180 C190 110 220 50 160 20 C110 0 90 90 130 140 C150 170 170 180 200 190"
            stroke="#FF6F00"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="rotate(-18, 100, 100)"
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
    top: height * 0.05,
    left: width * 0.03, // Slightly shifted right
    width: width,
    alignItems: 'center',
  },  
  textContainer: { paddingHorizontal: 20, paddingBottom: 70 },
  title: { 
    fontSize: 44,  
    color: '#000', 
    marginBottom: 12, 
    textAlign: 'left',
    letterSpacing: -0.5, 
    lineHeight: 44, 
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
    elevation: 5, 
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
