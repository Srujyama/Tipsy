import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {signIn, signUp, createUserProfile} from '../services/firebase';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {GoogleAuthProvider, OAuthProvider, signInWithCredential} from 'firebase/auth';
import {auth} from '../services/firebaseConfig';

GoogleSignin.configure({
  webClientId: '1036146163778-tjr27dib46ca0tt5eubmoofac7t0dgm0.apps.googleusercontent.com',
  iosClientId: '1036146163778-rv8408bgop2295jfekpsf7ei5il12o8b.apps.googleusercontent.com',
});

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [realName, setRealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('', 'Please fill in all fields');
      return;
    }
    if (isSignUp && (!username || !realName)) {
      Alert.alert('', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const cred = await signUp(email, password);
        await createUserProfile(cred.user.uid, {
          email,
          username,
          realName,
          age: 0,
          weight: 0,
          gender: 'Male',
        });
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      const msg = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.message?.replace(/Firebase: /, '') || 'Something went wrong';
      Alert.alert('', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const {identityToken, nonce, fullName, email} = response;
      if (!identityToken) throw new Error('Apple sign-in failed: no identity token');

      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({idToken: identityToken, rawNonce: nonce});
      const result = await signInWithCredential(auth, credential);

      if (result.user) {
        const {uid, email: appleEmail} = result.user;
        const display = [fullName?.givenName, fullName?.familyName].filter(Boolean).join(' ').trim();
        await createUserProfile(uid, {
          email: appleEmail || email || '',
          username: display ? display.toLowerCase().replace(/\s/g, '') : `user${uid.slice(0, 6)}`,
          realName: display || 'Tipsy User',
          age: 0,
          weight: 0,
          gender: 'Male',
        }).catch(() => {}); // ignore if already exists
      }
    } catch (error: any) {
      if (error.code !== appleAuth.Error.CANCELED && error.code !== '1001') {
        Alert.alert('', error.message || 'Apple sign-in failed');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('No ID token');
      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      // Create profile if new user
      if (result.user) {
        const {uid, email: gEmail, displayName} = result.user;
        await createUserProfile(uid, {
          email: gEmail || '',
          username: displayName?.toLowerCase().replace(/\s/g, '') || '',
          realName: displayName || '',
          age: 0,
          weight: 0,
          gender: 'Male',
        }).catch(() => {}); // ignore if already exists
      }
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') {
        Alert.alert('', error.message || 'Google sign-in failed');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <Text style={styles.logoMark}>T</Text>
          <Text style={styles.logoText}>TIPSY</Text>
          <Text style={styles.tagline}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        {isSignUp && (
          <>
            <Text style={styles.label}>USERNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="username"
              placeholderTextColor="#444"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Your name"
              placeholderTextColor="#444"
              value={realName}
              onChangeText={setRealName}
            />
          </>
        )}

        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="you@email.com"
          placeholderTextColor="#444"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Your password"
            placeholderTextColor="#444"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0a0a0f" />
          ) : (
            <Text style={styles.submitText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        {!isSignUp && (
          <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.appleButton} onPress={handleAppleSignIn}>
            <Text style={styles.appleLogo}></Text>
            <Text style={styles.appleText}>Continue with Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.switchLink}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoMark: {
    fontSize: 48,
    fontWeight: '200',
    color: '#c9a96e',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '300',
    color: '#f5f0eb',
    letterSpacing: 10,
  },
  tagline: {
    fontSize: 13,
    color: '#555',
    marginTop: 12,
    letterSpacing: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
    letterSpacing: 3,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e25',
    paddingVertical: 14,
    fontSize: 16,
    color: '#f5f0eb',
    fontWeight: '300',
    marginBottom: 24,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e25',
    marginBottom: 32,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: '#f5f0eb',
    fontWeight: '300',
  },
  eyeButton: {
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  eyeText: {
    fontSize: 10,
    color: '#555',
    letterSpacing: 2,
  },
  submitButton: {
    backgroundColor: '#c9a96e',
    borderRadius: 0,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitText: {
    color: '#0a0a0f',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
  },
  forgotText: {
    color: '#555',
    textAlign: 'center',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: '#1e1e25',
  },
  dividerText: {
    color: '#444',
    paddingHorizontal: 20,
    fontSize: 10,
    letterSpacing: 3,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f0eb',
    paddingVertical: 16,
    marginBottom: 10,
  },
  appleLogo: {
    fontSize: 18,
    marginRight: 10,
    color: '#0a0a0f',
    marginTop: -3,
  },
  appleText: {
    color: '#0a0a0f',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#1e1e25',
    paddingVertical: 16,
    marginBottom: 12,
  },
  googleG: {
    fontSize: 16,
    marginRight: 12,
    color: '#888',
    fontWeight: '300',
  },
  googleText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 1,
  },
  switchText: {
    color: '#555',
    textAlign: 'center',
    marginTop: 28,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  switchLink: {
    color: '#c9a96e',
    fontWeight: '500',
  },
});
