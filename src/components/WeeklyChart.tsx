import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {DrinkSession} from '../services/firebase';

interface WeeklyChartProps {
  history: DrinkSession[];
}

export default function WeeklyChart({history}: WeeklyChartProps) {
  // Build last 7 days
  const days: {label: string; date: string; count: number; cals: number}[] = [];
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const session = history.find(h => h.date === dateStr);
    days.push({
      label: dayLabels[d.getDay()],
      date: dateStr,
      count: session?.drinkCount || 0,
      cals: session?.totalCalories || 0,
    });
  }

  const maxCount = Math.max(...days.map(d => d.count), 1);
  const isToday = (dateStr: string) => dateStr === new Date().toISOString().split('T')[0];

  return (
    <View style={s.container}>
      <View style={s.barsRow}>
        {days.map((day, i) => {
          const height = (day.count / maxCount) * 48;
          return (
            <View key={i} style={s.barCol}>
              <View style={s.barWrap}>
                {day.count > 0 && (
                  <Text style={s.barCount}>{day.count}</Text>
                )}
                <View
                  style={[
                    s.bar,
                    {
                      height: Math.max(height, day.count > 0 ? 4 : 1),
                      backgroundColor: day.count === 0
                        ? '#1a1a1f'
                        : isToday(day.date)
                        ? '#c9a96e'
                        : '#333',
                    },
                  ]}
                />
              </View>
              <Text style={[s.dayLabel, isToday(day.date) && s.dayLabelActive]}>
                {day.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {marginTop: 14},
  barsRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 6},
  barCol: {flex: 1, alignItems: 'center'},
  barWrap: {height: 64, justifyContent: 'flex-end', alignItems: 'center', width: '100%'},
  barCount: {color: '#888', fontSize: 9, marginBottom: 3},
  bar: {width: '70%', borderRadius: 1},
  dayLabel: {color: '#444', fontSize: 9, marginTop: 6, fontWeight: '500'},
  dayLabelActive: {color: '#c9a96e'},
});
