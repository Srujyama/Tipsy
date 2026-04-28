import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {onTonightsDrinks, onUserProfileChange, logDrink, logCustomDrink, removeDrink, getDrinkHistory, getCurrentUser} from '../services/firebase';
import type {DrinkSession} from '../services/firebase';
import {DRINK_PRESETS, DrinkType, getSessionIntensity} from '../utils/bac';
import {timeAgo} from '../utils/helpers';
import SafeRidePrompt from '../components/SafeRidePrompt';
import {getDrinkPrice} from '../utils/prices';
import {getFavorites, toggleFavorite} from '../utils/favorites';
import {getCalorieEquivalent, getExerciseEquivalent} from '../utils/calorieEquivalents';
import {shareSession} from '../utils/shareSession';
import {predictHangover} from '../utils/hangoverRisk';
import CustomDrinkModal from '../components/CustomDrinkModal';
import LastCallTimer from '../components/LastCallTimer';
import {getSmartRecommendation} from '../utils/smartRecommend';
import {getDrinkGoal, checkGoalStatus, DrinkGoal} from '../utils/drinkGoal';
import {UserProfile, DrinkLog} from '../types';

export default function TrackScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [drinks, setDrinks] = useState<DrinkLog[]>([]);
  const [history, setHistory] = useState<DrinkSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [favorites, setFavorites] = useState<DrinkType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [drinkGoal, setDrinkGoal] = useState<DrinkGoal>({maxDrinks: 0, maxCalories: 0, maxSpending: 0});
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) return;
    const unsub1 = onUserProfileChange(user.uid, setProfile);
    const unsub2 = onTonightsDrinks(user.uid, setDrinks);
    getDrinkHistory(user.uid, 30).then(setHistory);
    getFavorites().then(setFavorites);
    getDrinkGoal().then(setDrinkGoal);
    return () => { unsub1(); unsub2(); };
  }, [user]);

  const totalStandardDrinks = drinks.reduce((sum, d) => sum + d.standardDrinks, 0);
  const totalCalories = drinks.reduce((sum, d) => sum + d.calories, 0);
  const firstDrinkTime = drinks.length > 0 ? drinks[drinks.length - 1].timestamp : Date.now();
  const hoursSinceFirst = (Date.now() - firstDrinkTime) / (1000 * 60 * 60);
  const intensity = getSessionIntensity(totalStandardDrinks, hoursSinceFirst);
  const totalSpent = drinks.reduce((sum, d) => sum + getDrinkPrice(d.type), 0);

  const refreshHistory = () => {
    if (user) getDrinkHistory(user.uid, 30).then(setHistory);
  };

  const handleLogDrink = async (type: keyof typeof DRINK_PRESETS) => {
    if (!user) return;
    try {
      await logDrink(user.uid, type);
      refreshHistory();
    } catch (error: any) {
      Alert.alert('', error.message);
    }
  };

  const handleRemoveDrink = (drinkId: string, drinkName: string) => {
    Alert.alert('Remove Drink', `Remove this ${drinkName}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeDrink(drinkId);
          refreshHistory();
        },
      },
    ]);
  };

  const handleCustomDrink = async (drink: {name: string; oz: number; abv: number; calories: number}) => {
    if (!user) return;
    try {
      await logCustomDrink(user.uid, drink.name, drink.oz, drink.abv, drink.calories);
      refreshHistory();
    } catch (error: any) {
      Alert.alert('', error.message);
    }
  };

  // Pacing: drinks per hour
  const drinksPerHour = hoursSinceFirst > 0 ? drinks.length / hoursSinceFirst : drinks.length;
  const pacingStatus = drinks.length === 0 ? '' : drinksPerHour > 3 ? 'Fast' : drinksPerHour > 1.5 ? 'Moderate' : 'Steady';
  const pacingColor = drinksPerHour > 3 ? '#8b2020' : drinksPerHour > 1.5 ? '#c9a96e' : '#4a6';

  const handleToggleFavorite = async (type: DrinkType) => {
    const result = await toggleFavorite(type);
    setFavorites(result.favorites);
  };

  const categories = [
    {label: 'LIGHT BEER', types: ['light_beer', 'michelob_ultra'] as DrinkType[]},
    {label: 'BEER', types: ['beer', 'corona', 'blue_moon', 'tall_boy'] as DrinkType[]},
    {label: 'CRAFT', types: ['ipa', 'dipa', 'stout', 'sour'] as DrinkType[]},
    {label: 'SPIRITS', types: ['shot', 'double'] as DrinkType[]},
    {label: 'WINE', types: ['red_wine', 'white_wine', 'rose', 'champagne'] as DrinkType[]},
    {label: 'COCKTAILS', types: ['margarita', 'mojito', 'long_island', 'moscow_mule', 'old_fashioned', 'gin_tonic', 'rum_coke', 'whiskey_sour', 'cosmo', 'aperol_spritz', 'espresso_martini', 'negroni', 'daiquiri', 'pina_colada'] as DrinkType[]},
    {label: 'SELTZERS & OTHER', types: ['seltzer', 'hard_cider', 'sake'] as DrinkType[]},
  ];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'});
  };

  // Past history excludes today
  const todayStr = new Date().toISOString().split('T')[0];
  const pastHistory = history.filter(h => h.date !== todayStr);

  return (
    <ScrollView style={s.container} contentContainerStyle={[s.content, {paddingTop: insets.top + 16}]}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>TRACK</Text>
        <View style={s.liveRow}>
          <View style={s.liveDot} />
          <Text style={s.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Tonight Card */}
      <View style={s.card}>
        <View style={s.gaugeContainer}>
          <Text style={s.heroCount}>{drinks.length}</Text>
          <Text style={s.heroCountLabel}>{drinks.length === 1 ? 'DRINK' : 'DRINKS'} TONIGHT</Text>
          <Text style={[s.heroIntensity, {color: intensity.color}]}>{intensity.label}</Text>
        </View>

        <View style={s.divider} />

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>{totalStandardDrinks.toFixed(1)}</Text>
            <Text style={s.statLabel}>Std Drinks</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, {color: '#c9a96e'}]}>{totalCalories}</Text>
            <Text style={s.statLabel}>Calories</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, {color: '#c9a96e'}]}>${totalSpent}</Text>
            <Text style={s.statLabel}>Spent</Text>
          </View>
        </View>

        {totalCalories > 0 && (
          <>
            <View style={s.divider} />
            <View style={s.equivalentRow}>
              <Text style={s.equivalentText}>{getCalorieEquivalent(totalCalories)}</Text>
              <Text style={s.equivalentText}>{getExerciseEquivalent(totalCalories)}</Text>
            </View>
          </>
        )}
      </View>

      {/* Safe Ride */}
      <SafeRidePrompt drinkCount={drinks.length} />

      {/* Pacing Alert */}
      {pacingStatus === 'Fast' && (
        <View style={s.pacingAlert}>
          <Text style={s.pacingIcon}>⚡</Text>
          <View style={{flex: 1}}>
            <Text style={[s.pacingText, {color: pacingColor}]}>You're drinking fast</Text>
            <Text style={s.pacingSub}>{drinksPerHour.toFixed(1)} drinks/hr — consider slowing down</Text>
          </View>
        </View>
      )}

      {/* Goal Progress */}
      {drinkGoal.maxDrinks > 0 && drinks.length > 0 && (() => {
        const goalStatus = checkGoalStatus(drinkGoal, drinks.length, totalCalories, totalSpent);
        const pct = Math.min(100, (drinks.length / drinkGoal.maxDrinks) * 100);
        return (
          <View style={[s.goalCard, goalStatus.exceeded && s.goalCardExceeded]}>
            <View style={s.goalHeaderRow}>
              <Text style={s.goalLabel}>
                {goalStatus.exceeded ? '🛑' : '🎯'} {drinks.length}/{drinkGoal.maxDrinks} drinks
              </Text>
              <Text style={[s.goalPct, goalStatus.exceeded && {color: '#8b2020'}]}>{Math.round(pct)}%</Text>
            </View>
            <View style={s.goalBarBg}>
              <View style={[s.goalBarFill, {width: `${pct}%`}, goalStatus.exceeded && {backgroundColor: '#8b2020'}]} />
            </View>
            {goalStatus.warnings.map((w, i) => (
              <Text key={i} style={s.goalWarning}>{w}</Text>
            ))}
          </View>
        );
      })()}

      {/* Search + Custom */}
      <View style={s.searchRow}>
        <TextInput
          style={[s.searchInput, {flex: 1, marginBottom: 0}]}
          placeholder="Search drinks..."
          placeholderTextColor="#333"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity style={s.customBtn} onPress={() => setShowCustomModal(true)}>
          <Text style={s.customBtnText}>+ Custom</Text>
        </TouchableOpacity>
      </View>

      <CustomDrinkModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleCustomDrink}
      />

      {/* Smart Recommendation */}
      {(() => {
        const rec = getSmartRecommendation(totalCalories, drinks.length, drinksPerHour);
        if (!rec) return null;
        const preset = DRINK_PRESETS[rec.type];
        return (
          <TouchableOpacity
            style={s.recCard}
            onPress={() => handleLogDrink(rec.type)}
            activeOpacity={0.7}>
            <Text style={s.recEmoji}>{preset.emoji}</Text>
            <View style={{flex: 1}}>
              <Text style={s.recTitle}>Try: {preset.label}</Text>
              <Text style={s.recReason}>{rec.reason}</Text>
            </View>
            <Text style={s.recAdd}>+</Text>
          </TouchableOpacity>
        );
      })()}

      {/* Quick Favorites */}
      {favorites.length > 0 && (
        <View>
          <Text style={s.sectionLabel}>FAVORITES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.drinkScroll}
            contentContainerStyle={s.drinkScrollContent}>
            {favorites.map(type => {
              const preset = DRINK_PRESETS[type];
              if (!preset) return null;
              return (
                <TouchableOpacity
                  key={type}
                  style={[s.drinkButton, s.favButton]}
                  onPress={() => handleLogDrink(type)}
                  activeOpacity={0.6}>
                  <Text style={s.drinkEmoji}>{preset.emoji}</Text>
                  <Text style={s.drinkLabel}>{preset.label}</Text>
                  <Text style={s.drinkCal}>{preset.calories} cal</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* All Drinks */}
      {categories.map(cat => {
        const filtered = searchQuery
          ? cat.types.filter(t => DRINK_PRESETS[t].label.toLowerCase().includes(searchQuery.toLowerCase()))
          : cat.types;
        if (filtered.length === 0) return null;
        return (
        <View key={cat.label}>
          <Text style={s.sectionLabel}>{cat.label}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.drinkScroll}
            contentContainerStyle={s.drinkScrollContent}>
            {filtered.map(type => {
              const preset = DRINK_PRESETS[type];
              const isFav = favorites.includes(type);
              return (
                <TouchableOpacity
                  key={type}
                  style={[s.drinkButton, isFav && s.favHighlight]}
                  onPress={() => handleLogDrink(type)}
                  onLongPress={() => handleToggleFavorite(type)}
                  activeOpacity={0.6}>
                  {isFav && <Text style={s.favStar}>★</Text>}
                  <Text style={s.drinkEmoji}>{preset.emoji}</Text>
                  <Text style={s.drinkLabel}>{preset.label}</Text>
                  <Text style={s.drinkCal}>{preset.calories} cal</Text>
                  <Text style={s.drinkDetail}>{preset.description}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        );
      })}

      {/* Last Call Timer */}
      <LastCallTimer drinksTonight={drinks.length} />

      {/* Tonight's Log */}
      <View style={s.sectionHeader}>
        <Text style={s.sectionLabel}>TONIGHT</Text>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 14}}>
          <Text style={s.sectionCount}>{drinks.length} drinks · {totalCalories} cal</Text>
          {drinks.length > 0 && (
            <TouchableOpacity onPress={() => shareSession(drinks, totalCalories)}>
              <Text style={s.shareBtn}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {drinks.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>No drinks logged yet tonight</Text>
          <Text style={s.emptySub}>Tap a drink above to start tracking</Text>
        </View>
      ) : (
        <View style={s.listCard}>
          {drinks.map((drink, i) => {
            const preset = DRINK_PRESETS[drink.type as keyof typeof DRINK_PRESETS];
            return (
              <TouchableOpacity
                key={drink.id}
                style={[s.listItem, i > 0 && s.listItemBorder]}
                onLongPress={() => handleRemoveDrink(drink.id, drink.customName || preset?.label || drink.type)}
                activeOpacity={0.7}>
                <Text style={s.listEmoji}>{preset?.emoji || '🍹'}</Text>
                <View style={{flex: 1}}>
                  <Text style={s.listName}>{drink.customName || preset?.label || drink.type}</Text>
                  <Text style={s.listMeta}>{drink.customName ? `${drink.oz}oz · ${(drink.abv * 100).toFixed(0)}%` : preset?.description} · {timeAgo(drink.timestamp)}</Text>
                </View>
                <View style={s.listRight}>
                  <Text style={s.listCal}>{drink.calories}</Text>
                  <Text style={s.listCalLabel}>cal</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <Text style={s.longPressHint}>Long press to remove a drink</Text>
        </View>
      )}

      {/* Water Tracker */}
      <View style={[s.sectionHeader, {marginTop: 28}]}>
        <Text style={s.sectionLabel}>HYDRATION</Text>
      </View>
      <View style={s.waterCard}>
        <View style={s.waterRow}>
          <Text style={s.waterEmoji}>💧</Text>
          <View style={{flex: 1}}>
            <Text style={s.waterTitle}>{waterCount} glasses of water</Text>
            <Text style={s.waterSub}>
              {drinks.length > 0
                ? `Aim for ${Math.max(drinks.length, 1)} glasses (1 per drink)`
                : 'Stay hydrated tonight'}
            </Text>
          </View>
          <View style={s.waterButtons}>
            <TouchableOpacity
              style={s.waterBtn}
              onPress={() => setWaterCount(Math.max(0, waterCount - 1))}>
              <Text style={s.waterBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.waterBtn, s.waterBtnAdd]}
              onPress={() => setWaterCount(waterCount + 1)}>
              <Text style={[s.waterBtnText, {color: '#0a0a0f'}]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        {drinks.length > 0 && (
          <View style={s.waterProgress}>
            <View style={[s.waterProgressFill, {width: `${Math.min(100, (waterCount / Math.max(drinks.length, 1)) * 100)}%`}]} />
          </View>
        )}
      </View>

      {/* Hangover Prediction */}
      {drinks.length >= 2 && (() => {
        const prediction = predictHangover(drinks, waterCount, hoursSinceFirst);
        if (prediction.score === 0) return null;
        const riskColors = {low: '#4a6', moderate: '#c9a96e', high: '#b87333', severe: '#8b2020'};
        return (
          <View style={[s.hangoverCard, {borderColor: riskColors[prediction.risk] + '40'}]}>
            <View style={s.hangoverHeader}>
              <Text style={s.hangoverEmoji}>{prediction.emoji}</Text>
              <View style={{flex: 1}}>
                <Text style={[s.hangoverTitle, {color: riskColors[prediction.risk]}]}>
                  Hangover: {prediction.label}
                </Text>
                <View style={s.hangoverBarBg}>
                  <View style={[s.hangoverBarFill, {width: `${prediction.score}%`, backgroundColor: riskColors[prediction.risk]}]} />
                </View>
              </View>
              <Text style={[s.hangoverScore, {color: riskColors[prediction.risk]}]}>{prediction.score}</Text>
            </View>
            {prediction.tips.length > 0 && (
              <View style={s.hangoverTips}>
                {prediction.tips.slice(0, 3).map((tip, i) => (
                  <Text key={i} style={s.hangoverTip}>• {tip}</Text>
                ))}
              </View>
            )}
          </View>
        );
      })()}

      {/* Past Sessions */}
      <View style={[s.sectionHeader, {marginTop: 28}]}>
        <Text style={s.sectionLabel}>HISTORY</Text>
        {pastHistory.length > 0 && (
          <TouchableOpacity onPress={() => setShowHistory(!showHistory)}>
            <Text style={s.goldLink}>{showHistory ? 'Hide' : `${pastHistory.length} sessions`}</Text>
          </TouchableOpacity>
        )}
      </View>

      {pastHistory.length === 0 ? (
        <View style={s.emptyCard}>
          <Text style={s.emptyText}>No past sessions</Text>
          <Text style={s.emptySub}>Your drinking history will appear here</Text>
        </View>
      ) : !showHistory ? (
        // Show summary cards for last 3 sessions
        <View>
          {pastHistory.slice(0, 3).map(session => (
            <TouchableOpacity
              key={session.date}
              style={s.historyRow}
              onPress={() => setShowHistory(true)}>
              <View style={{flex: 1}}>
                <Text style={s.historyDate}>{formatDate(session.date)}</Text>
                <Text style={s.historyMeta}>
                  {session.drinkCount} drink{session.drinkCount !== 1 ? 's' : ''} · {session.totalCalories} cal
                </Text>
              </View>
              <View style={s.historyDrinkIcons}>
                {session.drinks.slice(0, 5).map((d, i) => (
                  <Text key={i} style={s.historyIcon}>
                    {DRINK_PRESETS[d.type as keyof typeof DRINK_PRESETS]?.emoji || '🍹'}
                  </Text>
                ))}
                {session.drinks.length > 5 && (
                  <Text style={s.historyMore}>+{session.drinks.length - 5}</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
          {pastHistory.length > 3 && (
            <TouchableOpacity onPress={() => setShowHistory(true)}>
              <Text style={[s.goldLink, {textAlign: 'center', marginTop: 12}]}>
                View all {pastHistory.length} sessions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        // Expanded history view
        <View>
          {pastHistory.map(session => (
            <View key={session.date} style={s.historyCard}>
              <View style={s.historyCardHeader}>
                <Text style={s.historyDate}>{formatDate(session.date)}</Text>
                <Text style={s.historyMeta}>
                  {session.drinkCount} drink{session.drinkCount !== 1 ? 's' : ''} · {session.totalCalories} cal
                </Text>
              </View>
              {session.drinks.map((drink, i) => {
                const preset = DRINK_PRESETS[drink.type as keyof typeof DRINK_PRESETS];
                return (
                  <View key={drink.id} style={[s.historyDrinkRow, i > 0 && s.listItemBorder]}>
                    <Text style={s.listEmoji}>{preset?.emoji || '🍹'}</Text>
                    <Text style={[s.listName, {flex: 1}]}>{preset?.label || drink.type}</Text>
                    <Text style={s.listMeta}>{drink.calories} cal</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      )}

      <Text style={s.disclaimer}>
        1 standard drink = 14g pure alcohol (0.6 oz){'\n'}
        Tipsy tracks drinks — it does not estimate sobriety.{'\n'}
        Never drive after drinking.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#0a0a0f'},
  content: {paddingHorizontal: 24, paddingBottom: 120},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20},
  title: {fontSize: 12, fontWeight: '400', color: '#f5f0eb', letterSpacing: 6},
  liveRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  liveDot: {width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#4a6'},
  liveText: {fontSize: 9, color: '#4a6', letterSpacing: 2, fontWeight: '500'},

  card: {backgroundColor: '#111116', borderRadius: 2, padding: 20, marginBottom: 28, borderWidth: 0.5, borderColor: '#1a1a1f'},
  gaugeContainer: {alignItems: 'center', paddingVertical: 16},
  heroCount: {color: '#c9a96e', fontSize: 64, fontWeight: '200', letterSpacing: 1},
  heroCountLabel: {color: '#555', fontSize: 10, letterSpacing: 4, marginTop: 4},
  heroIntensity: {fontSize: 13, fontWeight: '400', letterSpacing: 1, marginTop: 12},
  divider: {height: 0.5, backgroundColor: '#1a1a1f', marginVertical: 16},
  statsRow: {flexDirection: 'row', alignItems: 'center'},
  statItem: {flex: 1, alignItems: 'center'},
  statValue: {color: '#f5f0eb', fontSize: 20, fontWeight: '200', marginBottom: 4},
  statLabel: {color: '#555', fontSize: 10, letterSpacing: 1.5, fontWeight: '400'},
  statDivider: {width: 0.5, height: 32, backgroundColor: '#1a1a1f'},
  equivalentRow: {alignItems: 'center', gap: 4},
  equivalentText: {color: '#555', fontSize: 11, fontWeight: '300', letterSpacing: 0.3},
  scaleRow: {flexDirection: 'row', justifyContent: 'space-between'},
  scaleItem: {alignItems: 'center', gap: 5},
  scaleDot: {width: 5, height: 5, borderRadius: 2.5},
  scaleLabel: {color: '#444', fontSize: 9, letterSpacing: 0.5},

  pacingAlert: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#140a0a', borderRadius: 2, borderWidth: 0.5, borderColor: '#8b202040', padding: 14, marginBottom: 16},
  pacingIcon: {fontSize: 18, marginRight: 12},
  pacingText: {fontSize: 13, fontWeight: '400'},
  pacingSub: {color: '#555', fontSize: 11, marginTop: 2},

  goalCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#c9a96e20', padding: 16, marginBottom: 16},
  goalCardExceeded: {borderColor: '#8b202040'},
  goalHeaderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  goalLabel: {color: '#f5f0eb', fontSize: 13, fontWeight: '300'},
  goalPct: {color: '#c9a96e', fontSize: 14, fontWeight: '300'},
  goalBarBg: {height: 3, backgroundColor: '#1a1a1f', borderRadius: 2, overflow: 'hidden'},
  goalBarFill: {height: 3, backgroundColor: '#c9a96e', borderRadius: 2},
  goalWarning: {color: '#888', fontSize: 11, marginTop: 8, fontWeight: '300'},

  recCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#c9a96e20', padding: 14, marginBottom: 16},
  recEmoji: {fontSize: 24, marginRight: 12},
  recTitle: {color: '#c9a96e', fontSize: 13, fontWeight: '400'},
  recReason: {color: '#555', fontSize: 11, marginTop: 2},
  recAdd: {color: '#c9a96e', fontSize: 22, fontWeight: '200', paddingLeft: 12},

  searchRow: {flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 8},
  searchInput: {borderBottomWidth: 0.5, borderBottomColor: '#1e1e25', paddingVertical: 12, fontSize: 15, color: '#f5f0eb', fontWeight: '300', marginBottom: 8},
  customBtn: {borderWidth: 0.5, borderColor: '#c9a96e40', paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8},
  customBtnText: {color: '#c9a96e', fontSize: 11, fontWeight: '500', letterSpacing: 0.5},
  emptySearchText: {color: '#444', textAlign: 'center', paddingVertical: 32, fontSize: 13},
  sectionLabel: {fontSize: 10, fontWeight: '500', color: '#555', letterSpacing: 3, marginBottom: 10, marginTop: 20},
  sectionHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14},
  sectionCount: {color: '#444', fontSize: 11, letterSpacing: 0.5},
  goldLink: {color: '#c9a96e', fontSize: 11, letterSpacing: 1},
  shareBtn: {color: '#c9a96e', fontSize: 11, letterSpacing: 0.5, fontWeight: '500'},

  drinkScroll: {marginBottom: 4, marginHorizontal: -24},
  drinkScrollContent: {paddingHorizontal: 24, gap: 10},
  drinkButton: {width: 88, backgroundColor: '#111116', borderRadius: 2, paddingVertical: 16, paddingHorizontal: 6, alignItems: 'center', borderWidth: 0.5, borderColor: '#1a1a1f'},
  drinkEmoji: {fontSize: 22, marginBottom: 6},
  drinkLabel: {color: '#f5f0eb', fontSize: 10, fontWeight: '400', letterSpacing: 0.3, marginBottom: 2, textAlign: 'center'},
  drinkCal: {color: '#c9a96e', fontSize: 9, fontWeight: '400', marginBottom: 3},
  drinkDetail: {color: '#333', fontSize: 8, letterSpacing: 0.3, textAlign: 'center'},
  favButton: {borderColor: '#c9a96e30'},
  favHighlight: {borderColor: '#c9a96e40'},
  favStar: {position: 'absolute', top: 4, right: 6, color: '#c9a96e', fontSize: 8},

  emptyCard: {backgroundColor: '#111116', borderRadius: 2, paddingVertical: 40, paddingHorizontal: 24, alignItems: 'center', borderWidth: 0.5, borderColor: '#1a1a1f'},
  emptyText: {color: '#444', fontSize: 13, fontWeight: '300', letterSpacing: 0.5},
  emptySub: {color: '#2a2a30', fontSize: 12, marginTop: 6},

  listCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#1a1a1f', overflow: 'hidden'},
  listItem: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16},
  listItemBorder: {borderTopWidth: 0.5, borderTopColor: '#1a1a1f'},
  listEmoji: {fontSize: 18, marginRight: 14, width: 24},
  listName: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  listMeta: {color: '#444', fontSize: 11, marginTop: 2},
  listRight: {alignItems: 'flex-end'},
  listCal: {color: '#888', fontSize: 14, fontWeight: '200'},
  listCalLabel: {color: '#444', fontSize: 9, letterSpacing: 0.5},

  // History
  historyRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1f'},
  historyDate: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  historyMeta: {color: '#444', fontSize: 11, marginTop: 2},
  historyDrinkIcons: {flexDirection: 'row', gap: 2},
  historyIcon: {fontSize: 14},
  historyMore: {color: '#555', fontSize: 11, marginLeft: 4},
  historyCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#1a1a1f', marginBottom: 12, overflow: 'hidden'},
  historyCardHeader: {padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#1a1a1f'},
  historyDrinkRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16},

  longPressHint: {color: '#2a2a30', fontSize: 10, textAlign: 'center', paddingVertical: 10, letterSpacing: 0.5},

  waterCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#1a1a1f', padding: 18},
  waterRow: {flexDirection: 'row', alignItems: 'center'},
  waterEmoji: {fontSize: 22, marginRight: 14},
  waterTitle: {color: '#f5f0eb', fontSize: 14, fontWeight: '300'},
  waterSub: {color: '#444', fontSize: 11, marginTop: 2},
  waterButtons: {flexDirection: 'row', gap: 8},
  waterBtn: {width: 34, height: 34, borderRadius: 17, borderWidth: 0.5, borderColor: '#1e1e25', alignItems: 'center', justifyContent: 'center'},
  waterBtnAdd: {backgroundColor: '#c9a96e', borderColor: '#c9a96e'},
  waterBtnText: {color: '#888', fontSize: 18, fontWeight: '300', marginTop: -1},
  waterProgress: {height: 2, backgroundColor: '#1a1a1f', marginTop: 14, borderRadius: 1},
  waterProgressFill: {height: 2, backgroundColor: '#4a8a9a', borderRadius: 1},

  hangoverCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, padding: 18, marginBottom: 20},
  hangoverHeader: {flexDirection: 'row', alignItems: 'center'},
  hangoverEmoji: {fontSize: 28, marginRight: 14},
  hangoverTitle: {fontSize: 14, fontWeight: '400', marginBottom: 6},
  hangoverBarBg: {height: 3, backgroundColor: '#1a1a1f', borderRadius: 2, overflow: 'hidden'},
  hangoverBarFill: {height: 3, borderRadius: 2},
  hangoverScore: {fontSize: 24, fontWeight: '200', marginLeft: 14},
  hangoverTips: {marginTop: 14, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: '#1a1a1f'},
  hangoverTip: {color: '#555', fontSize: 11, lineHeight: 18, fontWeight: '300'},

  personalLimit: {backgroundColor: '#0e0e14', borderWidth: 0.5, borderColor: '#c9a96e30', borderRadius: 2, padding: 16, marginBottom: 16, alignItems: 'center'},
  personalLimitTitle: {color: '#c9a96e', fontSize: 10, letterSpacing: 2, marginBottom: 6},
  personalLimitValue: {color: '#f5f0eb', fontSize: 22, fontWeight: '200', marginBottom: 4},
  personalLimitSub: {color: '#555', fontSize: 11},
  refCard: {backgroundColor: '#111116', borderRadius: 2, borderWidth: 0.5, borderColor: '#1a1a1f', padding: 20, marginBottom: 8},
  refTitle: {color: '#f5f0eb', fontSize: 14, fontWeight: '300', marginBottom: 4},
  refSubtitle: {color: '#444', fontSize: 11, marginBottom: 16},
  refRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 10},
  refWeight: {color: '#888', fontSize: 12, width: 70, fontWeight: '400'},
  refValue: {color: '#f5f0eb', fontSize: 12, fontWeight: '300', flex: 1, textAlign: 'center'},
  refNote: {color: '#333', fontSize: 10, lineHeight: 16, marginTop: 14, letterSpacing: 0.3},

  disclaimer: {textAlign: 'center', color: '#2a2a30', fontSize: 10, marginTop: 28, lineHeight: 16, letterSpacing: 0.5},
});
