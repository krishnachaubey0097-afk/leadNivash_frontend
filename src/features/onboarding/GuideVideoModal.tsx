import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Globe,
  Sparkles,
  Building2,
  Users,
  Calculator,
  Compass,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../auth/AuthProvider';

export type GuideLanguageCode = 'en' | 'hi' | 'pa' | 'ta' | 'mr';

interface GuideChapter {
  id: string;
  durationSec: number;
  icon: React.ComponentType<{ className?: string }>;
  highlightBadge: string;
  screenLabel: string;
}

interface LocalizedChapterContent {
  title: string;
  subtitle: string;
  narration: string;
  bullets: string[];
}

interface LanguagePack {
  code: GuideLanguageCode;
  label: string;
  nativeLabel: string;
  speechLocale: string;
  modalTitle: string;
  modalSub: string;
  chapters: Record<string, LocalizedChapterContent>;
}

const GUIDE_CHAPTERS: GuideChapter[] = [
  {
    id: 'quick-chat',
    durationSec: 12,
    icon: Sparkles,
    highlightBadge: 'Step 01 · AI Parser',
    screenLabel: 'Quick Chat → Paste · Buyer/Seller · Best Match',
  },
  {
    id: 'matching',
    durationSec: 12,
    icon: Users,
    highlightBadge: 'Step 02 · Magic Match',
    screenLabel: 'Ranked Properties & Buyers + Send Count',
  },
  {
    id: 'inventory',
    durationSec: 11,
    icon: Building2,
    highlightBadge: 'Step 03 · Owner Vault',
    screenLabel: 'Properties · Masked WhatsApp Flyers',
  },
  {
    id: 'tools',
    durationSec: 11,
    icon: Calculator,
    highlightBadge: 'Step 04 · All-India Tools',
    screenLabel: '28 States + 8 UTs Stamp Duty & EMI',
  },
];

const LANGUAGE_PACKS: Record<GuideLanguageCode, LanguagePack> = {
  en: {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    speechLocale: 'en-IN',
    modalTitle: 'LeadNivash Platform Video Guide',
    modalSub: 'Watch in 5 core Indian languages with audio narration & captions',
    chapters: {
      'quick-chat': {
        title: 'Paste WhatsApp Messages in 1 Click',
        subtitle: 'Turn raw Hindi, Hinglish, or English group chats into structured records.',
        narration:
          'Welcome to LeadNivash! Step one: open Quick Chat and paste any WhatsApp property or client message. Even rough notes move straight to Review where you choose Buyer or Seller.',
        bullets: [
          'Paste or speak message cleanly inside Quick Chat',
          'Select Buyer or Seller (mandatory) and verify budget & size',
          'Click Next to auto-save directly to your broker database',
        ],
      },
      matching: {
        title: 'Instant Ranked Matches & Best One Badge',
        subtitle: 'Spot top properties or buyers ranked by budget, area, and locality.',
        narration:
          'Step two: the Magic Moment. LeadNivash ranks matching Seller Properties for Buyers, or Buyers for your Property, highlights the Best Match at the top, and tracks how many clients received it.',
        bullets: [
          'Top property/buyer automatically highlighted as Best Match',
          'See exact sent count on every property before pitching',
          'Send directly on WhatsApp, Copy pitch, or Save deal in 1 tap',
        ],
      },
      inventory: {
        title: 'Owner Vault & Privacy-Safe Flyers',
        subtitle: 'Share professional property brochures without leaking owner numbers.',
        narration:
          'Step three: store properties with private Owner Vault protection. Generate branded WhatsApp flyers showing your agency details while keeping direct owner contacts hidden.',
        bullets: [
          'Owner phone stays encrypted in your private vault',
          'Branded flyer links track live buyer inquiries',
          'Receive instant alerts when a client submits interest',
        ],
      },
      tools: {
        title: 'All-India State Stamp Duty & Broker Calculators',
        subtitle: 'Switch your operating state in Settings to update registry charges across India.',
        narration:
          'Step four: pick any of India’s 28 states or 8 union territories in Regional Preferences. Your Stamp Duty, Registration Fees, and area unit calculators adapt automatically.',
        bullets: [
          'Covers Haryana, Punjab, Maharashtra, Tamil Nadu, UP & all India',
          'Instant Female, Male & Joint buyer stamp duty rebates',
          'One-click WhatsApp quote copy for clients',
        ],
      },
    },
  },
  hi: {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिंदी',
    speechLocale: 'hi-IN',
    modalTitle: 'लीडनिवेश प्लेटफ़ॉर्म वीडियो गाइड',
    modalSub: 'आवाज़ और कैप्शन के साथ 5 प्रमुख भारतीय भाषाओं में देखें',
    chapters: {
      'quick-chat': {
        title: 'WhatsApp मैसेज से 1 क्लिक में लीड सेव करें',
        subtitle: 'हिंदी, हिंग्लिश या अंग्रेज़ी चैट को व्यवस्थित प्रॉपर्टी व बायर रिकॉर्ड बनाएं।',
        narration:
          'लीडनिवेश में आपका स्वागत है। सबसे पहले क्विक चैट में किसी भी व्हाट्सएप मैसेज को पेस्ट करें। अगले स्टेप में बायर या सेलर चुनें और डिटेल सेव करें।',
        bullets: [
          'क्विक चैट में मैसेज पेस्ट करें या बोलकर लिखें',
          'स्टेप 2 में बायर (खरीदार) या सेलर (विक्रेता) चुनना ज़रूरी है',
          'नेक्स्ट दबाते ही डेटा सीधे आपके खाते में सेव हो जाता है',
        ],
      },
      matching: {
        title: 'रैंक किए गए मैच और Best Match बैज',
        subtitle: 'बजट, साइज और लोकेशन के आधार पर सबसे सटीक प्रॉपर्टी या बायर देखें।',
        narration:
          'दूसरे स्टेप में मैजिक मोमेंट दिखता है। बायर के लिए बेस्ट प्रॉपर्टी और प्रॉपर्टी के लिए बेस्ट बायर रैंक होकर ऊपर दिखते हैं, साथ ही प्रॉपर्टी कितने लोगों को भेजी गई यह भी दिखता है।',
        bullets: [
          'सबसे सटीक विकल्प पर Best Match टैग सबसे ऊपर',
          'हर प्रॉपर्टी पर Sent Count (कितने ग्राहकों को भेजी गई) दिखता है',
          'सीधे WhatsApp भेजें, कॉपी करें या डील सेव करें',
        ],
      },
      inventory: {
        title: 'ओनर वॉल्ट और सुरक्षित प्रॉपर्टी फ़्लायर',
        subtitle: 'मकान मालिक का नंबर छिपाकर अपनी एजेंसी के नाम से फ़्लायर शेयर करें।',
        narration:
          'तीसरे स्टेप में अपनी प्रॉपर्टी लिस्टिंग सेव रखें। मालिक का नंबर सुरक्षित रहता है और ग्राहक को केवल आपकी एजेंसी का ब्रांडेड लिंक दिखता है।',
        bullets: [
          'मकान मालिक का नंबर 100% प्राइवेट रहता है',
          'WhatsApp पर प्रोफेशनल प्रॉपर्टी फ़्लायर भेजें',
          'ग्राहक की हर नई इंक्वायरी तुरंत डैशबोर्ड पर पाएं',
        ],
      },
      tools: {
        title: 'पूरे भारत के स्टाम्प ड्यूटी और ब्रोकर टूल्स',
        subtitle: 'सेटिंग्स में अपना राज्य चुनें और रजिस्ट्री खर्च की सही गणना करें।',
        narration:
          'चौथे स्टेप में रीजनल सेटिंग्स से हरियाणा, पंजाब, महाराष्ट्र, तमिलनाडु सहित पूरे भारत का कोई भी राज्य चुनें। स्टाम्प ड्यूटी और रजिस्ट्री शुल्क अपने आप अपडेट हो जाते हैं।',
        bullets: [
          'भारत के सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों का सपोर्ट',
          'महिला, पुरुष और जॉइंट रजिस्ट्री छूट की सटीक गणना',
          'गज, मरला, कनाल, वर्ग फुट कन्वर्टर और EMI कैलकुलेटर',
        ],
      },
    },
  },
  pa: {
    code: 'pa',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
    speechLocale: 'pa-IN',
    modalTitle: 'ਲੀਡਨਿਵੇਸ਼ ਪਲੇਟਫਾਰਮ ਵੀਡੀਓ ਗਾਈਡ',
    modalSub: 'ਆਵਾਜ਼ ਅਤੇ ਕੈਪਸ਼ਨ ਨਾਲ 5 ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਦੇਖੋ',
    chapters: {
      'quick-chat': {
        title: 'WhatsApp ਸੁਨੇਹੇ ਤੋਂ 1 ਕਲਿੱਕ ਵਿੱਚ ਡੇਟਾ ਸੇਵ ਕਰੋ',
        subtitle: 'ਕਿਸੇ ਵੀ ਗਰੁੱਪ ਚੈਟ ਨੂੰ ਖਰੀਦਦਾਰ ਜਾਂ ਪ੍ਰਾਪਰਟੀ ਰਿਕਾਰਡ ਵਿੱਚ ਬਦਲੋ।',
        narration:
          'ਲੀਡਨਿਵੇਸ਼ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ। Quick Chat ਵਿੱਚ WhatsApp ਸੁਨੇਹਾ ਪੇਸਟ ਕਰੋ, ਅਗਲੇ ਕਦਮ ਵਿੱਚ Buyer ਜਾਂ Seller ਚੁਣੋ ਅਤੇ ਵੇਰਵੇ ਸੇਵ ਕਰੋ।',
        bullets: [
          'Quick Chat ਵਿੱਚ ਸੁਨੇਹਾ ਪੇਸਟ ਕਰੋ ਜਾਂ ਬੋਲ ਕੇ ਲਿਖੋ',
          'ਦੂਜੇ ਕਦਮ ਵਿੱਚ Buyer ਜਾਂ Seller ਚੁਣਨਾ ਲਾਜ਼ਮੀ ਹੈ',
          'Next ਦਬਾਉਂਦੇ ਹੀ ਪ੍ਰੋਫਾਈਲ ਆਪਣੇ ਆਪ ਸੇਵ ਹੋ ਜਾਂਦੀ ਹੈ',
        ],
      },
      matching: {
        title: 'ਰੈਂਕ ਕੀਤੇ ਮੈਚ ਅਤੇ Best Match ਬੈਜ',
        subtitle: 'ਬਜਟ, ਸਾਈਜ਼ ਅਤੇ ਸੈਕਟਰ ਦੇ ਹਿਸਾਬ ਨਾਲ ਸਭ ਤੋਂ ਵਧੀਆ ਪ੍ਰਾਪਰਟੀ ਜਾਂ ਗਾਹਕ ਲੱਭੋ।',
        narration:
          'ਹੁਣ ਮੈਜਿਕ ਮੋਮੈਂਟ: ਸਿਸਟਮ ਬਜਟ ਅਤੇ ਸਾਈਜ਼ ਅਨੁਸਾਰ Best Match ਸਭ ਤੋਂ ਉੱਪਰ ਦਿਖਾਉਂਦਾ ਹੈ ਅਤੇ ਦੱਸਦਾ ਹੈ ਕਿ ਇਹ ਪ੍ਰਾਪਰਟੀ ਕਿੰਨੇ ਲੋਕਾਂ ਨੂੰ ਭੇਜੀ ਜਾ ਚੁੱਕੀ ਹੈ।',
        bullets: [
          'ਸਭ ਤੋਂ ਵਧੀਆ ਮੈਚ ਉੱਤੇ Best Match ਬੈਜ',
          'ਹਰ ਪ੍ਰਾਪਰਟੀ ਉੱਤੇ ਭੇਜੇ ਗਏ ਗਾਹਕਾਂ ਦੀ ਗਿਣਤੀ',
          'WhatsApp ਉੱਤੇ ਭੇਜੋ, ਕਾਪੀ ਕਰੋ ਜਾਂ ਡੀਲ ਸੇਵ ਕਰੋ',
        ],
      },
      inventory: {
        title: 'ਓਨਰ ਵਾਲਟ ਅਤੇ ਸੁਰੱਖਿਅਤ ਫਲਾਇਰ',
        subtitle: 'ਮਾਲਕ ਦਾ ਨੰਬਰ ਗੁਪਤ ਰੱਖ ਕੇ ਆਪਣੀ ਏਜੰਸੀ ਦਾ ਫਲਾਇਰ ਭੇਜੋ।',
        narration:
          'ਮਾਲਕ ਦਾ ਫੋਨ ਨੰਬਰ ਵਾਲਟ ਵਿੱਚ ਸੁਰੱਖਿਅਤ ਰਹਿੰਦਾ ਹੈ ਅਤੇ ਗਾਹਕਾਂ ਨੂੰ ਸਿਰਫ਼ ਤੁਹਾਡੀ ਏਜੰਸੀ ਦਾ ਬ੍ਰਾਂਡਡ ਲਿੰਕ ਮਿਲਦਾ ਹੈ।',
        bullets: [
          'ਮਾਲਕ ਦਾ ਨੰਬਰ 100% ਸੁਰੱਖਿਅਤ ਰਹਿੰਦਾ ਹੈ',
          '1 ਟੈਪ ਵਿੱਚ WhatsApp ਫਲਾਇਰ ਤਿਆਰ',
          'ਨਵੀਂ ਇਨਕੁਆਰੀ ਆਉਣ ਤੇ ਤੁਰੰਤ ਨੋਟੀਫਿਕੇਸ਼ਨ',
        ],
      },
      tools: {
        title: 'ਪੂਰੇ ਭਾਰਤ ਦੀ ਸਟੈਂਪ ਡਿਊਟੀ ਅਤੇ ਏਰੀਆ ਕੈਲਕੁਲੇਟਰ',
        subtitle: 'Settings ਵਿੱਚ ਆਪਣਾ ਸੂਬਾ ਚੁਣੋ — ਪੰਜਾਬ, ਹਰਿਆਣਾ ਜਾਂ ਕੋਈ ਵੀ ਭਾਰਤੀ ਸੂਬਾ।',
        narration:
          'Settings ਵਿੱਚ ਜਾ ਕੇ ਪੰਜਾਬ, ਹਰਿਆਣਾ ਜਾਂ ਭਾਰਤ ਦਾ ਕੋਈ ਵੀ ਸੂਬਾ ਚੁਣੋ। ਸਟੈਂਪ ਡਿਊਟੀ, ਰਜਿਸਟਰੀ ਫੀਸ ਅਤੇ ਮਰਲਾ-ਗਜ਼ ਹਿਸਾਬ ਤੁਰੰਤ ਅੱਪਡੇਟ ਹੋ ਜਾਂਦੇ ਹਨ।',
        bullets: [
          'ਭਾਰਤ ਦੇ ਸਾਰੇ 28 ਸੂਬੇ ਅਤੇ 8 UT ਸ਼ਾਮਲ',
          '25 ਗਜ਼ ਅਤੇ 30.25 ਗਜ਼ ਮਰਲਾ ਸਟੈਂਡਰਡ ਸਪੋਰਟ',
          'ਗਾਹਕਾਂ ਨੂੰ WhatsApp ਉੱਤੇ ਸਿੱਧਾ ਕੋਟੇਸ਼ਨ ਭੇਜੋ',
        ],
      },
    },
  },
  ta: {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    speechLocale: 'ta-IN',
    modalTitle: 'LeadNivash தள வீடியோ வழிகாட்டி',
    modalSub: 'குரல் மற்றும் தலைப்புகளுடன் 5 இந்திய மொழிகளில் பார்க்கவும்',
    chapters: {
      'quick-chat': {
        title: 'WhatsApp செய்திகளை 1 கிளிக்கில் சேமிக்கவும்',
        subtitle: 'எந்தவொரு ரியல் எஸ்டேட் செய்தியையும் வாங்குபவர் அல்லது சொத்து பதிவாக மாற்றவும்.',
        narration:
          'LeadNivash-க்கு நல்வரவு. Quick Chat-இல் வாட்ஸ்அப் செய்தியை ஒட்டவும். அடுத்த கட்டத்தில் வாங்குபவர் அல்லது விற்பனையாளரைத் தேர்ந்தெடுத்து சேமிக்கவும்.',
        bullets: [
          'Quick Chat-இல் செய்தியை ஒட்டவும் அல்லது பேசவும்',
          'படி 2-இல் Buyer அல்லது Seller கட்டாயம் தேர்வு செய்யவும்',
          'Next அழுத்தியவுடன் விவரங்கள் தானாக சேமிக்கப்படும்',
        ],
      },
      matching: {
        title: 'தரவரிசைப் பொருத்தங்கள் & Best Match பேட்ஜ்',
        subtitle: 'பட்ஜெட், அளவு மற்றும் பகுதி அடிப்படையில் சிறந்த சொத்துக்களை உடனே காண்க.',
        narration:
          'மூன்றாம் கட்டத்தில் பட்ஜெட் மற்றும் அளவின் அடிப்படையில் சிறந்த சொத்துக்கள் முதலில் காட்டப்படும். எத்தனை நபர்களுக்கு அனுப்பப்பட்டது என்பதும் தெரியும்.',
        bullets: [
          'சிறந்த தேர்விற்கு Best Match பேட்ஜ் முதலிடத்தில்',
          'ஒவ்வொரு சொத்தும் எத்தனை பேருக்கு அனுப்பப்பட்டது என்ற எண்ணிக்கை',
          'WhatsApp-இல் அனுப்ப, நகலெடுக்க மற்றும் சேமிக்க வசதி',
        ],
      },
      inventory: {
        title: 'உரிமையாளர் எண் பாதுகாப்பு & ஃபிளையர்கள்',
        subtitle: 'உரிமையாளர் எண்ணை மறைத்து உங்கள் நிறுவன பெயரில் அனுப்பவும்.',
        narration:
          'உரிமையாளர் தொலைபேசி எண் பாதுகாப்பாக இருக்கும். வாடிக்கையாளர்களுக்கு உங்கள் நிறுவனத்தின் பெயருடன் கூடிய லிங்க் மட்டுமே செல்லும்.',
        bullets: [
          'உரிமையாளர் தொடர்பு 100% பாதுகாக்கப்படுகிறது',
          'WhatsApp பிராண்டட் ஃபிளையர் பகிர்வு',
          'புதிய விசாரணைகளை உடனுக்குடன் பார்க்கலாம்',
        ],
      },
      tools: {
        title: 'இந்தியா முழுவதும் முத்திரைத் தாள் கட்டண கால்குலேட்டர்',
        subtitle: 'தமிழ்நாடு உட்பட அனைத்து மாநிலங்களின் பத்திரப்பதிவு கட்டணங்களைக் கணக்கிடுங்கள்.',
        narration:
          'Settings-இல் தமிழ்நாடு அல்லது இந்தியாவின் எந்த மாநிலத்தையும் தேர்ந்தெடுக்கவும். முத்திரைத் தாள் மற்றும் பதிவு கட்டணங்கள் உடனே மாறும்.',
        bullets: [
          '28 மாநிலங்கள் மற்றும் 8 யூனியன் பிரதேசங்கள்',
          'தமிழ்நாடு 7% முத்திரைத் தாள் & 2% பதிவு கட்டணம்',
          'EMI, கமிஷன் மற்றும் நில அளவு மாற்றிகள்',
        ],
      },
    },
  },
  mr: {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    speechLocale: 'mr-IN',
    modalTitle: 'LeadNivash प्लॅटफॉर्म व्हिडिओ मार्गदर्शक',
    modalSub: 'आवाज आणि सबटायटल्ससह 5 प्रमुख भारतीय भाषांमध्ये पहा',
    chapters: {
      'quick-chat': {
        title: 'WhatsApp मेसेजमधून 1 क्लिकमध्ये माहिती सेव्ह करा',
        subtitle: 'कोणताही प्रॉपर्टी किंवा ग्राहक मेसेज थेट व्यवस्थित रेकॉर्डमध्ये बदला.',
        narration:
          'LeadNivash मध्ये आपले स्वागत आहे. Quick Chat मध्ये कोणताही WhatsApp मेसेज पेस्ट करा. पुढच्या टप्प्यात Buyer किंवा Seller निवडा आणि माहिती सेव्ह करा.',
        bullets: [
          'Quick Chat मध्ये मेसेज पेस्ट करा किंवा बोलून टाइप करा',
          'स्टेप 2 मध्ये Buyer किंवा Seller निवडणे अनिवार्य आहे',
          'Next वर क्लिक करताच माहिती डेटाबेसमध्ये सेव्ह होते',
        ],
      },
      matching: {
        title: 'अचूक रँकिंग मॅचेस आणि Best Match बॅज',
        subtitle: 'बजेट, आकार आणि लोकेशननुसार सर्वोत्तम प्रॉपर्टी किंवा ग्राहक शोधा.',
        narration:
          'स्टेप 3 मध्ये बजेट आणि एरियानुसार सर्वोत्तम मॅच सर्वात वर दिसतो, तसेच ही प्रॉपर्टी किती ग्राहकांना पाठवली गेली आहे याची संख्याही दिसते.',
        bullets: [
          'सर्वात योग्य प्रॉपर्टी किंवा ग्राहकावर Best Match बॅज',
          'प्रत्येक प्रॉपर्टीवर Sent Count (किती जणांना पाठवली) दिसतो',
          'WhatsApp वर पाठवा, कॉपी करा किंवा डील सेव्ह करा',
        ],
      },
      inventory: {
        title: 'ओनर व्हॉल्ट आणि सुरक्षित प्रॉपर्टी फ्लायर',
        subtitle: 'मालकाचा नंबर लपवून तुमच्या एजन्सीच्या नावाने माहिती पाठवा.',
        narration:
          'प्रॉपर्टी मालकाचा संपर्क नंबर सुरक्षित राहतो आणि ग्राहकांना फक्त तुमच्या एजन्सीचे ब्रँडेड तपशील पाठवले जातात.',
        bullets: [
          'मालकाचा मोबाईल नंबर 100% सुरक्षित',
          'WhatsApp वर आकर्षक फ्लायर लिंक शेअर करा',
          'ग्राहकांच्या चौकशीची माहिती थेट इनबॉक्समध्ये मिळवा',
        ],
      },
      tools: {
        title: 'संपूर्ण भारतासाठी स्टॅम्प ड्युटी आणि ब्रोकर टूल्स',
        subtitle: 'Settings मध्ये महाराष्ट्र किंवा भारतातील कोणतेही राज्य निवडा.',
        narration:
          'Settings मध्ये महाराष्ट्र किंवा भारतातील कोणतेही राज्य निवडा. मुद्रांक शुल्क, नोंदणी फी आणि एरिया कन्व्हर्टर आपोआप अपडेट होतात.',
        bullets: [
          'सर्व 28 राज्ये आणि 8 केंद्रशासित प्रदेशांचा समावेश',
          'महाराष्ट्र महिला सवलत व ₹30,000 कमाल नोंदणी फी',
          'EMI, कमिशन स्प्लिट आणि WhatsApp कोटेशन शेअरिंग',
        ],
      },
    },
  },
};

export const openVideoGuide = (lang?: GuideLanguageCode) => {
  window.dispatchEvent(
    new CustomEvent('leadnivash_open_video_guide', { detail: { lang } })
  );
};

interface GuideVideoModalProps {
  onStartInteractiveTour?: () => void;
}

export const GuideVideoModal: React.FC<GuideVideoModalProps> = ({
  onStartInteractiveTour,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<GuideLanguageCode>(
    (user?.preferences?.language as GuideLanguageCode) || 'en'
  );
  const [chapterIdx, setChapterIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progressSec, setProgressSec] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (user?.preferences?.language) {
      const code = user.preferences.language as GuideLanguageCode;
      if (LANGUAGE_PACKS[code]) {
        setLanguage(code);
      }
    }
  }, [user?.preferences?.language]);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.lang && LANGUAGE_PACKS[detail.lang as GuideLanguageCode]) {
        setLanguage(detail.lang);
      }
      setChapterIdx(0);
      setProgressSec(0);
      setIsPlaying(true);
      setIsOpen(true);
    };
    window.addEventListener('leadnivash_open_video_guide', handleOpen);
    return () => window.removeEventListener('leadnivash_open_video_guide', handleOpen);
  }, []);

  const currentChapter = GUIDE_CHAPTERS[chapterIdx];
  const pack = LANGUAGE_PACKS[language] || LANGUAGE_PACKS.en;
  const content = pack.chapters[currentChapter.id];

  // Auto-advance timeline while playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const timer = window.setInterval(() => {
      setProgressSec((prev) => {
        if (prev + 1 >= currentChapter.durationSec) {
          if (chapterIdx < GUIDE_CHAPTERS.length - 1) {
            setChapterIdx((c) => c + 1);
          } else {
            setChapterIdx(0);
          }
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOpen, isPlaying, chapterIdx, currentChapter.durationSec]);

  // Synchronize HTML5 background showcase video with play/pause state
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isOpen && isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [isOpen, isPlaying, chapterIdx]);

  // Synchronized multi-language speech narration using native Web Speech API (with safe cleanup)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isOpen || !isPlaying || isMuted) return;

    try {
      const utter = new SpeechSynthesisUtterance(content.narration);
      utter.lang = pack.speechLocale;
      utter.rate = 0.96;
      const voices = window.speechSynthesis.getVoices();
      const matched =
        voices.find((v) => v.lang.toLowerCase() === pack.speechLocale.toLowerCase()) ||
        voices.find((v) =>
          v.lang.toLowerCase().startsWith(pack.speechLocale.split('-')[0].toLowerCase())
        );
      if (matched) utter.voice = matched;
      window.speechSynthesis.speak(utter);
    } catch {
      // Speech synthesis gracefully skipped if unavailable in browser
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isOpen, isPlaying, isMuted, language, chapterIdx, content.narration, pack.speechLocale]);

  const totalSec = useMemo(
    () => GUIDE_CHAPTERS.reduce((s, c) => s + c.durationSec, 0),
    []
  );
  const elapsedBefore = useMemo(
    () =>
      GUIDE_CHAPTERS.slice(0, chapterIdx).reduce((s, c) => s + c.durationSec, 0) +
      progressSec,
    [chapterIdx, progressSec]
  );

  if (!isOpen) return null;

  const ChapterIcon = currentChapter.icon;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-ink-black/75 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={pack.modalTitle}
    >
      <div className="relative w-full max-w-3xl max-h-[94vh] flex flex-col rounded-[22px] bg-white border border-lime/40 shadow-2xl overflow-hidden text-left">
        {/* Top Bar with Title & 5-Language Switcher */}
        <div className="bg-ink-black text-white px-4 sm:px-6 py-4 flex flex-col gap-3 border-b border-white/10 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-lime">
                <Globe className="w-3.5 h-3.5" />
                <span>5 Core Indian Languages Video Guide</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 truncate">
                {pack.modalTitle}
              </h2>
              <p className="text-xs text-white/70">{pack.modalSub}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setIsOpen(false);
              }}
              aria-label="Close video guide"
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 5 Core Language Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {(Object.keys(LANGUAGE_PACKS) as GuideLanguageCode[]).map((code) => {
              const item = LANGUAGE_PACKS[code];
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setLanguage(code);
                    setProgressSec(0);
                    setIsPlaying(true);
                  }}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer border',
                    active
                      ? 'bg-lime text-ink-black border-lime shadow-xs'
                      : 'bg-white/10 text-white/85 border-white/15 hover:bg-white/20'
                  )}
                >
                  {item.nativeLabel} · {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Simulated High-Contrast Video Stage */}
        <div className="overflow-y-auto flex-1">
          <div className="relative bg-ink-black aspect-[16/9] max-h-[340px] w-full overflow-hidden">
            <video
              ref={videoRef}
              src="/bg1.mp4"
              muted
              loop
              playsInline
              poster="/hero-bg.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-35 scale-105"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(215,247,154,0.18)_0%,rgba(18,20,15,0.88)_65%)]" />

            {/* Live Chapter Overlay Card */}
            <div className="relative z-10 h-full p-4 sm:p-6 flex flex-col justify-between text-white">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime text-ink-black text-xs font-bold shadow-xs">
                  <ChapterIcon className="w-3.5 h-3.5" />
                  <span>{currentChapter.highlightBadge}</span>
                </span>
                <span className="text-[11px] font-mono bg-white/10 border border-white/15 px-2.5 py-1 rounded-lg text-white/90">
                  {currentChapter.screenLabel}
                </span>
              </div>

              <div className="space-y-2.5 max-w-2xl">
                <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug">
                  {content.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  {content.subtitle}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {content.bullets.map((b, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-xs text-[11px] text-white/95 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-lime shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synchronized Subtitle Bar */}
              <div className="p-2.5 rounded-xl bg-black/65 border border-white/15 text-xs text-lime-soft leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-lime mr-2">
                  [{pack.nativeLabel} Subtitles]
                </span>
                {content.narration}
              </div>
            </div>
          </div>

          {/* Video Transport & Chapter Controls */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-line space-y-3">
            {/* Progress Track */}
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-brand-600 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((elapsedBefore / totalSec) * 100))}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-ink-black text-white text-xs font-semibold hover:bg-ink-900 cursor-pointer transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 text-lime" /> : <Play className="w-3.5 h-3.5 text-lime" />}
                  <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-white border border-border text-xs font-semibold text-ink-900 hover:bg-slate-100 cursor-pointer transition"
                  title={isMuted ? 'Unmute narration' : 'Mute narration'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-brand-600" />}
                  <span>{isMuted ? 'Muted' : 'Audio On'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChapterIdx(0);
                    setProgressSec(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 rounded-[10px] bg-white border border-border text-ink-700 hover:text-ink-900 cursor-pointer transition"
                  title="Restart video"
                  aria-label="Restart video"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="text-xs font-semibold text-ink-500 tabular-nums">
                Chapter {chapterIdx + 1} / {GUIDE_CHAPTERS.length} · {elapsedBefore}s / {totalSec}s
              </span>
            </div>

            {/* Chapter Switcher */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {GUIDE_CHAPTERS.map((chap, idx) => {
                const Icon = chap.icon;
                const active = idx === chapterIdx;
                return (
                  <button
                    key={chap.id}
                    type="button"
                    onClick={() => {
                      setChapterIdx(idx);
                      setProgressSec(0);
                      setIsPlaying(true);
                    }}
                    className={clsx(
                      'p-2.5 rounded-[12px] border text-left transition cursor-pointer space-y-1',
                      active
                        ? 'bg-lime-soft border-ink-black text-ink-900 shadow-2xs'
                        : 'bg-white border-line text-ink-700 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <Icon className={clsx('w-3.5 h-3.5', active ? 'text-brand-700' : 'text-ink-500')} />
                      <span>0{idx + 1}</span>
                    </div>
                    <p className="text-xs font-semibold truncate">{pack.chapters[chap.id].title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-white border-t border-border flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setIsOpen(false);
              onStartInteractiveTour?.();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Open Step-by-Step Interactive Walkthrough</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setIsOpen(false);
            }}
            className="group btn-cashfree-primary btn-shine-sweep h-10 pl-4 pr-1.5 rounded-[12px] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Got it, back to app</span>
            <span className="w-7 h-7 rounded-[8px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
