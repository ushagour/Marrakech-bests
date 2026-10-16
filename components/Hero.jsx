import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import colors from '../config/colors';
import { useLanguage } from '../context/LanguageContext';

const Hero = React.memo(({ children }) => {
  const { t } = useLanguage();
  return (
    <View style={styles.hero}>
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <View style={styles.heroText}>
          <Text style={styles.heroTitle}>Marrakech Bites</Text>
          <Text style={styles.heroSubtitle}>{t('Fast, fresh bites with Moroccan-inspired flavor.')}</Text>
        </View>
        <Image source={require('../assets/Hero.png')} style={styles.heroRightImage} />
      </View>
      
      {children}
    </View>   
  )
})

export default Hero

const styles = StyleSheet.create({



     hero: {
        height: 250,
        padding: 14,
        justifyContent: 'center',
        backgroundColor: colors.primary1,
    
    
      },
      heroTitle: { color: colors.primary2, fontSize: 28, fontFamily: 'MarkaziText-Regular' },
      heroSubtitle: { color: colors.white, marginTop: 2, fontSize: 18, lineHeight: 22, fontFamily: 'Karla-Regular' },
      search: {
        marginTop: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 9
      },
      heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.12)',
      },
      heroContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      heroText: { flex: 1, paddingRight: 12 },
      heroRightImage: { width: 120, height: 120, borderRadius: 12, opacity: 0.96 },
    
});