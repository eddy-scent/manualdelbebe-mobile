import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import {
  formatDateInput,
  parseDDMMYYYY,
  addDays,
  formatDDMMYYYY,
  formatYYYYMMDD,
} from '../utils/dateUtils';
import { calendarService } from '../services/calendarService';

export default function CalculadoraEmbarazo({ visible, onClose }) {
  const [fur, setFur] = useState('');
  const [results, setResults] = useState(null);

  const handleDateChange = (text) => {
    setFur(formatDateInput(text));
  };

  const handleCalculate = () => {
    const furDate = parseDDMMYYYY(fur);
    if (!furDate) {
      Alert.alert('Fecha inválida', 'Por favor ingresa una fecha válida en formato DD/MM/AAAA.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fpp = addDays(furDate, 280);
    const diffTime = today.getTime() - furDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const semanasGestacion = Math.max(0, Math.floor(diffDays / 7));
    const diasRestantes = Math.ceil((fpp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let trimestre = 1;
    if (semanasGestacion > 24) {
      trimestre = 3;
    } else if (semanasGestacion > 12) {
      trimestre = 2;
    }

    setResults({
      fpp,
      semanasGestacion,
      diasRestantes,
      trimestre,
    });
  };

  const handleAddToCalendar = async () => {
    if (!results) return;
    try {
      await calendarService.addEvent({
        date: formatYYYYMMDD(results.fpp),
        time: 'All Day',
        period: '',
        type: 'medical',
        title: 'Fecha Probable de Parto',
      });
      Alert.alert('Éxito', 'La fecha probable de parto se agregó al calendario.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar la fecha al calendario.');
    }
  };

  const handleClose = () => {
    setFur('');
    setResults(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Calculadora de Embarazo</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={16} color="#574146" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Fecha de última regla (FUR)</Text>
              <TextInput
                value={fur}
                onChangeText={handleDateChange}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#8a7176"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={10}
              />

              <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate} activeOpacity={0.85}>
                <Text style={styles.calculateButtonText}>Calcular</Text>
              </TouchableOpacity>

              {results && (
                <View style={styles.resultsContainer}>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Fecha Probable de Parto (FPP)</Text>
                    <Text style={styles.resultValue}>{formatDDMMYYYY(results.fpp)}</Text>
                  </View>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Semanas de gestación actuales</Text>
                    <Text style={styles.resultValue}>{results.semanasGestacion} semanas</Text>
                  </View>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Días restantes hasta el parto</Text>
                    <Text style={styles.resultValue}>{results.diasRestantes} días</Text>
                  </View>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Trimestre actual</Text>
                    <Text style={styles.resultValue}>{results.trimestre}° Trimestre</Text>
                  </View>

                  <TouchableOpacity style={styles.addButton} onPress={handleAddToCalendar} activeOpacity={0.85}>
                    <Text style={styles.addButtonText}>Agregar al calendario</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fcf9f3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,115,88,0.12)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c18',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0eee8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    marginBottom: 8,
    marginLeft: 4,
    color: '#574146',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    borderColor: 'rgba(128,115,88,0.12)',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: '#1c1c18',
    fontSize: 16,
    marginBottom: 16,
  },
  calculateButton: {
    backgroundColor: '#EB5D8B',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#EB5D8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultsContainer: {
    gap: 12,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128,115,88,0.12)',
  },
  resultLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#574146',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c18',
  },
  addButton: {
    backgroundColor: '#6EC1E4',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6EC1E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
