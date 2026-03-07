/**
 * Browser Push Notifications utility for Tipsy.
 * Uses the Notifications API (no external service needed for local notifications).
 * For friend alerts, we use Supabase Realtime + browser notifications.
 */

export function isPushSupported() {
  return 'Notification' in window
}

export async function requestPushPermission() {
  if (!isPushSupported()) return 'unsupported'
  const permission = await Notification.requestPermission()
  return permission // 'granted' | 'denied' | 'default'
}

export function getPushPermission() {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export function sendLocalNotification(title, options = {}) {
  if (!isPushSupported() || Notification.permission !== 'granted') return
  try {
    new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    })
  } catch (e) {
    console.warn('Notification failed:', e)
  }
}

export function sendFriendAlertNotification(friendName, message) {
  sendLocalNotification(`🚨 Alert: ${friendName}`, {
    body: message,
    tag: 'friend-alert',
    renotify: true,
  })
}

export function sendHydrationNotification() {
  sendLocalNotification('💧 Drink some water!', {
    body: 'Stay hydrated tonight — alternate drinks with water.',
    tag: 'hydration',
    renotify: false,
  })
}

export function sendBACWarningNotification(bac) {
  sendLocalNotification('⚠️ High BAC Warning', {
    body: `Your BAC is ${bac.toFixed(3)}. Slow down and plan a safe ride home.`,
    tag: 'bac-warning',
    renotify: true,
  })
}
