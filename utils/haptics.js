import * as Haptics from 'expo-haptics';

const safe = (fn) => () => {
  try {
    fn();
  } catch {
    // Haptics are unavailable on some devices/simulators.
  }
};

export const hapticLight = safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const hapticSuccess = safe(() =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
);
export const hapticWarning = safe(() =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
);
