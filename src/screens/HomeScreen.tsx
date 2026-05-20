import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {onTonightsDrinks, onUserProfileChange, onUserGroups, getLeaderboard, getDrinkHistory, getCurrentUser} from '../services/firebase';
import type {DrinkSession} from '../services/firebase';
import {DRINK_PRESETS, getSessionIntensity} from '../utils/drinks';
import {getDrinkPrice} from '../utils/prices';
import {getDrinkOfDay} from '../utils/drinkOfDay';
import {getGreeting, getInitials} from '../utils/helpers';
import SafeRidePrompt from '../components/SafeRidePrompt';
import WeeklyChart from '../components/WeeklyChart';
import {UserProfile, DrinkLog, Group} from '../types';

export default function HomeScreen({navigation}: any) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [drinks, setDrinks] = useState<DrinkLog[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [leaderboard, setLeaderboard] = useState<{user: UserProfile; drinkCount: number}[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<{sessions: number; totalDrinks: number; totalCals: number; totalSpent: number}>({sessions: 0, totalDrinks: 0, totalCals: 0, totalSpent: 0});
  const [monthlyInsight, setMonthlyInsight] = useState<{drinks: number; cals: number; spent: number; favDrink: string} | null>(null);
  const [weekHistory, setWeekHistory] = useState<DrinkSession[]>([]);
  const [soberDays, setSoberDays] = useState(0);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub1 = onUserProfileChange(user.uid, setProfile);
    const unsub2 = onTonightsDrinks(user.uid, setDrinks);
    const unsub3 = onUserGroups(user.uid, g => {
      setGroups(g);
      if (g.length > 0) {
        getLeaderboard(g[0].id, 'daily').then(setLeaderboard);
      }
    });
    // Load weekly stats and sober streak
    getDrinkHistory(user.uid, 30).then(history => {
      const weekHistory = history.filter(h => {
        const diff = (Date.now() - new Date(h.date + 'T12:00:00').getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      });
      setWeekHistory(weekHistory);
      const totalSpent = weekHistory.reduce((sum, h) =>
        sum + h.drinks.reduce((s, d) => s + getDrinkPrice(d.type), 0), 0);
      setWeeklyStats({
        sessions: weekHistory.length,
        totalDrinks: weekHistory.reduce((sum, h) => sum + h.drinkCount, 0),
        totalCals: weekHistory.reduce((sum, h) => sum + h.totalCalories, 0),
        totalSpent,
      });
      // Calculate sober streak (consecutive days without drinking, going back from yesterday)
      const drinkDates = new Set(history.map(h => h.date));
      let streak = 0;
      const d = new Date();
      d.setDate(d.getDate() - 1); // start from yesterday
      while (streak < 365) {
        const key = d.toISOString().split('T')[0];
        if (drinkDates.has(key)) break;
        streak++;
        d.setDate(d.getDate() - 1);
      }
      setSoberDays(streak);

      // Monthly insights
      const thisMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
      const monthSessions = history.filter(h => h.date.startsWith(thisMonth));
      if (monthSessions.length > 0) {
        const allDrinks = monthSessions.flatMap(h => h.drinks);
        const typeCounts: Record<string, number> = {};
        allDrinks.forEach(d => { typeCounts[d.type] = (typeCounts[d.type] || 0) + 1; });
        const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        setMonthlyInsight({
          drinks: allDrinks.length,
          cals: monthSessions.reduce((s, h) => s + h.totalCalories, 0),
          spent: allDrinks.reduce((s, d) => s + getDrinkPrice(d.type), 0),
          favDrink: topType ? topType[0] : '',
        });
      }
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [user]);

  const totalStandardDrinks = drinks.reduce((sum, d) => sum + d.standardDrinks, 0);
  const firstDrinkTime = drinks.length > 0 ? drinks[drinks.length - 1].timestamp : Date.now();
  const hoursSinceFirst = (Date.now() - firstDrinkTime) / (1000 * 60 * 60);
  const intensity = getSessionIntensity(totalStandardDrinks, hoursSinceFirst);
  const drinksPerHour = hoursSinceFirst > 0 ? drinks.length / hoursSinceFirst : drinks.length;

  const totalCalories = drinks.reduce((sum, d) => sum + d.calories, 0);

  const facts = [
    'Hydrate between drinks — your future self will thank you.',
    'Eat something before drinking to slow alcohol absorption by up to 50%.',
    'One standard drink per hour is a steady pace your liver can keep up with.',
    'A Long Island Iced Tea contains ~3 standard drinks — same as 3 beers.',
    'Dehydration makes hangovers worse — alcohol inhibits antidiuretic hormone (ADH).',
    'A Piña Colada has 490 calories — almost as much as a Big Mac (563 cal).',
    'Dark liquors (bourbon, red wine) have more congeners, which worsen hangovers.',
    'An IPA at 6.5% has 30% more alcohol than a light beer at 4.2%.',
    'The "beer before liquor" rule is a myth — total alcohol consumed matters, not order.',
    'Carbonated mixers (soda, sparkling) speed up alcohol absorption.',
    'Eating a full meal before drinking can cut peak intoxication roughly in half.',
    'A standard cocktail can pack 200–500 calories without the satiety of food.',
    'Light beer averages around 100 calories per 12 oz; craft IPAs can be 200+.',
    'Your liver processes about one standard drink per hour — pace matters.',
  ];
  const fact = facts[Math.floor(Date.now() / 3600000) % facts.length];

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, {paddingTop: insets.top + 16}]}>
      <Text style={s.greeting}>{getGreeting()}</Text>
      <Text style={s.username}>{profile?.username || 'User'}</Text>

      {/* Tonight Card */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardLabel}>TONIGHT</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Track')}>
            <Text style={s.linkText}>Track</Text>
          </TouchableOpacity>
        </View>
        <View style={s.tonightHero}>
          <Text style={s.tonightCount}>{drinks.length}</Text>
          <Text style={s.tonightCountLabel}>{drinks.length === 1 ? 'DRINK' : 'DRINKS'}</Text>
        </View>
        <View style={s.statusRow}>
          <View>
            <Text style={[s.statusLabel, {color: intensity.color}]}>{intensity.label}</Text>
            <Text style={s.statusSub}>
              {drinks.length === 0 ? 'Ready to go' : `${drinksPerHour.toFixed(1)} drinks/hr`}
            </Text>
          </View>
          {drinks.length > 0 && (
            <View style={s.drinkCountBox}>
              <Text style={s.drinkCountNum}>{totalStandardDrinks.toFixed(1)}</Text>
              <Text style={s.drinkCountLabel}>STD DRINKS</Text>
            </View>
          )}
        </View>
        {drinks.length > 0 && (
          <>
            <View style={s.miniDivider} />
            <View style={s.miniStatsRow}>
              <View style={s.miniStat}>
                <Text style={s.miniStatValue}>{totalCalories}</Text>
                <Text style={s.miniStatLabel}>cal</Text>
              </View>
              <View style={s.miniStat}>
                <Text style={s.miniStatValue}>{hoursSinceFirst.toFixed(1)}h</Text>
                <Text style={s.miniStatLabel}>session</Text>
              </View>
              <View style={s.miniStat}>
                <Text style={s.miniStatValue}>{drinksPerHour.toFixed(1)}</Text>
                <Text style={s.miniStatLabel}>per hour</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Safe Ride Prompt */}
      <SafeRidePrompt drinkCount={drinks.length} />

      {/* Sober Streak */}
      {soberDays > 0 && drinks.length === 0 && (
        <View style={s.streakCard}>
          <Text style={s.streakEmoji}>🏆</Text>
          <View style={{flex: 1}}>
            <Text style={s.streakTitle}>{soberDays} day sober streak</Text>
            <Text style={s.streakSub}>Keep it going!</Text>
          </View>
        </View>
      )}

      {/* Weekly Stats */}
      <View style={s.card}>
        <Text style={s.cardLabel}>THIS WEEK</Text>
        <View style={s.weekRow}>
          <View style={s.weekStat}>
            <Text style={s.weekValue}>{weeklyStats.totalDrinks}</Text>
            <Text style={s.weekLabel}>drinks</Text>
          </View>
          <View style={s.weekStatDivider} />
          <View style={s.weekStat}>
            <Text style={s.weekValue}>{weeklyStats.sessions}</Text>
            <Text style={s.weekLabel}>sessions</Text>
          </View>
          <View style={s.weekStatDivider} />
          <View style={s.weekStat}>
            <Text style={s.weekValue}>{weeklyStats.totalCals > 0 ? `${(weeklyStats.totalCals / 1000).toFixed(1)}k` : '0'}</Text>
            <Text style={s.weekLabel}>calories</Text>
          </View>
          <View style={s.weekStatDivider} />
          <View style={s.weekStat}>
            <Text style={s.weekValue}>${weeklyStats.totalSpent}</Text>
            <Text style={s.weekLabel}>spent</Text>
          </View>
        </View>
        <WeeklyChart history={weekHistory} />
      </View>

      {/* Monthly Insight */}
      {monthlyInsight && monthlyInsight.drinks > 0 && (
        <View style={s.card}>
          <Text style={s.cardLabel}>
            {new Date().toLocaleDateString('en-US', {month: 'long'}).toUpperCase()}
          </Text>
          <View style={[s.weekRow, {marginTop: 14}]}>
            <View style={s.weekStat}>
              <Text style={s.weekValue}>{monthlyInsight.drinks}</Text>
              <Text style={s.weekLabel}>drinks</Text>
            </View>
            <View style={s.weekStatDivider} />
            <View style={s.weekStat}>
              <Text style={s.weekValue}>{(monthlyInsight.cals / 1000).toFixed(1)}k</Text>
              <Text style={s.weekLabel}>calories</Text>
            </View>
            <View style={s.weekStatDivider} />
            <View style={s.weekStat}>
              <Text style={s.weekValue}>${monthlyInsight.spent}</Text>
              <Text style={s.weekLabel}>spent</Text>
            </View>
          </View>
          {monthlyInsight.favDrink && (
            <View style={s.favDrinkRow}>
              <Text style={s.favDrinkLabel}>Most ordered:</Text>
              <Text style={s.favDrinkValue}>
                {DRINK_PRESETS[monthlyInsight.favDrink as keyof typeof DRINK_PRESETS]?.emoji || '🍹'}{' '}
                {DRINK_PRESETS[monthlyInsight.favDrink as keyof typeof DRINK_PRESETS]?.label || monthlyInsight.favDrink}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Did You Know */}
      <View style={s.tipCard}>
        <View style={s.tipDot} />
        <Text style={s.tipText}>{fact}</Text>
      </View>

      {/* Drink of the Day */}
      {(() => {
        const dotd = getDrinkOfDay();
        return (
          <TouchableOpacity
            style={s.dotdCard}
            onPress={() => navigation.navigate('Track')}
            activeOpacity={0.7}>
            <View style={s.dotdHeader}>
              <Text style={s.cardLabel}>DRINK OF THE DAY</Text>
            </View>
            <View style={s.dotdContent}>
              <Text style={s.dotdEmoji}>{dotd.preset.emoji}</Text>
              <View style={{flex: 1}}>
                <Text style={s.dotdName}>{dotd.preset.label}</Text>
                <Text style={s.dotdReason}>{dotd.reason}</Text>
                <Text style={s.dotdMeta}>{dotd.preset.calories} cal · {dotd.preset.description}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })()}

      {/* Leaderboard */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardLabel}>LEADERBOARD</Text>
          {groups.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Leaderboard', {groupId: groups[0]?.id})}>
              <Text style={s.linkText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>
        {groups.length > 0 && leaderboard.length > 0 ? (
          <>
            <Text style={s.groupName}>{groups[0]?.name}</Text>
            {leaderboard.slice(0, 3).map((entry, index) => (
              <View key={entry.user.uid} style={s.leaderRow}>
                <Text style={[s.leaderRank, index === 0 && s.goldText]}>
                  {index + 1}
                </Text>
                <View style={[s.leaderAvatar, index === 0 && s.leaderAvatarFirst]}>
                  <Text style={s.leaderAvatarText}>
                    {getInitials(entry.user.username)}
                  </Text>
                </View>
                <View style={{flex: 1}}>
                  <Text style={s.leaderName}>@{entry.user.username}</Text>
                </View>
                <Text style={[s.leaderDrinks, index === 0 && s.goldText]}>
                  {entry.drinkCount}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <View style={s.emptyLeaderboard}>
            <Text style={s.emptyText}>Join a group to compete</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Social')}>
              <Text style={s.linkText}>Go to Social</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={s.disclaimer}>
        Tipsy is a tracking tool, not a sobriety meter.{'\n'}
        Never drive after drinking.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  content: {paddingHorizontal: 24, paddingBottom: 120},
  greeting: {fontSize: 11, color: '#555', letterSpacing: 3, textTransform: 'uppercase'},
  username: {fontSize: 26, fontWeight: '300', color: '#f5f0eb', letterSpacing: 1, marginTop: 4, marginBottom: 24},
  card: {backgroundColor: '#111116', borderRadius: 2, padding: 24, marginBottom: 16, borderWidth: 0.5, borderColor: '#1a1a1f'},
  cardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16},
  cardLabel: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 3},
  linkText: {color: '#c9a96e', fontSize: 12, letterSpacing: 1},
  tonightHero: {alignItems: 'center', marginVertical: 16},
  tonightCount: {color: '#c9a96e', fontSize: 64, fontWeight: '200', letterSpacing: 1},
  tonightCountLabel: {color: '#555', fontSize: 10, letterSpacing: 4, marginTop: 4},
  statusRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 0.5, borderTopColor: '#1a1a1f'},
  statusLabel: {color: '#f5f0eb', fontSize: 16, fontWeight: '300', letterSpacing: 0.5},
  statusSub: {color: '#555', fontSize: 13, marginTop: 2},
  drinkCountBox: {alignItems: 'flex-end'},
  drinkCountNum: {color: '#c9a96e', fontSize: 28, fontWeight: '200'},
  drinkCountLabel: {color: '#555', fontSize: 9, letterSpacing: 2},
  miniDivider: {height: 0.5, backgroundColor: '#1a1a1f', marginVertical: 14},
  miniStatsRow: {flexDirection: 'row', justifyContent: 'space-around'},
  miniStat: {alignItems: 'center'},
  miniStatValue: {color: '#f5f0eb', fontSize: 16, fontWeight: '200'},
  miniStatLabel: {color: '#555', fontSize: 9, letterSpacing: 1, marginTop: 2},
  streakCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#c9a96e20', padding: 18, marginBottom: 16},
  streakEmoji: {fontSize: 28, marginRight: 16},
  streakTitle: {color: '#c9a96e', fontSize: 16, fontWeight: '300'},
  streakSub: {color: '#555', fontSize: 12, marginTop: 2},
  weekRow: {flexDirection: 'row', alignItems: 'center', marginTop: 16},
  weekStat: {flex: 1, alignItems: 'center'},
  weekValue: {color: '#c9a96e', fontSize: 24, fontWeight: '200'},
  weekLabel: {color: '#555', fontSize: 9, letterSpacing: 1, marginTop: 4},
  weekStatDivider: {width: 0.5, height: 28, backgroundColor: '#1a1a1f'},
  tipCard: {flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 20, paddingHorizontal: 24, marginBottom: 16, borderLeftWidth: 1.5, borderLeftColor: '#c9a96e'},
  tipDot: {width: 4, height: 4, borderRadius: 2, backgroundColor: '#c9a96e', marginRight: 12, marginTop: 6},
  tipText: {color: '#666', fontSize: 13, flex: 1, fontStyle: 'italic', lineHeight: 20, fontWeight: '300'},
  groupName: {color: '#888', fontSize: 12, marginBottom: 16, letterSpacing: 1},
  leaderRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#1a1a1f'},
  leaderRank: {color: '#555', fontSize: 14, fontWeight: '300', width: 24},
  goldText: {color: '#c9a96e'},
  leaderAvatar: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a1a22', alignItems: 'center', justifyContent: 'center', marginRight: 12},
  leaderAvatarFirst: {borderWidth: 0.5, borderColor: '#c9a96e'},
  leaderAvatarText: {color: '#888', fontSize: 12, fontWeight: '500'},
  leaderName: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  leaderDrinks: {color: '#888', fontSize: 18, fontWeight: '200'},
  favDrinkRow: {flexDirection: 'row', alignItems: 'center', marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: '#1a1a1f'},
  favDrinkLabel: {color: '#555', fontSize: 11, marginRight: 8},
  favDrinkValue: {color: '#c9a96e', fontSize: 12, fontWeight: '300'},
  dotdCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#1a1a1f', padding: 20, marginBottom: 16},
  dotdHeader: {marginBottom: 14},
  dotdContent: {flexDirection: 'row', alignItems: 'center'},
  dotdEmoji: {fontSize: 36, marginRight: 16},
  dotdName: {color: '#f5f0eb', fontSize: 18, fontWeight: '300', marginBottom: 4},
  dotdReason: {color: '#888', fontSize: 12, fontWeight: '300', fontStyle: 'italic', marginBottom: 4},
  dotdMeta: {color: '#c9a96e', fontSize: 11, letterSpacing: 0.5},
  emptyLeaderboard: {alignItems: 'center', paddingVertical: 24, gap: 12},
  emptyText: {color: '#444', fontSize: 13, fontWeight: '300'},
  disclaimer: {textAlign: 'center', color: '#2a2a30', fontSize: 10, marginTop: 20, lineHeight: 16, letterSpacing: 0.5},
});
