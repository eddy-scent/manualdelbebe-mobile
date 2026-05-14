import { StyleSheet, Text, View } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';

export default function PerfilHijo({ navigation }) {
  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil del Hijo</Text>
        <Text style={styles.subtitle}>Información y seguimiento del bebé</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcf9f3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1c1c18',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#574146',
    textAlign: 'center',
  },
});
