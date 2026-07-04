import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '../../constants/Colors';

const SECTIONS = [
  {
    title: 'Aceptación de los términos',
    body: 'Al usar Obol, aceptás estos Términos de Uso. Si no estás de acuerdo con alguno de ellos, no uses la aplicación. Nos reservamos el derecho de actualizar estos términos en cualquier momento.',
  },
  {
    title: 'Uso de la aplicación',
    body: 'Obol es una aplicación de educación financiera personal. Podés usarla para:\n• Aprender conceptos de economía y finanzas personales\n• Practicar con juegos y actividades interactivas\n• Seguir tu progreso de aprendizaje\n\nQueda prohibido usar Obol para actividades ilegales, compartir contenido ofensivo, o intentar vulnerar la seguridad de la aplicación.',
  },
  {
    title: 'Contenido educativo',
    body: 'El contenido de Obol tiene fines educativos únicamente. No constituye asesoramiento financiero, de inversión, legal ni fiscal. Siempre consultá con un profesional calificado antes de tomar decisiones financieras importantes.',
  },
  {
    title: 'Cuentas de usuario',
    body: 'Sos responsable de mantener la confidencialidad de tu contraseña y de todas las actividades realizadas con tu cuenta. Notificanos inmediatamente si sospechás acceso no autorizado a tu cuenta.',
  },
  {
    title: 'Propiedad intelectual',
    body: 'Todo el contenido de Obol —incluyendo textos, gráficos, logos, íconos y código— es propiedad de Obol o de sus proveedores de contenido y está protegido por leyes de propiedad intelectual. No podés reproducir ni distribuir este contenido sin autorización.',
  },
  {
    title: 'Limitación de responsabilidad',
    body: 'Obol se provee "tal como está" sin garantías de ningún tipo. No somos responsables por pérdidas económicas derivadas del uso de información contenida en la app, interrupciones del servicio, ni pérdida de datos.',
  },
  {
    title: 'Modificaciones al servicio',
    body: 'Podemos modificar, suspender o interrumpir el servicio en cualquier momento. También podemos actualizar, agregar o eliminar funciones sin previo aviso.',
  },
  {
    title: 'Ley aplicable',
    body: 'Estos términos se rigen por las leyes de la República Argentina. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de la Ciudad Autónoma de Buenos Aires.',
  },
];

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Términos de uso</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.lastUpdated}>Última actualización: julio 2025</Text>

        <View style={styles.introBanner}>
          <Text style={styles.introIcon}>📄</Text>
          <Text style={styles.introText}>
            Estos términos regulan el uso de la aplicación Obol. Leelos con atención antes de usar el servicio.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>¿Dudas sobre los términos?</Text>
          <Text style={styles.contactText}>
            Contactanos en{' '}
            <Text style={styles.contactEmail}>legal@obol.app</Text>
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
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
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
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  contactTitle: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 16, color: '#fff' },
  contactText: { fontFamily: 'Baloo2_400Regular', fontSize: 14, color: '#ffffffcc' },
  contactEmail: { fontFamily: 'Baloo2_700Bold', color: '#fff' },
});
