// ──────────────────────────────────────────────────────────
// Formulario de creación/edición de eventos
// RF-10 (Crear), RF-11 (Actualizar)
// ──────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Stethoscope, Cake, Star, ClipboardList } from 'lucide-react-native';
import { formatDateInput, formatTimeInput, isValidDate, isValidTime } from '../utils/validators';
import { COLORS } from '../utils/constants';

const EVENT_TYPES = [
  { key: 'medical', label: 'Cita médica', icon: Stethoscope, color: COLORS.accent },
  { key: 'birthday', label: 'Cumpleaños', icon: Cake, color: COLORS.primary },
  { key: 'milestone', label: 'Hito importante', icon: Star, color: '#675b41' },
  { key: 'task', label: 'Tarea personal', icon: ClipboardList, color: '#807358' },
];

export default function EventForm({ visible, onClose, onSave, editingEvent }) {
  const isEditing = !!editingEvent;

  const [title, setTitle] = useState(editingEvent?.title || '');
  const [description, setDescription] = useState(editingEvent?.description || '');
  const [date, setDate] = useState(editingEvent?.date || '');
  const [time, setTime] = useState(editingEvent?.time || '');
  const [period, setPeriod] = useState(editingEvent?.period || 'AM');
  const [type, setType] = useState(editingEvent?.type || 'task');

  const handleSave = () => {
    if (!title.trim()) return;

    if (!isValidDate(date)) {
      Alert.alert('Fecha inválida', 'Por favor ingresa una fecha válida en formato DD/MM/AAAA.');
      return;
    }

    if (time && !isValidTime(time)) {
      Alert.alert('Hora inválida', 'Por favor ingresa una hora válida (de 00:00 a 23:59).');
      return;
    }

    const event = {
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      period: time ? period : '',
      type,
    };
    onSave(event, editingEvent?.id || null);
    handleClose();
  };

  const handleClose = () => {
    setTitle(editingEvent?.title || '');
    setDescription(editingEvent?.description || '');
    setDate(editingEvent?.date || '');
    setTime(editingEvent?.time || '');
    setPeriod(editingEvent?.period || 'AM');
    setType(editingEvent?.type || 'task');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{isEditing ? 'Editar evento' : 'Nuevo evento'}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X size={20} color="#574146" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Tipo de evento */}
              <Text style={styles.label}>Tipo de evento</Text>
              <View style={styles.typeGrid}>
                {EVENT_TYPES.map((t) => {
                  const IconComp = t.icon;
                  const isSelected = type === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[styles.typeButton, isSelected && { backgroundColor: t.color, borderColor: t.color }]}
                      onPress={() => setType(t.key)}
                      activeOpacity={0.7}
                    >
                      <IconComp size={18} color={isSelected ? '#ffffff' : t.color} />
                      <Text style={[styles.typeLabel, isSelected && { color: '#ffffff' }]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Título */}
              <Text style={styles.label}>Título *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ej: Control prenatal"
                placeholderTextColor="#8a7176"
                style={styles.input}
              />

              {/* Descripción */}
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Detalles opcionales..."
                placeholderTextColor="#8a7176"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
              />

              {/* Fecha */}
              <Text style={styles.label}>Fecha (DD/MM/AAAA)</Text>
              <TextInput
                value={date}
                onChangeText={(text) => setDate(formatDateInput(text))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#8a7176"
                style={styles.input}
                keyboardType="number-pad"
                maxLength={10}
              />

              {/* Hora */}
              <Text style={styles.label}>Hora (opcional)</Text>
              <View style={styles.timeRow}>
                <TextInput
                  value={time}
                  onChangeText={(text) => setTime(formatTimeInput(text))}
                  placeholder="Ej: 10:00"
                  placeholderTextColor="#8a7176"
                  style={[styles.input, styles.halfInput]}
                  keyboardType="number-pad"
                  maxLength={5}
                />
                <TouchableOpacity
                  style={[styles.periodButton, period === 'AM' && styles.periodButtonActive]}
                  onPress={() => setPeriod('AM')}
                >
                  <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>AM</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.periodButton, period === 'PM' && styles.periodButtonActive]}
                  onPress={() => setPeriod('PM')}
                >
                  <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>PM</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={!title.trim()}
              >
                <Text style={styles.saveButtonText}>{isEditing ? 'Guardar cambios' : 'Crear evento'}</Text>
              </TouchableOpacity>
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(128,115,88,0.2)',
    backgroundColor: '#ffffff',
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c1c18',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(128,115,88,0.2)',
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#574146',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});