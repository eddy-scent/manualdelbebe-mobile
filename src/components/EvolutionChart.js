// ──────────────────────────────────────────────────────────
// Componente EvolutionChart — RF-07
// Gráfico de barras con límites máximos
// Muestra los últimos 7 días de datos biométricos
// ──────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getAllBiometricData } from '../services/biometricService';

const CHART_HEIGHT = 160;
const BAR_WIDTH = 22;

const MAX_VALUES = {
  peso: 120,
  suenio: 12,
  presion: 160,
};

export default function EvolutionChart() {
  const { colors, isDark } = useTheme();
  const [data, setData] = useState([]);
  const [metric, setMetric] = useState('peso');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const all = await getAllBiometricData();
    const last7 = all.slice(0, 7).reverse();
    setData(last7);
  };

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
          Registra tus datos biométricos para ver tu evolución aquí.
        </Text>
      </View>
    );
  }

  const getValues = () => {
    return data.map((d) => {
      if (metric === 'peso') return parseFloat(d.peso) || 0;
      if (metric === 'suenio') return parseFloat(d.horasSueno) || 0;
      if (metric === 'presion') return parseInt(d.presionSistolica) || 0;
      return 0;
    });
  };

  const getLabels = () => {
    return data.map((d) => {
      if (!d.date) return '';
      const parts = d.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
  };

  const values = getValues();
  const labels = getLabels();
  const maxVal = MAX_VALUES[metric];

  const getBarColor = () => {
    if (metric === 'peso') return colors.primary;
    if (metric === 'suenio') return colors.accent;
    return '#A78BFA';
  };

  const getUnit = () => {
    if (metric === 'peso') return 'kg';
    if (metric === 'suenio') return 'hs';
    return 'mmHg';
  };

  const metricButtons = [
    { key: 'peso', label: 'Peso' },
    { key: 'suenio', label: 'Sueño' },
    { key: 'presion', label: 'Presión' },
  ];

  const barColor = getBarColor();

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Text style={[styles.title, { color: colors.text }]}>Mi Evolución</Text>

      {/* Selector de métrica */}
      <View style={styles.metricRow}>
        {metricButtons.map((m) => {
          const isActive = metric === m.key;
          return (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.metricButton,
                {
                  backgroundColor: isActive ? colors.primaryBg : 'transparent',
                  borderColor: isActive ? colors.primary : colors.inputBorder,
                },
              ]}
              onPress={() => setMetric(m.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.metricButtonText, { color: isActive ? colors.primary : colors.textTertiary }]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Gráfico de barras */}
      <View style={styles.chartArea}>
        {/* Eje Y */}
        <View style={styles.yAxis}>
          <Text style={[styles.yLabel, { color: colors.textTertiary }]}>{maxVal}</Text>
          <Text style={[styles.yLabel, { color: colors.textTertiary }]}>{Math.round(maxVal * 0.75)}</Text>
          <Text style={[styles.yLabel, { color: colors.textTertiary }]}>{Math.round(maxVal * 0.5)}</Text>
          <Text style={[styles.yLabel, { color: colors.textTertiary }]}>{Math.round(maxVal * 0.25)}</Text>
          <Text style={[styles.yLabel, { color: colors.textTertiary }]}>0</Text>
        </View>

        {/* Barras */}
        <View style={styles.barsContainer}>
          {/* Líneas de grilla */}
          <View style={[styles.gridLine, { top: 0, borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
          <View style={[styles.gridLine, { top: '25%', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} />
          <View style={[styles.gridLine, { top: '50%', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]} />
          <View style={[styles.gridLine, { top: '75%', borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }]} />

          <View style={styles.barsRow}>
            {values.map((val, index) => {
              const clampedVal = Math.min(val, maxVal);
              const barHeight = (clampedVal / maxVal) * CHART_HEIGHT;
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    {val > 0 && (
                      <Text style={[styles.barValue, { color: colors.text }]}>
                        {val % 1 === 0 ? val : val.toFixed(1)}
                      </Text>
                    )}
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 4),
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textTertiary }]}>{labels[index]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <Text style={[styles.unitText, { color: colors.textTertiary }]}>
        Valores en {getUnit()} — máximo {maxVal} — últimos {data.length} registros
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  emptyContainer: {
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  metricButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  metricButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT + 30,
    marginBottom: 12,
  },
  yAxis: {
    width: 34,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
  },
  yLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderBottomWidth: 1,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    paddingHorizontal: 4,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: BAR_WIDTH,
    borderRadius: 8,
    minHeight: 4,
  },
  barValue: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 8,
  },
  unitText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
