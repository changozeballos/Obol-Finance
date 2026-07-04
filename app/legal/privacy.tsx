import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/Colors';

const SECTIONS = [
  {
    title: '¿Qué información recopilamos?',
    body: 'Obol recopila únicamente la información que vos nos proporcionás: tu dirección de correo electrónico al registrarte y tu progreso de aprendizaje (lecciones completadas, XP, racha de días). No recopilamos datos de ubicación, contactos, ni ninguna información sensible.',
  },
  {
    title: '¿Cómo usamos tu información?',
    body: 'Usamos tu información exclusivamente para:\n• Guardar y sincronizar tu progreso de aprendizaje\n• Enviarte recordatorios de práctica diaria (solo si activás las notificaciones)\n• Mejorar la experiencia de la aplicación',
  },
  {
    title: '¿Compartimos tus datos?',
    body: 'No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales. Utilizamos Supabase como proveedor de base de datos, que almacena los datos en servidores seguros con encriptación en tránsito y en reposo.',
  },
  {
    title: 'Seguridad',
    body: 'Toda la comunicación entre la app y nuestros servidores está encriptada mediante HTTPS. Tu contraseña nunca se almacena en texto plano. Usamos autenticación segura provista por Supabase Auth.',
  },
  {
    title: 'Tus derechos',
    body: 'Tenés derecho a:\n• Acceder a los datos que tenemos sobre vos\n• Solicitar la eliminación de tu cuenta y todos tus datos\n• Exportar tu información\n\nPara ejercer cualquiera de estos derechos, contactanos en: privacidad@obol.app',
  },
  {
    title: 'Notificaciones',
    body: 'Las notificaciones son completamente opcionales. Podés activarlas o desactivarlas en cualquier momento desde la sección "Configuración" de la app. Si las desactivás, no recibirás ningún recordatorio.',
  },
  {
    title: 'Menores de edad',
    body: 'Obol está destinada a personas mayores de 13 años. Si sos menor de 13, necesitás el consentimiento de tus padres o tutores para usar la aplicación.',
  },
  {
    title: 'Cambios en esta política',
    body: 'Si realizamos cambios significativos en esta política, te notificaremos a través de la app. La versión más actualizada siempre estará disponible dentro de la aplicación.',
  },
];

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de privacidad</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Última actualización: julio 2025</Text>

        <View style={styles.introBanner}>
          <Text style={styles.introIcon}>🔒</Text>
          <Text style={styles.introText}>
            En Obol creemos que tu privacidad es fundamental. Esta política explica de forma clara qué datos recopilamos y cómo los usamos.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>¿Preguntas?</Text>
          <Text style={styles.contactText}>
            Contactanos en{' '}
            <Text style={styles.contactEmail}>privacidad@obol.app</Text>
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border,
    ...Shadows.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 18, color: Colors.text },
  scroll: { padding: 16, gap: 14 },
  lastUpdated: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  introBanner: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
  },
  introIcon: { fontSize: 28 },
  introText: {
    flex: 1,
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  sectionTitle: { fontFamily: 'Baloo2_700Bold', fontSize: 15, color: Colors.text },
  sectionBody: {
    fontFamily: 'Baloo2_400Regular',
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  contactBox: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  contactTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  contactText: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: '#ffffffcc' },
  contactEmail: { fontFamily: 'Baloo2_700Bold', color: '#fff' },
});
