import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import colors from '../../config/colors';
import AppButton from '../Forms/AppButton';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';

const IsAuthWrapper = ({ navigation }) => {
  const { t } = useLanguage();
  return (
    <View style={styles.authPromptContainer}>
              <MaterialIcons name="lock-outline" size={48} color={colors.primary1} />
              <Text style={styles.authPromptTitle}>{t('Sign in Required')}</Text>
              <Text style={styles.authPromptText}>
                {t('Please sign in or create an account to add items to your cart')}
              </Text>
              <View style={styles.authButtonsContainer}>
                <AppButton 
                  title={t('Sign In')}
                  color="primary1"
                  textStyle={{ color: colors.white }}
                  buttonStyle={{ flex: 1, marginRight: 8 }}
                  onPress={() => navigation.navigate('Login')}
                />
                <AppButton 
                  title={t('Register')}
                  color="primary2"
                  textStyle={{ color: colors.black }}
                  buttonStyle={{ flex: 1, marginLeft: 8 }}
                  onPress={() => navigation.navigate('Register')}
                />
              </View>
            </View>
  )
}

export default IsAuthWrapper

const styles = StyleSheet.create({
    
  authPromptContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary3,
  },
  authPromptTitle: {
    fontSize: 20,
    fontFamily: 'Karla-Bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 14,
    fontFamily: 'Karla-Regular',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  authButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
  }
})