import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface LastCallTimerProps {
  drinksTonight: number;
}

export default function LastCallTimer({drinksTonight}: LastCallTimerProps) {
  const [targetTime, setTargetTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('');

  // Auto-suggest a last call time based on current time
  const suggestTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const target = new Date();
    if (hour < 22) {
      target.setHours(23, 30, 0, 0);
    } else if (hour < 24) {
      target.setHours(hour + 1, 30, 0, 0);
    } else {
      target.setHours(2, 0, 0, 0);
      target.setDate(target.getDate() + 1);
    }
    return target;
  };

  useEffect(() => {
    if (!targetTime) return;
    const interval = setInterval(() => {
      const diff = targetTime.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Last call!');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(hours > 0 ? `${hours}h ${mins}m` : `${mins}m ${secs}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  if (drinksTonight === 0) return null;

  if (!targetTime) {
    return (
      <TouchableOpacity style={s.container} onPress={() => setTargetTime(suggestTime())}>
        <Text style={s.icon}>⏰</Text>
        <View style={{flex: 1}}>
          <Text style={s.title}>Set a Last Call</Text>
          <Text style={s.subtitle}>Commit to a stopping time</Text>
        </View>
        <Text style={s.setBtn}>Set</Text>
      </TouchableOpacity>
    );
  }

  const isLastCall = timeLeft === 'Last call!';

  return (
    <View style={[s.container, isLastCall && s.containerAlert]}>
      <Text style={s.icon}>{isLastCall ? '🔔' : '⏰'}</Text>
      <View style={{flex: 1}}>
        <Text style={[s.title, isLastCall && {color: '#c9a96e'}]}>
          {isLastCall ? 'Last Call!' : 'Last Call In'}
        </Text>
        <Text style={s.subtitle}>
          {isLastCall
            ? 'Time to switch to water'
            : `${targetTime.toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`}
        </Text>
      </View>
      <Text style={[s.countdown, isLastCall && {color: '#c9a96e'}]}>{timeLeft}</Text>
      <TouchableOpacity onPress={() => setTargetTime(null)} style={s.clearBtn}>
        <Text style={s.clearText}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111116',
    borderRadius: 2,
    borderWidth: 0.5,
    borderColor: '#1a1a1f',
    padding: 14,
    marginBottom: 16,
  },
  containerAlert: {
    borderColor: '#c9a96e40',
  },
  icon: {fontSize: 20, marginRight: 12},
  title: {color: '#f5f0eb', fontSize: 13, fontWeight: '400'},
  subtitle: {color: '#555', fontSize: 11, marginTop: 1},
  setBtn: {color: '#c9a96e', fontSize: 12, letterSpacing: 1, fontWeight: '500'},
  countdown: {color: '#f5f0eb', fontSize: 20, fontWeight: '200', marginRight: 8},
  clearBtn: {padding: 4},
  clearText: {color: '#555', fontSize: 18},
});
