import AsyncStorage from '@react-native-async-storage/async-storage';
import {DrinkType} from './drinks';

const FAVORITES_KEY = '@tipsy_favorites';

export async function getFavorites(): Promise<DrinkType[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(type: DrinkType): Promise<DrinkType[]> {
  const favorites = await getFavorites();
  if (!favorites.includes(type)) {
    favorites.unshift(type);
    if (favorites.length > 6) favorites.pop();
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
  return favorites;
}

export async function removeFavorite(type: DrinkType): Promise<DrinkType[]> {
  let favorites = await getFavorites();
  favorites = favorites.filter(f => f !== type);
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export async function toggleFavorite(type: DrinkType): Promise<{favorites: DrinkType[]; added: boolean}> {
  const favorites = await getFavorites();
  if (favorites.includes(type)) {
    return {favorites: await removeFavorite(type), added: false};
  }
  return {favorites: await addFavorite(type), added: true};
}
