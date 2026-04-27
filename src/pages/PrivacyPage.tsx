import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LEGAL_CONFIG } from '@/config/legal'
import { LegalFooter } from '@/components/shared/LegalFooter'

type Lang = 'pt' | 'en' | 'es'

function detectLang(lang: string): Lang {
  if (lang.startsWith('pt')) return 'pt'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">{n}. {title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

// ── Content per language ──────────────────────────────────────────────────────

function PrivacyPt() {
  const { contactEmail, city, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Controlador dos Dados">
        <p>{controllerName} · E-mail: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a> · {city}/{LEGAL_CONFIG.state}, Brasil.</p>
      </Section>

      <Section n={2} title="Dados Coletados, Finalidades e Bases Legais">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Dado pessoal</th>
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Finalidade</th>
                <th className="py-2 text-left font-semibold text-foreground">Base legal (LGPD Art. 7)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Nome e e-mail</td><td className="py-2 pr-3 align-top">Identificação, autenticação e comunicação</td><td className="py-2 align-top">Consentimento (inc. I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Foto de perfil</td><td className="py-2 pr-3 align-top">Exibição no painel do usuário</td><td className="py-2 align-top">Consentimento (inc. I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Endereço IP</td><td className="py-2 pr-3 align-top">Segurança e guarda obrigatória de registros (Marco Civil, Art. 15)</td><td className="py-2 align-top">Obrigação legal (inc. II)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Links criados</td><td className="py-2 pr-3 align-top">Prestação do Serviço contratado</td><td className="py-2 align-top">Execução de contrato (inc. V)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Dados de cliques</td><td className="py-2 pr-3 align-top">Estatísticas de uso e melhoria do Serviço</td><td className="py-2 align-top">Legítimo interesse (inc. IX)</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={3} title="Compartilhamento com Terceiros (Operadores)">
        <p>Os dados são processados pelo Google LLC (Firebase Authentication e Cloud Firestore) na qualidade de operador, nos termos de um contrato de processamento de dados adequado à LGPD. Não vendemos, cedemos ou comercializamos dados pessoais com terceiros para fins comerciais.</p>
      </Section>

      <Section n={4} title="Transferência Internacional de Dados">
        <p>Os dados são armazenados em servidores do Google LLC nos Estados Unidos da América. Essa transferência é realizada com amparo em cláusulas contratuais-padrão, conforme exigido pelo Art. 33, inciso II, da Lei 13.709/2018 (LGPD) e pela Resolução CD/ANPD nº 19/2024.</p>
      </Section>

      <Section n={5} title="Prazos de Retenção">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Dados de conta</strong> (nome, e-mail, foto): enquanto a conta estiver ativa, mais 90 dias após a exclusão.</li>
          <li><strong>Registros de acesso</strong> (IP e metadados): mínimo de 6 meses, conforme o Art. 15 da Lei 12.965/2014.</li>
          <li><strong>Links e dados de cliques</strong>: enquanto a conta estiver ativa.</li>
        </ul>
      </Section>

      <Section n={6} title="Direitos do Titular (LGPD, Art. 18)">
        <p>Você pode, a qualquer tempo, solicitar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirmação da existência de tratamento de seus dados;</li>
          <li>Acesso aos dados que mantemos sobre você;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Portabilidade dos dados a outro prestador de serviço;</li>
          <li>Eliminação dos dados tratados com base em seu consentimento;</li>
          <li>Informação sobre entidades com as quais compartilhamos dados;</li>
          <li>Revogação do consentimento.</li>
        </ul>
        <p>Para exercer qualquer desses direitos, entre em contato pelo e-mail <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>. Responderemos em até 15 (quinze) dias.</p>
      </Section>

      <Section n={7} title="Medidas de Segurança">
        <p>Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, nos termos do Art. 46 da LGPD: autenticação segura via Google OAuth, transmissão cifrada por HTTPS/TLS e controle de acesso por regras de segurança do Firestore.</p>
      </Section>

      <Section n={8} title="Comunicação de Incidentes de Segurança">
        <p>Em caso de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, o Controlador comunicará a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados em prazo razoável, conforme o Art. 48 da LGPD.</p>
      </Section>

      <Section n={9} title="Canal de Comunicação">
        <p>Para dúvidas, solicitações relativas aos seus dados ou reclamações: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>.</p>
        <p>Você também pode contatar a ANPD diretamente em: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">gov.br/anpd</a>.</p>
      </Section>

      <Section n={10} title="Atualizações desta Política">
        <p>Esta Política pode ser atualizada periodicamente. Alterações materiais serão comunicadas por e-mail ou aviso na plataforma antes de entrarem em vigor, conforme o Art. 9.º, § 2.º da LGPD.</p>
      </Section>
    </div>
  )
}

function PrivacyEn() {
  const { contactEmail, city, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Data Controller">
        <p>{controllerName} · Email: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a> · {city}/{LEGAL_CONFIG.state}, Brazil.</p>
      </Section>

      <Section n={2} title="Data Collected, Purposes and Legal Bases">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Personal data</th>
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Purpose</th>
                <th className="py-2 text-left font-semibold text-foreground">Legal basis (LGPD Art. 7)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Name and email</td><td className="py-2 pr-3 align-top">Identification, authentication and communication</td><td className="py-2 align-top">Consent (I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Profile photo</td><td className="py-2 pr-3 align-top">Display in user dashboard</td><td className="py-2 align-top">Consent (I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">IP address</td><td className="py-2 pr-3 align-top">Security and mandatory log retention (Marco Civil, Art. 15)</td><td className="py-2 align-top">Legal obligation (II)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Created links</td><td className="py-2 pr-3 align-top">Service provision</td><td className="py-2 align-top">Contract execution (V)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Click data</td><td className="py-2 pr-3 align-top">Usage statistics and service improvement</td><td className="py-2 align-top">Legitimate interest (IX)</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={3} title="Third-Party Sharing (Data Processors)">
        <p>Data is processed by Google LLC (Firebase Authentication and Cloud Firestore) as a data processor under a data processing agreement compatible with the LGPD. We do not sell or share personal data with third parties for commercial purposes.</p>
      </Section>

      <Section n={4} title="International Data Transfer">
        <p>Data is stored on Google LLC servers in the United States. This transfer is performed under standard contractual clauses, as required by Art. 33, II of Law 13.709/2018 (LGPD) and ANPD Resolution No. 19/2024.</p>
      </Section>

      <Section n={5} title="Data Retention">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Account data</strong> (name, email, photo): while the account is active, plus 90 days after deletion.</li>
          <li><strong>Access logs</strong> (IP and metadata): minimum 6 months, as required by Marco Civil Art. 15.</li>
          <li><strong>Links and click data</strong>: while the account is active.</li>
        </ul>
      </Section>

      <Section n={6} title="Your Rights (LGPD, Art. 18)">
        <p>You may at any time request:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirmation that your data is being processed;</li>
          <li>Access to the data we hold about you;</li>
          <li>Correction of incomplete or inaccurate data;</li>
          <li>Anonymization, blocking, or deletion of unnecessary data;</li>
          <li>Portability to another service provider;</li>
          <li>Deletion of data processed based on your consent;</li>
          <li>Information about third-party data sharing;</li>
          <li>Revocation of consent.</li>
        </ul>
        <p>To exercise these rights, contact: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>. We will respond within 15 (fifteen) business days.</p>
      </Section>

      <Section n={7} title="Security Measures">
        <p>We implement technical and administrative measures to protect your data from unauthorized access (LGPD, Art. 46): secure authentication via Google OAuth, encrypted transmission via HTTPS/TLS, and access control via Firestore security rules.</p>
      </Section>

      <Section n={8} title="Security Incidents">
        <p>In the event of a security breach that may pose a relevant risk to data subjects, the Controller will notify the ANPD and affected data subjects within a reasonable timeframe, as required by LGPD Art. 48.</p>
      </Section>

      <Section n={9} title="Contact">
        <p>For LGPD rights, questions, or complaints: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>.</p>
        <p>You may also contact the ANPD at: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">gov.br/anpd</a>.</p>
      </Section>

      <Section n={10} title="Policy Updates">
        <p>This Policy may be updated periodically. Material changes will be communicated by email or platform notice before taking effect, as required by LGPD Art. 9, §2.</p>
      </Section>
    </div>
  )
}

function PrivacyEs() {
  const { contactEmail, city, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Responsable del Tratamiento">
        <p>{controllerName} · Correo: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a> · {city}/{LEGAL_CONFIG.state}, Brasil.</p>
      </Section>

      <Section n={2} title="Datos Recopilados, Finalidades y Bases Legales">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Dato personal</th>
                <th className="py-2 pr-3 text-left font-semibold text-foreground">Finalidad</th>
                <th className="py-2 text-left font-semibold text-foreground">Base legal (LGPD Art. 7)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Nombre y correo</td><td className="py-2 pr-3 align-top">Identificación, autenticación y comunicación</td><td className="py-2 align-top">Consentimiento (I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Foto de perfil</td><td className="py-2 pr-3 align-top">Visualización en el panel del usuario</td><td className="py-2 align-top">Consentimiento (I)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Dirección IP</td><td className="py-2 pr-3 align-top">Seguridad y conservación obligatoria de registros (Marco Civil, Art. 15)</td><td className="py-2 align-top">Obligación legal (II)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Enlaces creados</td><td className="py-2 pr-3 align-top">Prestación del Servicio contratado</td><td className="py-2 align-top">Ejecución de contrato (V)</td></tr>
              <tr><td className="py-2 pr-3 align-top font-medium text-foreground">Datos de clics</td><td className="py-2 pr-3 align-top">Estadísticas de uso y mejora del Servicio</td><td className="py-2 align-top">Interés legítimo (IX)</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={3} title="Compartición con Terceros (Encargados del Tratamiento)">
        <p>Los datos son procesados por Google LLC (Firebase Authentication y Cloud Firestore) como encargado del tratamiento, mediante un acuerdo compatible con la LGPD. No vendemos ni compartimos datos personales con terceros con fines comerciales.</p>
      </Section>

      <Section n={4} title="Transferencia Internacional de Datos">
        <p>Los datos se almacenan en servidores de Google LLC en Estados Unidos. Esta transferencia se realiza mediante cláusulas contractuales estándar, conforme al Art. 33, II de la LGPD y la Resolución CD/ANPD nº 19/2024.</p>
      </Section>

      <Section n={5} title="Plazos de Retención">
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Datos de cuenta</strong> (nombre, correo, foto): mientras la cuenta esté activa, más 90 días tras su eliminación.</li>
          <li><strong>Registros de acceso</strong> (IP y metadatos): mínimo 6 meses, conforme al Art. 15 de la Ley 12.965/2014.</li>
          <li><strong>Enlaces y datos de clics</strong>: mientras la cuenta esté activa.</li>
        </ul>
      </Section>

      <Section n={6} title="Sus Derechos (LGPD, Art. 18)">
        <p>Puede solicitar en cualquier momento:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Confirmación de la existencia del tratamiento de sus datos;</li>
          <li>Acceso a los datos que conservamos sobre usted;</li>
          <li>Corrección de datos incompletos o inexactos;</li>
          <li>Anonimización, bloqueo o eliminación de datos innecesarios;</li>
          <li>Portabilidad a otro proveedor de servicios;</li>
          <li>Eliminación de datos tratados con base en su consentimiento;</li>
          <li>Información sobre terceros con quienes compartimos datos;</li>
          <li>Revocación del consentimiento.</li>
        </ul>
        <p>Para ejercer estos derechos, contacte: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>. Responderemos en 15 días hábiles.</p>
      </Section>

      <Section n={7} title="Medidas de Seguridad">
        <p>Adoptamos medidas técnicas y administrativas para proteger sus datos (LGPD, Art. 46): autenticación segura vía Google OAuth, transmisión cifrada por HTTPS/TLS y control de acceso mediante reglas de seguridad de Firestore.</p>
      </Section>

      <Section n={8} title="Incidentes de Seguridad">
        <p>En caso de violación que pueda causar riesgo relevante a los titulares, el Responsable notificará a la ANPD y a los titulares afectados en un plazo razonable (LGPD, Art. 48).</p>
      </Section>

      <Section n={9} title="Contacto">
        <p>Para derechos LGPD, dudas o reclamaciones: <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2">{contactEmail}</a>.</p>
        <p>También puede contactar a la ANPD en: <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">gov.br/anpd</a>.</p>
      </Section>

      <Section n={10} title="Actualizaciones de esta Política">
        <p>Esta Política puede actualizarse periódicamente. Los cambios materiales se comunicarán por correo o aviso en la plataforma antes de entrar en vigor (LGPD, Art. 9.º, § 2.º).</p>
      </Section>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CONTENT: Record<Lang, () => ReactNode> = {
  pt: PrivacyPt,
  en: PrivacyEn,
  es: PrivacyEs,
}

const LAST_UPDATED: Record<Lang, string> = {
  pt: LEGAL_CONFIG.lastUpdatedPt,
  en: LEGAL_CONFIG.lastUpdatedEn,
  es: LEGAL_CONFIG.lastUpdatedEs,
}

export default function PrivacyPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = detectLang(i18n.language)
  const Content = CONTENT[lang]

  useEffect(() => {
    document.title = `${t('legal.privacyPolicy')} – ${LEGAL_CONFIG.productName}`
  }, [t])

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-2xl font-semibold text-foreground">{t('legal.privacyPolicy')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('legal.lastUpdated')}: {LAST_UPDATED[lang]}
          </p>
        </header>

        <Content />
      </div>

      <footer className="border-t border-border py-8">
        <LegalFooter />
      </footer>
    </div>
  )
}
