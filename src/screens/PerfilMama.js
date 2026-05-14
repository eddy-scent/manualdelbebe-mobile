import { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, Settings, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenLayout from '../components/ScreenLayout';
import { useAuth } from '../context/AuthContext';
import { getTodayString } from '../services/dateService';
import { formatDDMMYYYY } from '../services/dateService';
import { saveBiometricData, getBiometricData } from '../services/biometricService';
import { analyzeBiometricData } from '../services/alertService';
import { COLORS, SINTOMAS_MATERNO, STORAGE_KEYS } from '../utils/constants';

const ICONO_MAMA = require('../../imagenes/icono.png');

export default function PerfilMama({ navigation }) {
  const { user } = useAuth();
  const [peso, setPeso] = useState('');
  const [horasSueno, setHorasSueno] = useState('');
  const [presionSistolica, setPresionSistolica] = useState('');
  const [presionDiastolica, setPresionDiastolica] = useState('');
  const [sintomas, setSintomas] = useState({});

  const today = new Date();
  const dateDisplay = `${today.getDate()} de ${formatDDMMYYYY(today).split('/')[1] ? getMonthName(today.getMonth()) : ''} de ${today.getFullYear()}`;

  function getMonthName(monthIndex) {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return meses[monthIndex] || '';
  }

  useEffect(() => {
    const loadToday = async () => {
      try {
        const data = await getBiometricData();
        if (data) {
          setPeso(data.peso ?? '');
          setHorasSueno(data.horasSueno ?? '');
          setPresionSistolica(data.presionSistolica ?? '');
          setPresionDiastolica(data.presionDiastolica ?? '');
          setSintomas(data.sintomas ?? {});
        }
      } catch (e) {
        console.error('Error loading biometric data', e);
      }
    };
    loadToday();
  }, []);

  const toggleSintoma = (nombre) => {
    setSintomas((prev) => ({ ...prev, [nombre]: !prev[nombre] }));
  };

  const handleSave = async () => {
    if (!peso.trim() || !horasSueno.trim() || !presionSistolica.trim() || !presionDiastolica.trim()) {
      Alert.alert('Campos obligatorios', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    const data = {
      date: getTodayString(),
      peso,
      horasSueno,
      presionSistolica,
      presionDiastolica,
      sintomas,
      savedAt: new Date().toISOString(),
    };

    // Guardar datos biométricos
    const result = await saveBiometricData(data);

    // Analizar alertas (RF-09)
    const alerts = analyzeBiometricData(data);
    if (alerts.length > 0) {
      const dangerAlerts = alerts.filter(a => a.severity === 'danger');
      if (dangerAlerts.length > 0) {
        Alert.alert(
          '⚠️ Atención importante',
          dangerAlerts.map(a => a.message).join('\n\n'),
          [{ text: 'Entendido' }]
        );
      } else {
        const warningMessages = alerts.map(a => `• ${a.title}`).join('\n');
        Alert.alert(
          'Recomendaciones',
          `Se detectaron las siguientes observaciones:\n\n${warningMessages}`,
          [{ text: 'Entendido' }]
        );
      }
    } else if (result.success) {
      Alert.alert('Guardado', 'Tus datos biométricos se guardaron correctamente.');
    }
  };

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topbar}>
          <Image source={ICONO_MAMA} style={styles.brandAvatar} />
          <Text style={styles.brandTitle}>Mi manual del bebé</Text>
          <View style={styles.topbarActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Bell size={18} color="#574146" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Configuracion')}
            >
              <Settings size={18} color="#574146" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.dateDisplay}>Hoy, {dateDisplay}</Text>

        {/* Peso */}
        <View style={styles.section}>
          <Text style={styles.label}>Peso materno (kg) *</Text>
          <TextInput
            value={peso}
            onChangeText={setPeso}
            placeholder="Ej: 68.5"
            placeholderTextColor="#8a7176"
            style={styles.input}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Horas de sueño */}
        <View style={styles.section}>
          <Text style={styles.label}>Horas de sueño *</Text>
          <TextInput
            value={horasSueno}
            onChangeText={setHorasSueno}
            placeholder="Ej: 7"
            placeholderTextColor="#8a7176"
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>

        {/* Presión arterial */}
        <View style={styles.section}>
          <Text style={styles.label}>Presión arterial (mmHg) *</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={presionSistolica}
              onChangeText={setPresionSistolica}
              placeholder="Sistólica"
              placeholderTextColor="#8a7176"
              style={[styles.input, styles.halfInput]}
              keyboardType="number-pad"
            />
            <Text style={styles.separator}>/</Text>
            <TextInput
              value={presionDiastolica}
              onChangeText={setPresionDiastolica}
              placeholder="Diastólica"
              placeholderTextColor="#8a7176"
              style={[styles.input, styles.halfInput]}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Síntomas */}
        <View style={styles.section}>
          <Text style={styles.label}>Síntomas</Text>
          <View style={styles.checkboxContainer}>
            {SINTOMAS_MATERNO.map((nombre, index) => {
              const isChecked = !!sintomas[nombre];
              const isLast = index === SINTOMAS_MATERNO.length - 1;
              return (
                <TouchableOpacity
                  key={nombre}
                  style={[styles.checkboxRow, !isLast && styles.checkboxRowBorder]}
                  onPress={() => toggleSintoma(nombre)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.checkboxLabel}>{nombre}</Text>
                  <View style={[styles.checkboxBox, isChecked && styles.checkboxBoxChecked]}>
                    {isChecked && <Check size={14} color="#ffffff" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveButtonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f1eee8',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  brandAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  brandTitle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '700',
    flex: 1,
    marginLeft: 12,
  },
  topbarActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 16,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplay: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: COLORS.cardBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    color: COLORS.text,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  separator: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  checkboxContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  checkboxRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.08)',
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    paddingRight: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});