import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

interface BACTimelineProps {
  currentBAC: number;
}

export default function BACTimeline({currentBAC}: BACTimelineProps) {
  if (currentBAC <= 0) return null;

  // Project BAC decrease over time (0.015 per hour)
  const points: {hour: number; bac: number; label: string}[] = [];
  const now = new Date();

  for (let h = 0; h <= 8; h += 0.5) {
    const projected = Math.max(0, currentBAC - 0.015 * h);
    const time = new Date(now.getTime() + h * 60 * 60 * 1000);
    const label = time.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'});
    points.push({hour: h, bac: projected, label});
    if (projected <= 0) break;
  }

  const maxBAC = Math.max(currentBAC, 0.08);
  const legalLimitY = (0.08 / maxBAC) * 100;

  return (
    <View style={s.container}>
      <Text style={s.title}>BAC PROJECTION</Text>
      <View style={s.chart}>
        {/* Legal limit line */}
        {currentBAC > 0.05 && (
          <View style={[s.legalLine, {bottom: `${legalLimitY}%`}]}>
            <Text style={s.legalLabel}>0.08 limit</Text>
          </View>
        )}

        {/* Bar chart */}
        <View style={s.barsRow}>
          {points.map((p, i) => {
            const height = (p.bac / maxBAC) * 100;
            const isOverLimit = p.bac >= 0.08;
            const isSober = p.bac <= 0;
            return (
              <View key={i} style={s.barColumn}>
                <View style={s.barWrapper}>
                  <View
                    style={[
                      s.bar,
                      {
                        height: `${Math.max(height, 2)}%`,
                        backgroundColor: isSober ? '#1a1a1f' : isOverLimit ? '#8b2020' : '#c9a96e',
                      },
                    ]}
                  />
                </View>
                <Text style={s.barLabel}>
                  {p.hour === 0 ? 'Now' : i === points.length - 1 ? '🎯' : ''}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Time markers */}
      <View style={s.timeRow}>
        <Text style={s.timeLabel}>Now</Text>
        <Text style={s.timeLabel}>Sober by {points[points.length - 1]?.label}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {marginTop: 4},
  title: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 2, marginBottom: 12},
  chart: {height: 80, position: 'relative'},
  legalLine: {position: 'absolute', left: 0, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 1},
  legalLabel: {color: '#8b2020', fontSize: 8, letterSpacing: 0.5, backgroundColor: '#111116', paddingRight: 4},
  barsRow: {flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 3},
  barColumn: {flex: 1, alignItems: 'center'},
  barWrapper: {width: '100%', height: 64, justifyContent: 'flex-end'},
  bar: {width: '100%', borderRadius: 1, minHeight: 1},
  barLabel: {fontSize: 8, color: '#555', marginTop: 4},
  timeRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
  timeLabel: {color: '#444', fontSize: 10, letterSpacing: 0.5},
});
