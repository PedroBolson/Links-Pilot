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

function TermsPt() {
  const { abuseEmail, city, stateFullName, productName, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Aceitação dos Termos">
        <p>Ao acessar ou utilizar o {productName} ("Serviço"), você ("Usuário") concorda integralmente com estes Termos de Uso e com a Política de Privacidade. Se não concordar, não utilize o Serviço.</p>
      </Section>

      <Section n={2} title="Sobre o Serviço">
        <p>O {productName} é uma plataforma de encurtamento de URLs com controle de expiração e rastreamento de cliques, operada por {controllerName} ("Controlador"), com sede em {city}/{LEGAL_CONFIG.state}, Brasil.</p>
      </Section>

      <Section n={3} title="Elegibilidade">
        <p>O uso do Serviço é permitido apenas a pessoas com 18 (dezoito) anos ou mais. Ao utilizar, você declara e garante ter essa idade.</p>
      </Section>

      <Section n={4} title="Usos Proibidos">
        <p>É expressamente vedado utilizar o Serviço para:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Phishing, spoofing ou qualquer outra forma de fraude eletrônica;</li>
          <li>Distribuição de malware, vírus, spyware, ransomware ou qualquer código malicioso;</li>
          <li>Conteúdo de exploração sexual infantil (crime previsto no Art. 241-A do ECA — Lei 8.069/1990);</li>
          <li>Incitação ao ódio, discriminação ou violência (Lei 7.716/1989);</li>
          <li>Estelionato ou qualquer conduta tipificada como crime pelo Código Penal Brasileiro;</li>
          <li>Spam ou envio em massa de comunicações não solicitadas;</li>
          <li>Divulgação de imagens íntimas sem consentimento (Art. 216-B do Código Penal);</li>
          <li>Violação de direitos autorais ou propriedade intelectual (Lei 9.610/1998);</li>
          <li>Qualquer uso que contrarie a legislação brasileira vigente.</li>
        </ul>
      </Section>

      <Section n={5} title="Responsabilidade do Usuário">
        <p>O Usuário é exclusivamente responsável pelos links que cria, pelo conteúdo para o qual eles apontam e pelas consequências do compartilhamento. O {productName} não monitora previamente os links criados.</p>
      </Section>

      <Section n={6} title="Limitação de Responsabilidade do Provedor">
        <p>Nos termos do Art. 19 da Lei 12.965/2014 (Marco Civil da Internet), o {productName} não responde civilmente por danos decorrentes de conteúdo gerado por terceiros, salvo nas hipóteses reconhecidas pelo Supremo Tribunal Federal no Tema 987 de Repercussão Geral (RE 1.037.396).</p>
        <p>O Serviço pode remover, bloquear ou desativar qualquer link que, a seu critério, viole estes Termos, sem necessidade de aviso prévio.</p>
      </Section>

      <Section n={7} title="Guarda de Registros de Acesso">
        <p>Em cumprimento ao Art. 15 da Lei 12.965/2014 (Marco Civil da Internet), o {productName} mantém registros de acesso às aplicações pelo prazo mínimo de 6 (seis) meses. Esses registros incluem data, hora, identificação do Usuário e endereço IP associado à criação de cada link, e serão disponibilizados mediante ordem judicial.</p>
      </Section>

      <Section n={8} title="Canal de Denúncia de Abuso">
        <p>
          Links maliciosos, fraudulentos, ilegais ou que violem estes Termos podem ser denunciados
          pelo e-mail{' '}
          <a
            href={`mailto:${abuseEmail}?subject=${encodeURIComponent(`[Abuso] ${productName}`)}`}
            className="text-primary underline underline-offset-2"
          >
            {abuseEmail}
          </a>{' '}
          com o assunto <strong>[Abuso] {productName}</strong>. Toda denúncia será analisada em até 72 horas úteis.
        </p>
      </Section>

      <Section n={9} title="Suspensão e Encerramento">
        <p>O {productName} pode suspender ou encerrar contas e remover links que violem estes Termos, a qualquer tempo e sem aviso prévio. Contas encerradas por violação não terão direito à restituição de qualquer benefício.</p>
      </Section>

      <Section n={10} title="Modificações dos Termos">
        <p>Estes Termos podem ser alterados a qualquer tempo. Alterações materiais serão comunicadas com antecedência mínima de 10 (dez) dias por e-mail ou aviso na plataforma. O uso continuado do Serviço após a comunicação implica aceitação das alterações.</p>
      </Section>

      <Section n={11} title="Lei Aplicável e Foro">
        <p>Este instrumento é regido pelas leis da República Federativa do Brasil, especialmente a Lei 12.965/2014 (Marco Civil da Internet) e a Lei 13.709/2018 (LGPD). Aplicam-se subsidiariamente as disposições do Código de Defesa do Consumidor (Lei 8.078/1990).</p>
        <p>Fica eleito o Foro da Comarca de {city}, Estado do {stateFullName}, como competente para dirimir quaisquer controvérsias, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
      </Section>
    </div>
  )
}

function TermsEn() {
  const { abuseEmail, city, stateFullName, productName, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Acceptance">
        <p>By accessing or using {productName} ("Service"), you ("User") fully agree to these Terms of Use and our Privacy Policy. If you do not agree, do not use the Service.</p>
      </Section>

      <Section n={2} title="About the Service">
        <p>{productName} is a URL shortening platform with expiration control and click tracking, operated by {controllerName} ("Controller"), based in {city}/{LEGAL_CONFIG.state}, Brazil.</p>
      </Section>

      <Section n={3} title="Eligibility">
        <p>Use of the Service is permitted only to persons aged 18 or older. By using the Service, you represent and warrant that you meet this requirement.</p>
      </Section>

      <Section n={4} title="Prohibited Uses">
        <p>You must not use the Service for:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Phishing, spoofing, or any form of electronic fraud;</li>
          <li>Distribution of malware, viruses, spyware, ransomware, or any malicious code;</li>
          <li>Child sexual abuse material (CSAM) — a crime under Brazilian law (ECA, Art. 241-A — Law 8.069/1990);</li>
          <li>Incitement to hatred, discrimination, or violence (Brazilian Law 7.716/1989);</li>
          <li>Fraud or any conduct classified as a crime under Brazilian law;</li>
          <li>Spam or bulk unsolicited communications;</li>
          <li>Sharing intimate images without consent (Brazilian Penal Code, Art. 216-B);</li>
          <li>Infringement of copyright or intellectual property rights (Law 9.610/1998);</li>
          <li>Any use that violates applicable Brazilian legislation.</li>
        </ul>
      </Section>

      <Section n={5} title="User Responsibility">
        <p>The User is solely responsible for the links created, the content they point to, and the consequences of sharing them. {productName} does not pre-screen link content.</p>
      </Section>

      <Section n={6} title="Limitation of Provider Liability">
        <p>Under Art. 19 of Law 12.965/2014 (Brazilian Internet Act — Marco Civil da Internet), {productName} is not civilly liable for damages arising from third-party content, except in cases recognized by the Brazilian Supreme Court (STF) in Precedent Theme 987 (RE 1.037.396).</p>
        <p>The Service may remove, block, or disable any link that, in its sole judgment, violates these Terms, without prior notice.</p>
      </Section>

      <Section n={7} title="Access Log Retention">
        <p>In compliance with Art. 15 of Law 12.965/2014, {productName} retains application access logs for a minimum of 6 (six) months. Records include date, time, user identification, and IP address associated with each link creation, and may be disclosed pursuant to a court order.</p>
      </Section>

      <Section n={8} title="Abuse Reporting">
        <p>
          Malicious, fraudulent, illegal, or Terms-violating links may be reported to{' '}
          <a
            href={`mailto:${abuseEmail}?subject=${encodeURIComponent(`[Abuse] ${productName}`)}`}
            className="text-primary underline underline-offset-2"
          >
            {abuseEmail}
          </a>{' '}
          with the subject line <strong>[Abuse] {productName}</strong>. All reports will be reviewed within 72 business hours.
        </p>
      </Section>

      <Section n={9} title="Suspension and Termination">
        <p>{productName} may suspend or terminate accounts and remove links that violate these Terms at any time and without prior notice. Accounts terminated for violations shall not be entitled to any refund or restitution.</p>
      </Section>

      <Section n={10} title="Modifications">
        <p>These Terms may be updated at any time. Material changes will be communicated at least 10 (ten) days in advance by email or platform notice. Continued use of the Service after notification constitutes acceptance of the changes.</p>
      </Section>

      <Section n={11} title="Governing Law and Jurisdiction">
        <p>This instrument is governed by the laws of the Federative Republic of Brazil, including Law 12.965/2014 (Marco Civil da Internet) and Law 13.709/2018 (LGPD — General Data Protection Law). The Brazilian Consumer Protection Code (Law 8.078/1990) applies subsidiarily.</p>
        <p>The courts of {city}, State of {stateFullName}, Brazil, shall have exclusive jurisdiction over any disputes, with express waiver of any other venue.</p>
      </Section>
    </div>
  )
}

function TermsEs() {
  const { abuseEmail, city, stateFullName, productName, controllerName } = LEGAL_CONFIG
  return (
    <div className="space-y-8">
      <Section n={1} title="Aceptación">
        <p>Al acceder o utilizar {productName} ("Servicio"), usted ("Usuario") acepta íntegramente estos Términos de Uso y nuestra Política de Privacidad. Si no está de acuerdo, no utilice el Servicio.</p>
      </Section>

      <Section n={2} title="Sobre el Servicio">
        <p>{productName} es una plataforma de acortamiento de URLs con control de expiración y seguimiento de clics, operada por {controllerName} ("Responsable"), con sede en {city}/{LEGAL_CONFIG.state}, Brasil.</p>
      </Section>

      <Section n={3} title="Elegibilidad">
        <p>El uso del Servicio está permitido únicamente a personas mayores de 18 años. Al utilizarlo, usted declara y garantiza tener esa edad.</p>
      </Section>

      <Section n={4} title="Usos Prohibidos">
        <p>Está expresamente prohibido utilizar el Servicio para:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Phishing, spoofing o cualquier forma de fraude electrónico;</li>
          <li>Distribución de malware, virus, spyware, ransomware o código malicioso;</li>
          <li>Contenido de explotación sexual infantil (delito previsto en el Art. 241-A del ECA — Ley 8.069/1990 de Brasil);</li>
          <li>Incitación al odio, discriminación o violencia (Ley 7.716/1989);</li>
          <li>Estafa o cualquier conducta tipificada como delito por la ley brasileña;</li>
          <li>Spam o envío masivo de comunicaciones no solicitadas;</li>
          <li>Difusión de imágenes íntimas sin consentimiento (Art. 216-B del Código Penal brasileño);</li>
          <li>Violación de derechos de autor o propiedad intelectual (Ley 9.610/1998);</li>
          <li>Cualquier uso que contravenga la legislación brasileña vigente.</li>
        </ul>
      </Section>

      <Section n={5} title="Responsabilidad del Usuario">
        <p>El Usuario es el único responsable de los enlaces que crea, el contenido al que apuntan y las consecuencias de compartirlos. {productName} no monitorea previamente el contenido de los enlaces.</p>
      </Section>

      <Section n={6} title="Limitación de Responsabilidad">
        <p>De conformidad con el Art. 19 de la Ley 12.965/2014 (Marco Civil da Internet de Brasil), {productName} no es responsable civilmente por daños derivados de contenido generado por terceros, salvo en los supuestos reconocidos por el Supremo Tribunal Federal en el Tema 987 (RE 1.037.396).</p>
        <p>El Servicio puede eliminar, bloquear o desactivar cualquier enlace que, a su criterio, viole estos Términos, sin previo aviso.</p>
      </Section>

      <Section n={7} title="Conservación de Registros">
        <p>En cumplimiento del Art. 15 de la Ley 12.965/2014, {productName} conserva registros de acceso a las aplicaciones por un mínimo de 6 (seis) meses. Dichos registros incluyen fecha, hora, identificación del Usuario y dirección IP, y se divulgarán mediante orden judicial.</p>
      </Section>

      <Section n={8} title="Canal de Denuncia de Abuso">
        <p>
          Los enlaces maliciosos, fraudulentos, ilegales o que violen estos Términos pueden ser denunciados al correo{' '}
          <a
            href={`mailto:${abuseEmail}?subject=${encodeURIComponent(`[Abuso] ${productName}`)}`}
            className="text-primary underline underline-offset-2"
          >
            {abuseEmail}
          </a>{' '}
          con el asunto <strong>[Abuso] {productName}</strong>. Toda denuncia será analizada en un plazo de 72 horas hábiles.
        </p>
      </Section>

      <Section n={9} title="Suspensión y Rescisión">
        <p>{productName} puede suspender o cancelar cuentas y eliminar enlaces que violen estos Términos en cualquier momento y sin previo aviso. Las cuentas canceladas por violación no tendrán derecho a restitución alguna.</p>
      </Section>

      <Section n={10} title="Modificaciones">
        <p>Estos Términos pueden ser modificados en cualquier momento. Los cambios materiales se comunicarán con al menos 10 (diez) días de antelación por correo o aviso en la plataforma. El uso continuado del Servicio tras la comunicación implica la aceptación de los cambios.</p>
      </Section>

      <Section n={11} title="Ley Aplicable y Jurisdicción">
        <p>Este instrumento se rige por las leyes de la República Federativa de Brasil, especialmente la Ley 12.965/2014 (Marco Civil da Internet) y la Ley 13.709/2018 (LGPD). El Código de Defensa del Consumidor de Brasil (Ley 8.078/1990) se aplica subsidiariamente.</p>
        <p>El Tribunal de la Comarca de {city}, Estado de {stateFullName}, Brasil, tendrá jurisdicción exclusiva para resolver cualquier controversia, con renuncia expresa a cualquier otro fuero.</p>
      </Section>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const CONTENT: Record<Lang, () => ReactNode> = {
  pt: TermsPt,
  en: TermsEn,
  es: TermsEs,
}

const LAST_UPDATED: Record<Lang, string> = {
  pt: LEGAL_CONFIG.lastUpdatedPt,
  en: LEGAL_CONFIG.lastUpdatedEn,
  es: LEGAL_CONFIG.lastUpdatedEs,
}

export default function TermsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = detectLang(i18n.language)
  const Content = CONTENT[lang]

  useEffect(() => {
    document.title = `${t('legal.termsOfUse')} – ${LEGAL_CONFIG.productName}`
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
          <h1 className="text-2xl font-semibold text-foreground">{t('legal.termsOfUse')}</h1>
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
