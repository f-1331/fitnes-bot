"""
Mashqlar to'plami (Workouts Data)
Yosh bolaga ham tushunarli, qadam-baqadam rasmli va sodda yo'riqnomalar bazasi.
"""

EXERCISE_DETAILS = {
    "squats": {
        "name": "O'tirib-turish (Klassik Squats)",
        "target": "Dumba, son va oyoq mushaklari (Eng ko'p yog' erituvchi mashq)",
        "reps": "20 marta (2-3 doira)",
        "img": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop",
        "how_to_stand": "• To'g'ri turing, gavdangiz xuddi askarlardek tik bo'lsin.\n• Oyoqlaringizni yelka kengligida oching, oyoq uchlari biroz tashqariga qarasin.\n• Qo'llaringizni ko'kragingiz oldida birlashtirib oling.",
        "how_to_move": "• <b>Tasavvur qiling:</b> Orqangizda kichkina stulcha bor. Xuddi o'sha stulchaga o'tirmoqchi bo'lgandek dumbangizni orqaga chiqaring!\n• Soni polga parallel (tekis) bo'lguncha pastga tushing.\n• ⚠️ <b>Oltin qoida:</b> Tizzangiz oyoq barmog'ingizdan oldinga chiqmasin, og'irlik tovonda bo'lsin!",
        "breathing": "• Pastga tushayotganda: Burundan chuqur NAFAS OLING 👃\n• Yuqoriga ko'tarilayotganda: Og'izdan kuch bilan NAFAS CHIQARING 💨",
        "mistakes": "❌ Bukur bo'lib egilmang (ko'krak doim ochiq bo'lsin).\n❌ Tovonni yerdan uzmang (oyoq uchida qilmang).\n❌ Tizzalarni ichkariga bukmang.",
        "pro_tip": "Pastga tushganingizda 1-2 sekund to'xtab tursangiz, yog' yoqilishi 2 barobar kuchayadi!"
    },
    "plank": {
        "name": "Planka (Toshday Mustahkam Turish)",
        "target": "Butun tana: qorin pressi, bel, yelka va orqa mushaklari",
        "reps": "40-60 sekund ushlab turish",
        "img": "https://images.unsplash.com/photo-1566241134883-13eb2393a3cc?w=800&auto=format&fit=crop",
        "how_to_stand": "• Yerga qorin bilan yotasiz va tirsaklaringizga tayanib ko'tarilasiz.\n• Tirsaklaringiz to'g'ri yelkangiz ostida (90 gradus) bo'lsin.\n• Oyoq barmoqlaringiz polga tiraladi.",
        "how_to_move": "• <b>Tasavvur qiling:</b> Siz yog'och taxtasiz yoki tekis ko'priksiz! Qimir etmasdan bir chiziqda turasiz.\n• Qorningizni bor kushingiz bilan ichingizga torting va qattiq ushlang.\n• Dumba mushaklarini ham qising.",
        "breathing": "• Nafasingizni qisib qotib qolmang! Sekin, xotirjam va bir maromda burundan nafas olib, og'izdan chiqaring.",
        "mistakes": "❌ Belingizni pastga osiltirib yubormang (bel og'rib qoladi).\n❌ Dumbangizni tog' kabi osmonga ko'tarib olmang.\n❌ Boshni pastga solintirmang, polga qarang.",
        "pro_tip": "Har kuni 5 sekunddan qo'shib boring. 1 oyda qorningiz toshday qattiq bo'ladi!"
    },
    "vacuum": {
        "name": "Qorin Vakuumi (Belni Ingichkalashtiruvchi Sehrli Mashq)",
        "target": "Ichki ko'ndalang qorin mushaklari (Qorinni ichga yopishtirish)",
        "reps": "4-5 marta 10-15 sekunddan",
        "img": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop",
        "how_to_stand": "• Tik turing, qo'llaringizni belingizga yoki soningizga qo'ying.\n• Gavdani biroz oldinga engashtirishingiz ham mumkin.",
        "how_to_move": "• 1. Burundan chuqur nafas oling.\n• 2. Keyin og'zingizdan bor havoni «Fuuuux» deb to'liq chiqarib tashlang.\n• 3. O'pkangizda havo qolmaganda, qorningizni xuddi umurtqangizga yopishtirmoqchi bo'lgandek ichkariga qattiq torting!\n• 4. Shu holatda 10-15 sekund nafas olmay turing, so'ng sekin nafas oling.",
        "breathing": "• Mashq paytida nafas to'xtatiladi. Qorin ichkariga tortilgan holatda qulflanadi.",
        "mistakes": "❌ To'q qoringa qilmang (faqat och qoringa yoki ovqatdan 2-3 soat keyin).\n❌ Havoni to'liq chiqarmasdan qorinni tortmang.",
        "pro_tip": "Arnold Shvarsnegger va barcha mashhur chempionlar ingichka belga erishish uchun faqat shu mashqni qilishgan!"
    },
    "pushups": {
        "name": "Push-ups (Qo'llarni Bukib Yozish / Otjimaniye)",
        "target": "Ko'krak, yelka, qo'l orqasi (triseps) va butun gavda",
        "reps": "12-15 marta (yoki tizzada)",
        "img": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop",
        "how_to_stand": "• Kaftlaringizni yelka kengligidan biroz kengroq qilib polga qo'ying.\n• Tana boshdan oyoqqacha tekis simday bo'lsin.\n• <i>Agar qiyin bo'lsa:</i> Tizzangizni yerga qo'yib bajaring (ayollar va boshlovchilar uchun ideal).",
        "how_to_move": "• Tirsaklaringizni bukib, ko'kragingiz yerga tegishiga 2-3 sm qolguncha pastga tushing.\n• Tirsaklar yonga emas, orqaga 45 gradus burchakda ketsin.\n• Kaftlaringiz bilan polni kuchli itarib, dastlabki holatga qayting.",
        "breathing": "• Pastga tushayotganda: NAFAS OLING 👃\n• Polni itarib yuqoriga chiqayotganda: NAFAS CHIQARING 💨",
        "mistakes": "❌ Tirsaklarni 90 gradus qanotdek yoyish (yelka jarohatlanadi).\n❌ Dumba osilib qolishi yoki yuqorida qolib ketishi.",
        "pro_tip": "Agar polda qiyin bo'lsa, devorga yoki stulga suyanib boshlang. Har kuni 2 tadan ko'paytiring!"
    },
    "jumping_jacks": {
        "name": "Jumping Jacks (Qo'l va Oyoqni Yoyib Sakrash)",
        "target": "Tezkor yurak qon-tomir faolligi, butun tana yog'larini yoqish",
        "reps": "45-60 sekund to'xtamasdan",
        "img": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&auto=format&fit=crop",
        "how_to_stand": "• Oyoqlarni birlashtirib, qo'llarni yon tomonga tushirib tik turing.",
        "how_to_move": "• <b>Xuddi yulduzchaga o'xshaysiz!</b>\n• Yengil sakrab oyoqlaringizni yonga keng oching va ayni paytda qo'llaringizni bosh ustida qarsak chaling 👏\n• Yana sakrab dastlabki holatga qayting.\n• Sakrashni mayin, tizzalarni biroz yumshoq bukkan holda bajaring.",
        "breathing": "• Ritmik va erkin nafas: Sakraganda nafas oling, birlashganda chiqaring.",
        "mistakes": "❌ Qattiq tovon bilan sakramang (oyoq uchiga yumshoq tushing).\n❌ Nafasni ushlab qolmang.",
        "pro_tip": "Ertalab uyquni 1 daqiqada ochish va kechasi kaloriyani eng tez yoqishning 1-raqamli mashqi!"
    },
    "mountain_climbers": {
        "name": "Tog'chilar (Mountain Climbers)",
        "target": "Pastki qorin yog'larini yo'qotish va yuqori kardio faollik",
        "reps": "30-45 sekund",
        "img": "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800&auto=format&fit=crop",
        "how_to_stand": "• Yerda plank (yoki push-up) holatida to'g'ri qo'llarga tayanib turing.",
        "how_to_move": "• <b>Tasavvur qiling:</b> Siz tik tog' cho'qqisiga yugurib chiqayapsiz!\n• O'ng tizzangizni ko'kragingizga tez torting, so'ng qaytarib, darhol chap tizzangizni torting.\n• Xuddi polda yugurayotgandek oyoqlarni ketma-ket almashtiring.",
        "breathing": "• Qisqa va tez-tez burun-og'iz bilan ritmik nafas oling.",
        "mistakes": "❌ Dumbangizni osmonga ko'tarib yubormang (plank to'g'ri tursin).\n❌ Qo'llaringiz yelkadan oldinga chiqib ketmasin.",
        "pro_tip": "30 sekund to'xtamasdan bajarsangiz, qorningiz olovdek yonadi — yog'lar ayni shu payt eriydi!"
    }
}

WORKOUTS = {
    "morning": {
        "title": "🌅 Ertalabki Tetiklashtiruvchi Badantarbiya",
        "duration": "10 daqiqa",
        "calories": "~50-70 kkal",
        "description": "Ushbu mashq uyqudan keyin tanani uyg'otadi, qon aylanishini yaxshilaydi va metabolizmni (yog' yoqilishini) faollashtiradi.",
        "exercises": ["squats", "plank", "jumping_jacks"],
        "steps": [
            "1️⃣ <b>Bo'yin va yelka aylantirish</b> — 1 daqiqa (Boshni sekin o'ngga va chapga aylantiring).",
            "2️⃣ <b>Qo'l va gavdani cho'zish</b> — 2 daqiqa (Qo'llarni yuqoriga cho'zib, chuqur nafas oling, so'ngra yon tomonlarga egiling).",
            "3️⃣ <b>O'tirib-turish (Squats)</b> — 20 marta (Oyoqlar yelka kengligida, to'g'ri o'tirib turing).",
            "4️⃣ <b>Plank mashqi</b> — 30-40 sekund (Gavdani to'g'ri ushlab turing, qorin mushaklarini taranglashtiring).",
            "5️⃣ <b>Joyida yengil sakrash yoki qadam</b> — 1 daqiqa (Nafas rostlash).",
        ],
        "tip": "💡 <i>Mashqdan oldin 1 stakan iliq suv ichishni unutmang — bu tanani ichdan tozalaydi va quvvat beradi.</i>"
    },
    "lunch": {
        "title": "☀️ Tushlikdagi Faollik va Harakat",
        "duration": "5-10 daqiqa",
        "calories": "~40-60 kkal",
        "description": "Tushlikdan so'ng darhol o'tirib yoki yotib olmaslik juda muhim. Bu mashqlar ovqat yaxshi hazm bo'lishiga va qorinda yog' to'planmasligiga yordam beradi.",
        "exercises": ["vacuum"],
        "steps": [
            "1️⃣ <b>10 daqiqalik piyoda yurish</b> — Ovqatdan so'ng darhol o'tirmang, xona bo'ylab yoki ko'chada biroz yuring.",
            "2️⃣ <b>Qorin vakuum mashqi</b> — 3 marta (Chuqur nafas chiqarib, qorinni ichga torting va 10 sekund ushlab turing).",
            "3️⃣ <b>Devorga suyangan holda o'tirish (Wall sit)</b> — 30-45 sekund (Son va oyoq mushaklari uchun ajoyib statik mashq).",
            "4️⃣ <b>Qo'llar va orqa mushaklarini cho'zish</b> — 2 daqiqa (Stolda uzoq o'tirganda orqa charchog'ini yozish).",
            "5️⃣ <b>Boldirlarni ko'tarish (Calf raises)</b> — 25 marta (Oyoq uchida ko'tarilib-tushish).",
        ],
        "tip": "💡 <i>Tushlikdan keyin kamida 1 soat gazli yoki shirin ichimliklar ichmang!</i>"
    },
    "evening": {
        "title": "🌆 Kechqurungi Yog' Yoqish Mashqi (Kardio & Tonus)",
        "duration": "15-20 daqiqa",
        "calories": "~150-200 kkal",
        "description": "Kechki asosiy mashg'ulot. Kun davomida qabul qilingan kaloriyalarni yoqish va uyqu paytida ham metabolizmni yuqori ushlab turish uchun mo'ljallangan.",
        "exercises": ["jumping_jacks", "squats", "pushups", "mountain_climbers", "plank"],
        "steps": [
            "1️⃣ <b>Jumping Jacks (Qo'llarni yoyib sakrash)</b> — 45 sekund (Tanani qizdirish).",
            "2️⃣ <b>Chuqur squats (O'tirib-turish)</b> — 20 marta.",
            "3️⃣ <b>Tizzada yoki to'liq qo'llarni bukib yozish (Push-ups)</b> — 12-15 marta.",
            "4️⃣ <b>Tog'chilar (Mountain Climbers)</b> — 30 sekund (Plank holatida tizzalarni ko'krakka tortish).",
            "5️⃣ <b>Plank</b> — 45-60 sekund.",
            "6️⃣ <b>Cho'zilish va nafas rostlash</b> — 2 daqiqa.",
        ],
        "tip": "💡 <i>Bu mashqlarni 2 yoki 3 doira qilib bajarsangiz, natijasi 2 barobar tezroq bo'ladi!</i>"
    },
    "abs": {
        "title": "🔥 Qorin Yog'larini Eritish (Press Mashqlari)",
        "duration": "12 daqiqa",
        "calories": "~100 kkal",
        "description": "Qorin sohasidagi ortiqcha yog'larni yo'qotish va qorinni qotirish uchun maxsus mashqlar.",
        "exercises": ["plank", "vacuum"],
        "steps": [
            "1️⃣ <b>Klassik oyoq ko'tarish (Leg Raises)</b> — 15 marta (Pastki qorin uchun).",
            "2️⃣ <b>Burilishlar (Russian Twists)</b> — 20 marta (Bel qismini ingichkalashtirish).",
            "3️⃣ <b>Plank</b> — 60 sekund.",
            "4️⃣ <b>Qorin vakuum mashqi</b> — 4 marta 15 sekunddan.",
            "5️⃣ <b>Qaychi mashqi (Scissors)</b> — 30 sekund.",
        ],
        "tip": "💡 <i>Press mashqlari bilan birga kechqurun shirinlik va xamir ovqatlardan tiyilsangiz, qorin tezda yo'qoladi!</i>"
    }
}


def format_exercise_detail(key: str) -> str:
    ex = EXERCISE_DETAILS.get(key)
    if not ex:
        return ""
    return (
        f'<a href="{ex["img"]}">&#8203;</a>'
        f'🏋️ <b>{ex["name"]}</b>\n\n'
        f'🎯 <b>Qayerga ishlaydi:</b> {ex["target"]}\n'
        f'🔢 <b>Me\'yori:</b> <b>{ex["reps"]}</b>\n\n'
        f'━━━━━━━━━━━━━━━━━━━━━\n'
        f'🧍‍♂️ <b>1. QANDAY TURISH KERAK? (Boshlang\'ich holat):</b>\n'
        f'{ex["how_to_stand"]}\n\n'
        f'🎬 <b>2. QANDAY HARAKAT QILINADI? (Oson qoida):</b>\n'
        f'{ex["how_to_move"]}\n\n'
        f'💨 <b>3. NAFAS OLISH SIRI (Eng muhimi!):</b>\n'
        f'{ex["breathing"]}\n\n'
        f'❌ <b>4. YOSH BOLA HAM QILMAYDIGAN XATOLAR:</b>\n'
        f'{ex["mistakes"]}\n\n'
        f'💡 <b>Murabbiy maslahati:</b>\n<i>{ex["pro_tip"]}</i>\n'
        f'━━━━━━━━━━━━━━━━━━━━━'
    )
