export const speechLanguageCodes = {
  Hindi: 'hi-IN', Punjabi: 'pa-IN', Marathi: 'mr-IN', Tamil: 'ta-IN', Telugu: 'te-IN', Gujarati: 'gu-IN',
  'English (South Africa)': 'en-ZA', English: 'en-IN', 'Portuguese (Brazil)': 'pt-BR', Russian: 'ru-RU',
  'Mandarin (China)': 'zh-CN', 'Zulu (South Africa)': 'zu-ZA',
};

const english = {
  greeting: 'Good morning, {name}. Today is {date}. Here is what is happening on your farm today.',
  weather: 'It is {temperature} degrees and {condition}.',
  rain: 'Rain is expected on {day}, about {amount} millimetres. You may wait before watering.',
  waterPlan: 'The water plan says: {plan}.',
  reminder: 'A reminder: {title}. {detail}',
  healthy: 'Good news. {fieldName} is healthy and the soil has enough water. The crops are {crops}.',
  needsAttention: '{fieldName} needs attention. The crops are {crops}. The soil is {moisture}.',
  field: '{fieldName}. Crops: {crops}. {status} {moisture}',
  summary: 'You have {count} active fields and your farm health score is {score} out of one hundred. You have saved {saved} percent water.',
  notifications: 'You have {count} farm notifications.',
  diagnosisReady: 'Your photo check says: {title}. {advice}',
  diagnosisPrompt: 'Choose a crop and add a clear photo of a leaf to check its health.',
  fieldsIntro: 'Here is the health of your fields.',
  climateIntro: 'The weather is {temperature} degrees and {condition}. {rain} {plan}',
  networkIntro: 'Fieldwise helps farming regions learn together while keeping local farm records private.',
  page: 'You are on the {page} page.',
  ending: 'That is all for now. Press the button again anytime to listen again.',
  unavailable: 'A voice for this language is not available on this device. I will try another voice.',
  moistureLow: 'a little dry', moistureModerate: 'moderate', moistureGood: 'good',
  healthyStatus: 'It is healthy.', attentionStatus: 'It needs attention.',
};

// Keep whole, naturally phrased sentences here so each language can be improved independently.
export const speechTemplates = {
  English: english,
  'English (South Africa)': english,
  Hindi: {
    greeting: 'सुप्रभात, {name}। आज {date} है। सुनिए, आपके खेत में क्या हो रहा है।', weather: 'आज तापमान {temperature} डिग्री है और मौसम {condition} है।',
    rain: '{day} को लगभग {amount} मिलीमीटर बारिश हो सकती है। आप पानी देने के लिए बारिश के बाद तक रुक सकते हैं।', waterPlan: 'पानी की सलाह है: {plan}।',
    reminder: 'याद रखें: {title}। {detail}', healthy: 'अच्छी खबर। {fieldName} स्वस्थ है और मिट्टी में पर्याप्त नमी है। यहाँ {crops} उगते हैं।',
    needsAttention: '{fieldName} पर ध्यान देने की ज़रूरत है। यहाँ {crops} उगते हैं। मिट्टी में नमी {moisture} है।', field: '{fieldName}। फसलें: {crops}। {status} मिट्टी की नमी {moisture} है।',
    summary: 'आपके {count} सक्रिय खेत हैं। खेत का स्वास्थ्य {score} में से है। आपने {saved} प्रतिशत पानी बचाया है।', notifications: 'आपके लिए खेत से जुड़ी {count} सूचनाएँ हैं।',
    diagnosisReady: 'फोटो की जाँच में यह दिखा: {title}। {advice}', diagnosisPrompt: 'फसल चुनें और पत्ते की साफ़ तस्वीर जोड़ें।', fieldsIntro: 'आपके खेतों की स्थिति यह है।',
    climateIntro: 'आज तापमान {temperature} डिग्री है और मौसम {condition} है। {rain} {plan}', networkIntro: 'फील्डवाइज़ स्थानीय खेत के रिकॉर्ड सुरक्षित रखते हुए खेती के ज्ञान को साझा करने में मदद करता है।',
    page: 'आप {page} पेज पर हैं।', ending: 'अभी के लिए इतना ही। खेत की जानकारी फिर सुनने के लिए बटन दबाएँ।', unavailable: 'इस डिवाइस पर इस भाषा की आवाज़ उपलब्ध नहीं है। दूसरी आवाज़ इस्तेमाल की जाएगी।',
    moistureLow: 'थोड़ी सूखी', moistureModerate: 'ठीक', moistureGood: 'अच्छी', healthyStatus: 'स्वस्थ है।', attentionStatus: 'ध्यान देने की ज़रूरत है।',
    alerts: { heavyRain: 'खन्ना में गुरुवार को भारी बारिश की संभावना है। सिंचाई टालें।', lowMoisture: 'रिवर बेंड के सोयाबीन खेत में मिट्टी की नमी कम है। आज खेत देखें।', leafSpot: 'आपकी नई तस्वीर में पत्ती के धब्बे दिख सकते हैं। जाँच देखें।', weeklyReport: 'आपकी इस हफ़्ते की खेत की स्वास्थ्य रिपोर्ट तैयार है।' },
  },
  Punjabi: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, {name}। ਅੱਜ {date} ਹੈ। ਸੁਣੋ, ਤੁਹਾਡੇ ਖੇਤ ਵਿੱਚ ਕੀ ਹੋ ਰਿਹਾ ਹੈ।', weather: 'ਅੱਜ ਤਾਪਮਾਨ {temperature} ਡਿਗਰੀ ਹੈ ਅਤੇ ਮੌਸਮ {condition} ਹੈ।',
    rain: '{day} ਨੂੰ ਲਗਭਗ {amount} ਮਿਲੀਮੀਟਰ ਮੀਂਹ ਪੈ ਸਕਦਾ ਹੈ। ਪਾਣੀ ਦੇਣ ਲਈ ਮੀਂਹ ਤੋਂ ਬਾਅਦ ਤੱਕ ਰੁਕ ਸਕਦੇ ਹੋ।', waterPlan: 'ਪਾਣੀ ਦੀ ਸਲਾਹ ਹੈ: {plan}।', reminder: 'ਯਾਦ ਰੱਖੋ: {title}। {detail}',
    healthy: 'ਚੰਗੀ ਖ਼ਬਰ। {fieldName} ਸਿਹਤਮੰਦ ਹੈ ਅਤੇ ਮਿੱਟੀ ਵਿੱਚ ਕਾਫ਼ੀ ਨਮੀ ਹੈ। ਇੱਥੇ {crops} ਉੱਗਦੇ ਹਨ।', needsAttention: '{fieldName} ਵੱਲ ਧਿਆਨ ਦੇਣ ਦੀ ਲੋੜ ਹੈ। ਇੱਥੇ {crops} ਉੱਗਦੇ ਹਨ। ਮਿੱਟੀ ਦੀ ਨਮੀ {moisture} ਹੈ।',
    field: '{fieldName}। ਫ਼ਸਲਾਂ: {crops}। {status} ਮਿੱਟੀ ਦੀ ਨਮੀ {moisture} ਹੈ।', summary: 'ਤੁਹਾਡੇ {count} ਸਰਗਰਮ ਖੇਤ ਹਨ। ਖੇਤ ਦੀ ਸਿਹਤ ਦਾ ਅੰਕ {score} ਵਿੱਚੋਂ ਹੈ। ਤੁਸੀਂ {saved} ਫ਼ੀਸਦੀ ਪਾਣੀ ਬਚਾਇਆ ਹੈ।',
    notifications: 'ਤੁਹਾਡੇ ਕੋਲ ਖੇਤ ਦੀਆਂ {count} ਸੂਚਨਾਵਾਂ ਹਨ।', diagnosisReady: 'ਤਸਵੀਰ ਦੀ ਜਾਂਚ ਕਹਿੰਦੀ ਹੈ: {title}। {advice}', diagnosisPrompt: 'ਫ਼ਸਲ ਚੁਣੋ ਅਤੇ ਪੱਤੇ ਦੀ ਸਾਫ਼ ਤਸਵੀਰ ਜੋੜੋ।', fieldsIntro: 'ਤੁਹਾਡੇ ਖੇਤਾਂ ਦੀ ਸਿਹਤ ਇਹ ਹੈ।',
    climateIntro: 'ਅੱਜ ਤਾਪਮਾਨ {temperature} ਡਿਗਰੀ ਹੈ ਅਤੇ ਮੌਸਮ {condition} ਹੈ। {rain} {plan}', networkIntro: 'ਫੀਲਡਵਾਈਜ਼ ਸਥਾਨਕ ਖੇਤੀ ਦੇ ਰਿਕਾਰਡ ਸੁਰੱਖਿਅਤ ਰੱਖ ਕੇ ਖੇਤੀ ਦਾ ਗਿਆਨ ਸਾਂਝਾ ਕਰਦਾ ਹੈ।',
    page: 'ਤੁਸੀਂ {page} ਪੰਨੇ ਉੱਤੇ ਹੋ।', ending: 'ਫਿਲਹਾਲ ਇੰਨਾ ਹੀ। ਖੇਤ ਦੀ ਜਾਣਕਾਰੀ ਮੁੜ ਸੁਣਨ ਲਈ ਬਟਨ ਦਬਾਓ।', unavailable: 'ਇਸ ਡਿਵਾਈਸ ਉੱਤੇ ਇਸ ਭਾਸ਼ਾ ਦੀ ਆਵਾਜ਼ ਨਹੀਂ ਹੈ। ਹੋਰ ਆਵਾਜ਼ ਵਰਤੀ ਜਾਵੇਗੀ।',
    moistureLow: 'ਥੋੜ੍ਹੀ ਸੁੱਕੀ', moistureModerate: 'ਠੀਕ', moistureGood: 'ਚੰਗੀ', healthyStatus: 'ਸਿਹਤਮੰਦ ਹੈ।', attentionStatus: 'ਧਿਆਨ ਦੀ ਲੋੜ ਹੈ।',
    alerts: { heavyRain: 'ਖੰਨਾ ਵਿੱਚ ਵੀਰਵਾਰ ਨੂੰ ਭਾਰੀ ਮੀਂਹ ਪੈਣ ਦੀ ਸੰਭਾਵਨਾ ਹੈ। ਸਿੰਚਾਈ ਮੁਲਤਵੀ ਕਰੋ।', lowMoisture: 'ਰਿਵਰ ਬੈਂਡ ਦੇ ਸੋਇਆਬੀਨ ਖੇਤ ਵਿੱਚ ਮਿੱਟੀ ਦੀ ਨਮੀ ਘੱਟ ਹੈ। ਅੱਜ ਖੇਤ ਦੇਖੋ।', leafSpot: 'ਤੁਹਾਡੀ ਨਵੀਂ ਤਸਵੀਰ ਵਿੱਚ ਪੱਤਿਆਂ ਦੇ ਧੱਬੇ ਹੋ ਸਕਦੇ ਹਨ। ਜਾਂਚ ਵੇਖੋ।', weeklyReport: 'ਇਸ ਹਫ਼ਤੇ ਦੀ ਖੇਤ ਸਿਹਤ ਰਿਪੋਰਟ ਤਿਆਰ ਹੈ।' },
  },
  Marathi: {
    greeting: 'शुभ सकाळ, {name}. आज {date} आहे. तुमच्या शेतात काय घडत आहे ते ऐका.', weather: 'आज तापमान {temperature} अंश आहे आणि हवामान {condition} आहे.', rain: '{day} रोजी सुमारे {amount} मिलिमीटर पावसाची शक्यता आहे. पाणी देण्यासाठी पावसानंतरपर्यंत थांबा.', waterPlan: 'पाण्याचा सल्ला: {plan}.', reminder: 'लक्षात ठेवा: {title}. {detail}',
    healthy: 'चांगली बातमी. {fieldName} निरोगी आहे आणि जमिनीत पुरेसा ओलावा आहे. येथे {crops} आहेत.', needsAttention: '{fieldName} कडे लक्ष देण्याची गरज आहे. येथे {crops} आहेत. जमिनीतील ओलावा {moisture} आहे.', field: '{fieldName}. पिके: {crops}. {status} जमिनीतील ओलावा {moisture} आहे.',
    summary: 'तुमची {count} सक्रिय शेते आहेत. शेताच्या आरोग्याचा गुण {score} पैकी आहे. तुम्ही {saved} टक्के पाणी वाचवले आहे.', notifications: 'तुमच्यासाठी शेताच्या {count} सूचना आहेत.',
    diagnosisReady: 'फोटो तपासणी सांगते: {title}. {advice}', diagnosisPrompt: 'पीक निवडा आणि पानाचा स्पष्ट फोटो जोडा.', fieldsIntro: 'तुमच्या शेतांची स्थिती अशी आहे.', climateIntro: 'आज तापमान {temperature} अंश आहे आणि हवामान {condition} आहे. {rain} {plan}',
    networkIntro: 'फील्डवाइज स्थानिक शेतीची नोंद सुरक्षित ठेवून शेतीचे ज्ञान वाटण्यास मदत करते.', page: 'तुम्ही {page} पानावर आहात.', ending: 'आत्तासाठी एवढेच. शेताची माहिती पुन्हा ऐकण्यासाठी बटण दाबा.', unavailable: 'या उपकरणावर या भाषेचा आवाज उपलब्ध नाही. दुसरा आवाज वापरला जाईल.',
    moistureLow: 'थोडा कोरडा', moistureModerate: 'मध्यम', moistureGood: 'चांगला', healthyStatus: 'निरोगी आहे.', attentionStatus: 'लक्ष देण्याची गरज आहे.',
    alerts: { heavyRain: 'खन्ना येथे गुरुवारी मुसळधार पावसाची शक्यता आहे. सिंचन पुढे ढकला.', lowMoisture: 'रिव्हर बेंड सोयाबीन शेतात जमिनीचा ओलावा कमी आहे. आज शेत तपासा.', leafSpot: 'तुमच्या अलीकडील फोटोमध्ये पानांवरील डाग दिसू शकतात. निदान पाहा.', weeklyReport: 'या आठवड्याचा शेत आरोग्य अहवाल तयार आहे.' },
  },
  Tamil: {
    greeting: 'காலை வணக்கம், {name}. இன்று {date}. உங்கள் பண்ணையில் என்ன நடக்கிறது என்று கேளுங்கள்.', weather: 'இன்று வெப்பநிலை {temperature} டிகிரி. வானிலை {condition}.', rain: '{day} அன்று சுமார் {amount} மில்லிமீட்டர் மழை பெய்யலாம். நீர் பாய்ச்சுவதற்கு மழைக்குப் பிறகு வரை காத்திருக்கலாம்.', waterPlan: 'நீர்ப்பாசன ஆலோசனை: {plan}.', reminder: 'நினைவூட்டல்: {title}. {detail}',
    healthy: 'நல்ல செய்தி. {fieldName} ஆரோக்கியமாக உள்ளது; மண்ணில் போதுமான ஈரப்பதம் உள்ளது. இங்கு {crops} பயிர்கள் உள்ளன.', needsAttention: '{fieldName} கவனம் தேவை. இங்கு {crops} பயிர்கள் உள்ளன. மண்ணின் ஈரப்பதம் {moisture}.', field: '{fieldName}. பயிர்கள்: {crops}. {status} மண்ணின் ஈரப்பதம் {moisture}.',
    summary: 'உங்களிடம் {count} செயலில் உள்ள வயல்கள் உள்ளன. பண்ணை நல மதிப்பெண் நூற்றுக்கு {score}. நீங்கள் {saved} சதவீதம் நீரைச் சேமித்துள்ளீர்கள்.', notifications: 'உங்களுக்குப் பண்ணை தொடர்பான {count} அறிவிப்புகள் உள்ளன.',
    diagnosisReady: 'படப் பரிசோதனை கூறுவது: {title}. {advice}', diagnosisPrompt: 'பயிரைத் தேர்ந்தெடுத்து இலையின் தெளிவான படத்தைச் சேர்க்கவும்.', fieldsIntro: 'உங்கள் வயல்களின் நிலை இதோ.', climateIntro: 'இன்று வெப்பநிலை {temperature} டிகிரி. வானிலை {condition}. {rain} {plan}',
    networkIntro: 'உள்ளூர் பண்ணைத் தகவல்களைப் பாதுகாத்தபடி விவசாய அறிவைப் பகிர Fieldwise உதவுகிறது.', page: 'நீங்கள் {page} பக்கத்தில் இருக்கிறீர்கள்.', ending: 'இப்போதைக்கு அவ்வளவுதான். மீண்டும் கேட்க பொத்தானை அழுத்தவும்.', unavailable: 'இந்தச் சாதனத்தில் இந்த மொழிக்கான குரல் இல்லை. வேறு குரலை முயற்சிக்கிறேன்.',
    moistureLow: 'சற்று வறண்டது', moistureModerate: 'மிதமானது', moistureGood: 'நன்றாக உள்ளது', healthyStatus: 'ஆரோக்கியமாக உள்ளது.', attentionStatus: 'கவனம் தேவை.',
    alerts: { heavyRain: 'கண்ணாவில் வியாழக்கிழமை கனமழை பெய்யலாம். பாசனத்தைத் தள்ளிவையுங்கள்.', lowMoisture: 'ரிவர் பெண்ட் சோயாபீன் வயலில் மண்ணின் ஈரப்பதம் குறைவாக உள்ளது. இன்று சரிபார்க்கவும்.', leafSpot: 'சமீபத்திய படத்தில் இலைப்புள்ளி அறிகுறிகள் இருக்கலாம். நோயறிதலைப் பார்க்கவும்.', weeklyReport: 'உங்கள் வாராந்திர பண்ணை நல அறிக்கை தயாராக உள்ளது.' },
  },
  Telugu: {
    greeting: 'శుభోదయం, {name}. ఈరోజు {date}. మీ పొలంలో ఏమి జరుగుతుందో వినండి.', weather: 'ఈరోజు ఉష్ణోగ్రత {temperature} డిగ్రీలు. వాతావరణం {condition}.', rain: '{day} నాడు సుమారు {amount} మిల్లీమీటర్ల వర్షం పడవచ్చు. నీరు పెట్టడానికి వర్షం తర్వాత వరకు ఆగండి.', waterPlan: 'నీటి సలహా: {plan}.', reminder: 'గుర్తుంచుకోండి: {title}. {detail}',
    healthy: 'శుభవార్త. {fieldName} ఆరోగ్యంగా ఉంది, నేలలో తగినంత తేమ ఉంది. ఇక్కడ {crops} పంటలు ఉన్నాయి.', needsAttention: '{fieldName} పై శ్రద్ధ అవసరం. ఇక్కడ {crops} పంటలు ఉన్నాయి. నేల తేమ {moisture}.', field: '{fieldName}. పంటలు: {crops}. {status} నేల తేమ {moisture}.',
    summary: 'మీకు {count} క్రియాశీల పొలాలు ఉన్నాయి. పొలం ఆరోగ్య స్కోరు వందకు {score}. మీరు {saved} శాతం నీటిని ఆదా చేశారు.', notifications: 'మీకు పొలానికి సంబంధించిన {count} సందేశాలు ఉన్నాయి.',
    diagnosisReady: 'ఫోటో తనిఖీ ఫలితం: {title}. {advice}', diagnosisPrompt: 'పంటను ఎంచుకుని ఆకు స్పష్టమైన ఫోటోను జోడించండి.', fieldsIntro: 'మీ పొలాల ఆరోగ్యం ఇలా ఉంది.', climateIntro: 'ఈరోజు ఉష్ణోగ్రత {temperature} డిగ్రీలు. వాతావరణం {condition}. {rain} {plan}',
    networkIntro: 'స్థానిక వ్యవసాయ రికార్డులను సురక్షితంగా ఉంచి వ్యవసాయ జ్ఞానాన్ని పంచుకోవడానికి Fieldwise సహాయపడుతుంది.', page: 'మీరు {page} పేజీలో ఉన్నారు.', ending: 'ప్రస్తుతానికి ఇంతే. మళ్లీ వినడానికి బటన్‌ను నొక్కండి.', unavailable: 'ఈ పరికరంలో ఈ భాషకు స్వరం అందుబాటులో లేదు. మరో స్వరాన్ని ప్రయత్నిస్తాను.',
    moistureLow: 'కొద్దిగా ఎండిపోయింది', moistureModerate: 'మధ్యస్థంగా ఉంది', moistureGood: 'బాగుంది', healthyStatus: 'ఆరోగ్యంగా ఉంది.', attentionStatus: 'శ్రద్ధ అవసరం.',
    alerts: { heavyRain: 'ఖన్నాలో గురువారం భారీ వర్షం కురిసే అవకాశం ఉంది. నీటిపారుదలను వాయిదా వేయండి.', lowMoisture: 'రివర్ బెండ్ సోయాబీన్ పొలంలో నేల తేమ తక్కువగా ఉంది. ఈరోజు తనిఖీ చేయండి.', leafSpot: 'మీ తాజా ఫోటోలో ఆకు మచ్చ వ్యాధి లక్షణాలు ఉండవచ్చు. నిర్ధారణను చూడండి.', weeklyReport: 'మీ వారపు పంట ఆరోగ్య నివేదిక సిద్ధంగా ఉంది.' },
  },
  Gujarati: {
    greeting: 'સુપ્રભાત, {name}. આજે {date} છે. તમારા ખેતરમાં શું થઈ રહ્યું છે તે સાંભળો.', weather: 'આજે તાપમાન {temperature} ડિગ્રી છે અને હવામાન {condition} છે.', rain: '{day} ના રોજ આશરે {amount} મિલીમીટર વરસાદ પડી શકે છે. પાણી આપવા માટે વરસાદ પછી સુધી રાહ જુઓ.', waterPlan: 'પાણીની સલાહ: {plan}.', reminder: 'યાદ રાખો: {title}. {detail}',
    healthy: 'સારા સમાચાર. {fieldName} તંદુરસ્ત છે અને જમીનમાં પૂરતો ભેજ છે. અહીં {crops} પાક છે.', needsAttention: '{fieldName} પર ધ્યાન આપવાની જરૂર છે. અહીં {crops} પાક છે. જમીનનો ભેજ {moisture} છે.', field: '{fieldName}. પાક: {crops}. {status} જમીનનો ભેજ {moisture} છે.',
    summary: 'તમારા {count} સક્રિય ખેતરો છે. ખેતરનો આરોગ્ય ગુણ {score} માંથી છે. તમે {saved} ટકા પાણી બચાવ્યું છે.', notifications: 'તમારા માટે ખેતરની {count} સૂચનાઓ છે.',
    diagnosisReady: 'ફોટાની તપાસ કહે છે: {title}. {advice}', diagnosisPrompt: 'પાક પસંદ કરો અને પાનનો સ્પષ્ટ ફોટો ઉમેરો.', fieldsIntro: 'તમારા ખેતરોની સ્થિતિ આ છે.', climateIntro: 'આજે તાપમાન {temperature} ડિગ્રી છે અને હવામાન {condition} છે. {rain} {plan}',
    networkIntro: 'સ્થાનિક ખેતરની માહિતી સુરક્ષિત રાખીને ખેતીનું જ્ઞાન વહેંચવામાં Fieldwise મદદ કરે છે.', page: 'તમે {page} પાનાં પર છો.', ending: 'હમણાં માટે આટલું જ. ફરીથી સાંભળવા બટન દબાવો.', unavailable: 'આ ઉપકરણમાં આ ભાષાનો અવાજ ઉપલબ્ધ નથી. બીજો અવાજ અજમાવું છું.',
    moistureLow: 'થોડો સૂકો', moistureModerate: 'મધ્યમ', moistureGood: 'સારો', healthyStatus: 'તંદુરસ્ત છે.', attentionStatus: 'ધ્યાન આપવાની જરૂર છે.',
    alerts: { heavyRain: 'ખન્નામાં ગુરુવારે ભારે વરસાદની શક્યતા છે. સિંચાઈ મુલતવી રાખો.', lowMoisture: 'રિવર બેન્ડના સોયાબીન ખેતરમાં જમીનની ભેજ ઓછી છે. આજે તપાસો.', leafSpot: 'તમારા તાજેતરના ફોટામાં પાનના ટપકાંનાં લક્ષણો દેખાય છે. નિદાન જુઓ.', weeklyReport: 'તમારો સાપ્તાહિક ખેતર આરોગ્ય અહેવાલ તૈયાર છે.' },
  },
  'Portuguese (Brazil)': {
    greeting: 'Bom dia, {name}. Hoje é {date}. Veja o que está acontecendo na sua fazenda.', weather: 'Hoje está fazendo {temperature} graus e o tempo está {condition}.', rain: 'Há previsão de cerca de {amount} milímetros de chuva na {day}. Você pode esperar para irrigar depois da chuva.', waterPlan: 'A recomendação de água é: {plan}.', reminder: 'Lembrete: {title}. {detail}',
    healthy: 'Boa notícia. {fieldName} está saudável e o solo tem água suficiente. As culturas são {crops}.', needsAttention: '{fieldName} precisa de atenção. As culturas são {crops}. O solo está {moisture}.', field: '{fieldName}. Culturas: {crops}. {status} A umidade do solo está {moisture}.',
    summary: 'Você tem {count} talhões ativos. A saúde da fazenda está em {score} de cem. Você economizou {saved} por cento de água.', notifications: 'Você tem {count} avisos da fazenda.',
    diagnosisReady: 'A análise da foto indica: {title}. {advice}', diagnosisPrompt: 'Escolha uma cultura e adicione uma foto nítida de uma folha.', fieldsIntro: 'Veja a saúde dos seus talhões.', climateIntro: 'Hoje está fazendo {temperature} graus e o tempo está {condition}. {rain} {plan}',
    networkIntro: 'O Fieldwise ajuda a compartilhar conhecimento agrícola, mantendo seguros os dados locais das fazendas.', page: 'Você está na página {page}.', ending: 'Por enquanto é só. Toque no botão novamente quando quiser ouvir de novo.', unavailable: 'A voz deste idioma não está disponível neste dispositivo. Vou tentar outra voz.',
    moistureLow: 'um pouco seco', moistureModerate: 'moderado', moistureGood: 'bom', healthyStatus: 'Está saudável.', attentionStatus: 'Precisa de atenção.',
    alerts: { heavyRain: 'Há previsão de chuva forte na quinta-feira em Khanna. Adie a irrigação.', lowMoisture: 'A umidade do solo está baixa na soja de River Bend. Verifique a área hoje.', leafSpot: 'Sua foto mais recente pode indicar mancha foliar. Revise o diagnóstico.', weeklyReport: 'Seu relatório semanal de saúde da fazenda está pronto.' },
  },
  Russian: {
    greeting: 'Доброе утро, {name}. Сегодня {date}. Послушайте, что происходит на вашей ферме.', weather: 'Сегодня температура {temperature} градусов, погода {condition}.', rain: 'В {day} ожидается около {amount} миллиметров дождя. Полив можно отложить до окончания дождя.', waterPlan: 'Совет по поливу: {plan}.', reminder: 'Напоминание: {title}. {detail}',
    healthy: 'Хорошие новости. Поле {fieldName} здорово, в почве достаточно влаги. Здесь растут культуры: {crops}.', needsAttention: 'Полю {fieldName} нужно внимание. Культуры: {crops}. Почва {moisture}.', field: '{fieldName}. Культуры: {crops}. {status} Почва {moisture}.',
    summary: 'У вас {count} активных полей. Оценка здоровья фермы — {score} из ста. Вы сэкономили {saved} процентов воды.', notifications: 'У вас {count} уведомлений по ферме.',
    diagnosisReady: 'Проверка фото: {title}. {advice}', diagnosisPrompt: 'Выберите культуру и добавьте чёткое фото листа.', fieldsIntro: 'Состояние ваших полей.', climateIntro: 'Сегодня температура {temperature} градусов, погода {condition}. {rain} {plan}',
    networkIntro: 'Fieldwise помогает делиться знаниями о сельском хозяйстве, сохраняя местные данные фермы в безопасности.', page: 'Вы на странице «{page}».', ending: 'На этом пока всё. Нажмите кнопку ещё раз, чтобы послушать снова.', unavailable: 'На этом устройстве нет голоса для этого языка. Попробую другой голос.',
    moistureLow: 'слегка сухая', moistureModerate: 'умеренная', moistureGood: 'хорошая', healthyStatus: 'Поле здорово.', attentionStatus: 'Полю нужно внимание.',
    alerts: { heavyRain: 'В четверг в Кханне ожидаются сильные дожди. Отложите полив.', lowMoisture: 'Влажность почвы на соевом поле Ривер-Бенд низкая. Проверьте поле сегодня.', leafSpot: 'На последнем фото возможны признаки пятнистости листьев. Проверьте диагноз.', weeklyReport: 'Готов еженедельный отчёт о состоянии вашей фермы.' },
  },
  'Mandarin (China)': {
    greeting: '早上好，{name}。今天是{date}。来听听农场的情况。', weather: '今天气温{temperature}度，天气{condition}。', rain: '{day}预计有约{amount}毫米降雨。您可以等雨后再灌溉。', waterPlan: '灌溉建议：{plan}。', reminder: '提醒：{title}。{detail}',
    healthy: '好消息。{fieldName}状况良好，土壤水分充足。这里种植的是{crops}。', needsAttention: '{fieldName}需要关注。这里种植的是{crops}。土壤水分{moisture}。', field: '{fieldName}。作物：{crops}。{status}土壤水分{moisture}。',
    summary: '您有{count}块在管田地。农场健康评分为一百分中的{score}分。您节省了百分之{saved}的用水。', notifications: '您有{count}条农场通知。',
    diagnosisReady: '照片检查结果：{title}。{advice}', diagnosisPrompt: '请选择作物并添加清晰的叶片照片。', fieldsIntro: '以下是您的田地状况。', climateIntro: '今天气温{temperature}度，天气{condition}。{rain}{plan}',
    networkIntro: 'Fieldwise帮助各地分享农业经验，同时保护本地农场数据。', page: '您正在查看{page}页面。', ending: '今天就到这里。想再次收听时，请按下按钮。', unavailable: '此设备没有这种语言的语音。我将尝试其他语音。',
    moistureLow: '有些干', moistureModerate: '适中', moistureGood: '充足', healthyStatus: '状况良好。', attentionStatus: '需要关注。',
    alerts: { heavyRain: '卡纳周四预计有强降雨。请推迟灌溉。', lowMoisture: '河湾大豆田土壤水分偏低。请于今天检查田地。', leafSpot: '最新照片可能显示叶斑病迹象。请查看诊断结果。', weeklyReport: '您的每周农场健康报告已准备就绪。' },
  },
  'Zulu (South Africa)': {
    greeting: 'Sawubona, {name}. Namuhla umhla ka-{date}. Lalela okwenzekayo epulazini lakho.', weather: 'Namuhla izinga lokushisa lingu-{temperature} degrees, kanti isimo sezulu {condition}.', rain: 'Kulindeleke imvula engaba amamilimitha angu-{amount} ngo-{day}. Ungalinda kuze kudlule imvula ngaphambi kokunisela.', waterPlan: 'Iseluleko sokunisela sithi: {plan}.', reminder: 'Isikhumbuzo: {title}. {detail}',
    healthy: 'Izindaba ezinhle. {fieldName} iphilile futhi inhlabathi inamanzi anele. Kutshalwe {crops}.', needsAttention: '{fieldName} idinga ukunakwa. Kutshalwe {crops}. Inhlabathi {moisture}.', field: '{fieldName}. Izitshalo: {crops}. {status} Inhlabathi {moisture}.',
    summary: 'Unezinkambu ezisebenzayo ezingu-{count}. Isilinganiso sempilo yepulazi singu-{score} ekhulwini. Wonge amanzi angamaphesenti angu-{saved}.', notifications: 'Unezaziso zasepulazini ezingu-{count}.',
    diagnosisReady: 'Ukuhlolwa kwesithombe kuthole ukuthi: {title}. {advice}', diagnosisPrompt: 'Khetha isitshalo bese wengeza isithombe esicacile seqabunga.', fieldsIntro: 'Nansi impilo yezinkambu zakho.', climateIntro: 'Namuhla izinga lokushisa lingu-{temperature} degrees, kanti isimo sezulu {condition}. {rain} {plan}',
    networkIntro: 'I-Fieldwise isiza ukwabelana ngolwazi lwezolimo kuyilapho igcina imininingwane yasemapulazini iphephile.', page: 'Usekhasini le-{page}.', ending: 'Yilokho okwamanje. Cindezela inkinobho futhi ukuze ulalele futhi.', unavailable: 'Izwi lalolu limi alitholakali kule divayisi. Ngizozama elinye izwi.',
    moistureLow: 'yome kancane', moistureModerate: 'usesilinganisweni', moistureGood: 'ilungile', healthyStatus: 'Iphilile.', attentionStatus: 'Idinga ukunakwa.',
    alerts: { heavyRain: 'Kulindeleke imvula enkulu eKhanna ngoLwesine. Hlehlisa ukunisela.', lowMoisture: 'Umswakama womhlabathi uphansi ensimini yesoya eRiver Bend. Hlola insimu namuhla.', leafSpot: 'Isithombe sakho sakamuva singase sibonise amabala emaqabungeni. Buyekeza ukuhlolwa.', weeklyReport: 'Umbiko wakho wamasonto onke wezempilo yepulazi usulungile.' },
  },
};

const spokenDetails = {
  English: { conditionPartlyCloudy: 'partly cloudy', dayThursday: 'Thursday', planAfterRain: 'wait until after Thursday’s rain, then check North Field soil', leafReminder: 'River Bend soybean may have leaf spots. Review the photo check.', waterReminder: 'Water North Field tomorrow. Check the soil first because it is getting dry.', diagnosisTitle: 'Possible leaf spot', diagnosisAdvice: 'Remove badly affected leaves and avoid watering the leaves. Check again in three or four days.' },
  'English (South Africa)': { conditionPartlyCloudy: 'partly cloudy', dayThursday: 'Thursday', planAfterRain: 'wait until after Thursday’s rain, then check North Field soil', leafReminder: 'River Bend soybean may have leaf spots. Review the photo check.', waterReminder: 'Water North Field tomorrow. Check the soil first because it is getting dry.', diagnosisTitle: 'Possible leaf spot', diagnosisAdvice: 'Remove badly affected leaves and avoid watering the leaves. Check again in three or four days.' },
  Hindi: { conditionPartlyCloudy: 'आंशिक बादल', dayThursday: 'गुरुवार', planAfterRain: 'गुरुवार की बारिश के बाद रुकें और नॉर्थ फील्ड की मिट्टी देखें', leafReminder: 'रिवर बेंड के सोयाबीन में पत्तियों पर धब्बे हो सकते हैं। फोटो की जाँच देखें।', waterReminder: 'कल नॉर्थ फील्ड में पानी दें। पहले मिट्टी देखें, उसमें नमी कम हो रही है।', diagnosisTitle: 'पत्तियों पर धब्बे हो सकते हैं', diagnosisAdvice: 'ज़्यादा प्रभावित पत्तियाँ हटाएँ और पत्तियों पर पानी न डालें। तीन या चार दिन बाद फिर देखें।' },
  Punjabi: { conditionPartlyCloudy: 'ਅੰਸ਼ਕ ਬੱਦਲ', dayThursday: 'ਵੀਰਵਾਰ', planAfterRain: 'ਵੀਰਵਾਰ ਦੇ ਮੀਂਹ ਤੋਂ ਬਾਅਦ ਰੁਕੋ ਅਤੇ ਨੌਰਥ ਫੀਲਡ ਦੀ ਮਿੱਟੀ ਵੇਖੋ', leafReminder: 'ਰਿਵਰ ਬੈਂਡ ਦੇ ਸੋਇਆਬੀਨ ਵਿੱਚ ਪੱਤਿਆਂ ਉੱਤੇ ਧੱਬੇ ਹੋ ਸਕਦੇ ਹਨ। ਫੋਟੋ ਦੀ ਜਾਂਚ ਵੇਖੋ।', waterReminder: 'ਕੱਲ੍ਹ ਨੌਰਥ ਫੀਲਡ ਨੂੰ ਪਾਣੀ ਦਿਓ। ਪਹਿਲਾਂ ਮਿੱਟੀ ਵੇਖੋ, ਇਹ ਸੁੱਕ ਰਹੀ ਹੈ।', diagnosisTitle: 'ਪੱਤਿਆਂ ਉੱਤੇ ਧੱਬੇ ਹੋ ਸਕਦੇ ਹਨ', diagnosisAdvice: 'ਬਹੁਤ ਪ੍ਰਭਾਵਿਤ ਪੱਤੇ ਹਟਾਓ ਅਤੇ ਪੱਤਿਆਂ ਉੱਤੇ ਪਾਣੀ ਨਾ ਪਾਓ। ਤਿੰਨ ਜਾਂ ਚਾਰ ਦਿਨ ਬਾਅਦ ਮੁੜ ਵੇਖੋ।' },
  Marathi: { conditionPartlyCloudy: 'अंशतः ढगाळ', dayThursday: 'गुरुवार', planAfterRain: 'गुरुवारच्या पावसानंतर थांबा आणि नॉर्थ फील्डची जमीन तपासा', leafReminder: 'रिव्हर बेंड सोयाबीनवर पानांचे डाग असू शकतात. फोटो तपासणी पाहा.', waterReminder: 'उद्या नॉर्थ फील्डला पाणी द्या. आधी जमीन तपासा, ती कोरडी होत आहे.', diagnosisTitle: 'पानांवर डाग असू शकतात', diagnosisAdvice: 'खूप बाधित पाने काढा आणि पानांवर पाणी टाकू नका. तीन किंवा चार दिवसांनी पुन्हा तपासा.' },
  Tamil: { conditionPartlyCloudy: 'ஓரளவு மேகமூட்டம்', dayThursday: 'வியாழக்கிழமை', planAfterRain: 'வியாழக்கிழமை மழை முடிந்ததும் காத்திருந்து நார்த் ஃபீல்ட் மண்ணைச் சரிபார்க்கவும்', leafReminder: 'ரிவர் பெண்ட் சோயாபீனில் இலைப் புள்ளிகள் இருக்கலாம். படப் பரிசோதனையைப் பார்க்கவும்.', waterReminder: 'நாளை நார்த் ஃபீல்டில் நீர் பாய்ச்சவும். மண் காய்ந்து வருவதால் முதலில் சரிபார்க்கவும்.', diagnosisTitle: 'இலைப்புள்ளி இருக்கலாம்', diagnosisAdvice: 'மிகவும் பாதிக்கப்பட்ட இலைகளை அகற்றுங்கள்; இலைகளுக்கு மேல் நீர் பாய்ச்ச வேண்டாம். மூன்று அல்லது நான்கு நாட்களில் மீண்டும் பாருங்கள்.' },
  Telugu: { conditionPartlyCloudy: 'పాక్షికంగా మేఘావృతం', dayThursday: 'గురువారం', planAfterRain: 'గురువారం వర్షం తర్వాత ఆగి నార్త్ ఫీల్డ్ నేలను తనిఖీ చేయండి', leafReminder: 'రివర్ బెండ్ సోయాబీన్‌లో ఆకులపై మచ్చలు ఉండవచ్చు. ఫోటో తనిఖీని చూడండి.', waterReminder: 'రేపు నార్త్ ఫీల్డ్‌కు నీరు పెట్టండి. నేల ఎండుతోంది కాబట్టి ముందుగా తనిఖీ చేయండి.', diagnosisTitle: 'ఆకుమచ్చ వ్యాధి ఉండవచ్చు', diagnosisAdvice: 'బాగా దెబ్బతిన్న ఆకులను తీసేయండి, ఆకులపై నీరు పోయకండి. మూడు లేదా నాలుగు రోజుల తర్వాత మళ్లీ చూడండి.' },
  Gujarati: { conditionPartlyCloudy: 'આંશિક વાદળછાયું', dayThursday: 'ગુરુવાર', planAfterRain: 'ગુરુવારના વરસાદ પછી રાહ જુઓ અને નોર્થ ફીલ્ડની જમીન તપાસો', leafReminder: 'રિવર બેન્ડ સોયાબીનમાં પાન પર ડાઘ હોઈ શકે છે. ફોટાની તપાસ જુઓ.', waterReminder: 'કાલે નોર્થ ફીલ્ડમાં પાણી આપો. જમીન સૂકાઈ રહી છે, તેથી પહેલાં તપાસો.', diagnosisTitle: 'પાન પર ડાઘ હોઈ શકે છે', diagnosisAdvice: 'વધુ અસરગ્રસ્ત પાંદડાં દૂર કરો અને પાંદડાં પર પાણી ન છાંટો. ત્રણ કે ચાર દિવસ પછી ફરી તપાસો.' },
  'Portuguese (Brazil)': { conditionPartlyCloudy: 'parcialmente nublado', dayThursday: 'quinta-feira', planAfterRain: 'espere a chuva de quinta-feira passar e depois verifique o solo do Campo Norte', leafReminder: 'A soja de River Bend pode ter manchas nas folhas. Confira a análise da foto.', waterReminder: 'Regue o Campo Norte amanhã. Verifique o solo antes, pois está ficando seco.', diagnosisTitle: 'Possíveis manchas nas folhas', diagnosisAdvice: 'Retire as folhas muito afetadas e evite molhar as folhas. Confira novamente em três ou quatro dias.' },
  Russian: { conditionPartlyCloudy: 'переменная облачность', dayThursday: 'четверг', planAfterRain: 'дождитесь окончания дождя в четверг, затем проверьте почву на поле Норт-Филд', leafReminder: 'На сое в Ривер-Бенд могут быть пятна на листьях. Посмотрите проверку фото.', waterReminder: 'Завтра полейте Норт-Филд. Сначала проверьте почву, она подсыхает.', diagnosisTitle: 'Возможна пятнистость листьев', diagnosisAdvice: 'Удалите сильно повреждённые листья и не поливайте по листьям. Проверьте снова через три или четыре дня.' },
  'Mandarin (China)': { conditionPartlyCloudy: '多云间晴', dayThursday: '周四', planAfterRain: '等周四降雨结束后再检查北田的土壤', leafReminder: '河湾大豆可能有叶斑。请查看照片检查结果。', waterReminder: '明天给北田浇水。土壤正在变干，请先检查。', diagnosisTitle: '可能有叶斑病', diagnosisAdvice: '摘除受害严重的叶片，不要从叶面浇水。三到四天后再次检查。' },
  'Zulu (South Africa)': { conditionPartlyCloudy: 'kunamafu kancane', dayThursday: 'ngoLwesine', planAfterRain: 'linda kuze kudlule imvula yangoLwesine bese uhlola inhlabathi yaseNorth Field', leafReminder: 'Isoya yaseRiver Bend ingaba namabala emaqabungeni. Buyekeza ukuhlolwa kwesithombe.', waterReminder: 'Nisela iNorth Field kusasa. Hlola inhlabathi kuqala ngoba iya koma.', diagnosisTitle: 'Kungaba namabala emaqabungeni', diagnosisAdvice: 'Susa amaqabunga alimele kakhulu futhi ungacheleli emaqabungeni. Hlola futhi ngemva kwezinsuku ezintathu noma ezine.' },
};
Object.entries(spokenDetails).forEach(([language, details]) => Object.assign(speechTemplates[language], details));

const speechStateLabels = {
  English: { playing: 'Reading aloud', paused: 'Reading paused', idle: 'Reading stopped' },
  'English (South Africa)': { playing: 'Reading aloud', paused: 'Reading paused', idle: 'Reading stopped' },
  Hindi: { playing: 'जानकारी पढ़ी जा रही है', paused: 'पढ़ना रुका हुआ है', idle: 'पढ़ना बंद है' },
  Punjabi: { playing: 'ਜਾਣਕਾਰੀ ਪੜ੍ਹੀ ਜਾ ਰਹੀ ਹੈ', paused: 'ਪੜ੍ਹਨਾ ਰੁਕਿਆ ਹੋਇਆ ਹੈ', idle: 'ਪੜ੍ਹਨਾ ਬੰਦ ਹੈ' },
  Marathi: { playing: 'माहिती वाचली जात आहे', paused: 'वाचन थांबवले आहे', idle: 'वाचन बंद आहे' },
  Tamil: { playing: 'தகவல் வாசிக்கப்படுகிறது', paused: 'வாசிப்பு இடைநிறுத்தப்பட்டது', idle: 'வாசிப்பு நிறுத்தப்பட்டது' },
  Telugu: { playing: 'సమాచారం చదువుతోంది', paused: 'చదవడం ఆగింది', idle: 'చదవడం నిలిపివేశారు' },
  Gujarati: { playing: 'માહિતી વાંચવામાં આવી રહી છે', paused: 'વાંચવાનું થોભાવ્યું છે', idle: 'વાંચવાનું બંધ છે' },
  'Portuguese (Brazil)': { playing: 'Lendo as informações', paused: 'Leitura pausada', idle: 'Leitura parada' },
  Russian: { playing: 'Читаю информацию', paused: 'Чтение приостановлено', idle: 'Чтение остановлено' },
  'Mandarin (China)': { playing: '正在朗读信息', paused: '朗读已暂停', idle: '朗读已停止' },
  'Zulu (South Africa)': { playing: 'Kufundwa ulwazi', paused: 'Ukufunda kumisiwe okwesikhashana', idle: 'Ukufunda kumisiwe' },
};
export const getSpeechStateLabel = (language, state) => (speechStateLabels[language] || speechStateLabels.English)[state] || speechStateLabels.English[state];

const fallbackLanguages = {
  Tatar: 'Russian', Bashkir: 'Russian', Chechen: 'Russian', Chuvash: 'Russian', Avar: 'Russian', 'Yakut (Sakha)': 'Russian',
  Cantonese: 'Mandarin (China)', 'Wu (Shanghainese)': 'Mandarin (China)', 'Min Nan': 'Mandarin (China)', Hakka: 'Mandarin (China)', Tibetan: 'Mandarin (China)', Uyghur: 'Mandarin (China)', Mongolian: 'Mandarin (China)',
  Xhosa: 'English (South Africa)', Afrikaans: 'English (South Africa)', Sepedi: 'English (South Africa)', Setswana: 'English (South Africa)', Sesotho: 'English (South Africa)', Xitsonga: 'English (South Africa)', siSwati: 'English (South Africa)', Tshivenda: 'English (South Africa)', isiNdebele: 'English (South Africa)',
};

const fill = (template, values = {}) => String(template || '').replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
const templatesFor = language => speechTemplates[language] || speechTemplates[fallbackLanguages[language]] || english;

function alertText(alert, templates) {
  return alert.speechText || templates.alerts?.[alert.messageKey] || alert.message;
}

const cropNames = (field, language) => (field.crops || (field.crop ? [field.crop] : [])).join(', ') || (language === 'English' ? 'your crop' : '');

export function buildReadingQueue({ page, userName, date, fields = [], activeAlerts = [], notifications = [], language = 'English', diagnosis, diagnosticCrop, weather = {} }) {
  const t = templatesFor(language);
  const queue = [];
  const add = (id, key, values = {}) => { if (t[key]) queue.push({ id, text: fill(t[key], values) }); };
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  const alerts = [...activeAlerts].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity] || new Date(b.timestamp) - new Date(a.timestamp));
  const moistureWords = { Low: t.moistureLow, Moderate: t.moistureModerate, Good: t.moistureGood };
  const moistureText = field => moistureWords[field.water] || t.moistureModerate;

  if (page === 'overview') {
    add('greeting', 'greeting', { name: userName || 'farmer', date });
    alerts.forEach(alert => queue.push({ id: `alert-${alert.id}`, text: alertText(alert, t) }));
    add('weather', 'weather', { temperature: weather.temperature || '28', condition: weather.condition || 'partly cloudy' });
    add('rain', 'rain', { day: weather.rainDay || 'Thursday', amount: weather.rainAmount || '12' });
    add('irrigation', 'waterPlan', { plan: t.planAfterRain || 'wait until after Thursday rain, then check North Field soil' });
    queue.push({ id: 'note-leaf', text: t.leafReminder || 'Check River Bend soybean for possible leaf spots.' });
    queue.push({ id: 'note-water', text: t.waterReminder || 'Water North Field tomorrow and check the soil first.' });
    fields.slice(0, 3).forEach(field => {
      const values = { fieldName: field.name, crops: cropNames(field, language), moisture: moistureText(field) };
      queue.push({ id: `field-${field.name}`, text: field.health < 70 ? fill(t.needsAttention, values) : fill(t.healthy, values) });
    });
    add('farm-summary', 'summary', { count: fields.length, score: '78', saved: '18' });
    add('notifications', 'notifications', { count: notifications.length });
    notifications.forEach(alert => queue.push({ id: `notification-${alert.id}`, text: alertText(alert, t) }));
  } else if (page === 'fields') {
    add('fields-intro', 'fieldsIntro');
    fields.forEach(field => queue.push({ id: `field-${field.name}`, text: fill(t.field, { fieldName: field.name, crops: cropNames(field, language), status: field.health < 70 ? t.attentionStatus : t.healthyStatus, moisture: moistureText(field) }) }));
  } else if (page === 'diagnostics') {
    if (diagnosis) add('diagnosis', 'diagnosisReady', { title: `${t.diagnosisTitle || 'Possible leaf spot'}${diagnosticCrop ? ` in ${diagnosticCrop}` : ''}`, advice: t.diagnosisAdvice || diagnosis.advice });
    else add('diagnosis-prompt', 'diagnosisPrompt', { crop: diagnosticCrop || '' });
  } else if (page === 'climate') {
    add('weather', 'weather', { temperature: weather.temperature || '28', condition: weather.condition || t.conditionPartlyCloudy || 'partly cloudy' });
    add('rain', 'rain', { day: t.dayThursday || weather.rainDay || 'Thursday', amount: weather.rainAmount || '12' });
    add('irrigation', 'waterPlan', { plan: t.planAfterRain || 'wait until after Thursday rain, then check North Field soil' });
    queue.push({ id: 'irrigation', text: t.waterReminder || 'Water North Field tomorrow and check the soil first.' });
  } else if (page === 'network') {
    add('network', 'networkIntro');
  } else {
    add('page', 'page', { page });
  }
  add('ending', 'ending');
  return queue;
}

export function splitSpeechText(text) {
  return String(text).match(/[^.!?।。！？]+[.!?।。！？]?/gu)?.map(part => part.trim()).filter(Boolean) || [];
}

export function selectSpeechVoice(voices, language) {
  const locale = speechLanguageCodes[language] || 'en-IN';
  const prefix = locale.split('-')[0].toLowerCase();
  const matches = voices.filter(voice => voice.lang?.toLowerCase().startsWith(prefix));
  const voice = matches.find(item => /natural|neural|premium/i.test(item.name)) || matches.find(item => /female|woman|zira|samantha|heera|sara/i.test(item.name)) || matches[0];
  return { voice, locale, fallback: !voice };
}
