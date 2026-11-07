export function mainKeyboard(isOwner = false, activeMode = 'user') {
  if (isOwner && activeMode === 'owner') {
    return {
      keyboard: [
        [
          { text: "📊 Bot Statistikasi" },
          { text: "👥 Foydalanuvchilar" }
        ],
        [
          { text: "📢 Xabar Yuborish" },
          { text: "⏰ Eslatmalarni Sinash" }
        ],
        [
          { text: "🔍 Foydalanuvchini Qidirish" },
          { text: "🎁 Bonus XP Berish" }
        ],
        [
          { text: "👤 Shaxsiy Natijalarim" },
          { text: "🧪 Test Reset (Profilni tozalash)" }
        ],
        [
          { text: "🔄 Mijoz rejimiga o'tish" }
        ]
      ],
      resize_keyboard: true
    };
  }

  // Oddiy mijoz klaviaturasi
  const rows = [
    [
      { text: "🏃 Mashqlar" },
      { text: "🥗 Taomnoma & Kaloriya" }
    ],
    [
      { text: "💧 Suv hisobi" },
      { text: "👟 Qadamlar nazorati" }
    ],
    [
      { text: "⚖️ Vazn & O'lchamlar" },
      { text: "📊 Natijalarim (Statistika)" }
    ],
    [
      { text: "🏆 21 Kunlik Marafon" },
      { text: "🥇 Liderlar Reytingi" }
    ],
    [
      { text: "🔥 Kaloriya Yoqish" },
      { text: "⏱️ Fitnes Taymer" }
    ],
    [
      { text: "💡 Motivatsiya & Maslahat" },
      { text: "🍹 Detoks Ichimliklar" }
    ],
    [
      { text: "✨ Ideal Vazn Kalkulyatori" },
      { text: "🎁 Yutuqlar & Medallar" }
    ],
    [
      { text: "👤 Profil & BMI" },
      { text: "👥 Do'stlarni taklif qilish" }
    ]
  ];

  // Agar owner bo'lsa, mijoz rejimida turganida ham orqaga qaytish tugmasi chiqadi
  if (isOwner) {
    rows.push([{ text: "👑 Owner Paneliga O'tish" }]);
  }

  return {
    keyboard: rows,
    resize_keyboard: true
  };
}

export function genderInline() {
  return {
    inline_keyboard: [
      [
        { text: "👨 Erkak", callback_data: "gender_erkak" },
        { text: "👩 Ayol", callback_data: "gender_ayol" }
      ]
    ]
  };
}

export function workoutsInline() {
  return {
    inline_keyboard: [
      [{ text: "🌅 Ertalabki badantarbiya (10 daq)", callback_data: "wo_morning" }],
      [{ text: "☀️ Tushlikdagi faollik (10 daq)", callback_data: "wo_lunch" }],
      [{ text: "🌆 Kechqurungi yog' yoqish (20 daq)", callback_data: "wo_evening" }],
      [{ text: "🔥 Qorin yog'larini eritish (Press)", callback_data: "wo_abs" }],
      [
        { text: "🍑 Dumba & Son (Ayollar)", callback_data: "wo_women_glutes" },
        { text: "⏳ Nozik Bel (Ayollar)", callback_data: "wo_women_waist" }
      ],
      [
        { text: "💪 Ko'krak & Qo'l (Erkaklar)", callback_data: "wo_men_chest" },
        { text: "⚡ HIIT Kardio (Erkaklar)", callback_data: "wo_men_hiit" }
      ],
      [{ text: "⚡ Fitnes Tayyorgarlik Testi", callback_data: "fitness_level_test" }],
      [{ text: "⏱ 45 sekundlik Plank Taymeri", callback_data: "timer_plank" }]
    ]
  };
}

export function workoutDoneInline(key, exercises = []) {
  const keyboard = [
    [{ text: "📖 Barcha mashqlarni rasmli o'rganish ➡️", callback_data: `wo_step_${key}_0` }]
  ];

  const EX_NAMES = {
    squats: "🦵 Squats (O'tirib-turish)",
    plank: "🧱 Plank (Planka)",
    vacuum: "🌀 Qorin vakuumi",
    pushups: "💪 Push-ups (Otjimaniye)",
    jumping_jacks: "⭐ Jumping Jacks",
    mountain_climbers: "🧗 Tog'chilar",
    glute_bridge: "🍑 Dumba ko'prigi",
    donkey_kicks: "🐴 Donkey kicks",
    russian_twists: "🌪 Russian twists",
    leg_raises: "🔺 Oyoq ko'tarish",
    wall_sit: "🪑 Devorga suyanish",
    bicycle_crunch: "🚴 Velosiped press",
    burpee: "🔥 Byorpi",
    calf_raises: "🦶 Boldirlar",
    side_plank: "📐 Yon planka",
    dips: "🪑 Dips (Triseps)"
  };

  for (let i = 0; i < exercises.length; i += 2) {
    const row = [];
    const ex1 = exercises[i];
    row.push({ text: `👁 ${EX_NAMES[ex1] || ex1}`, callback_data: `ex_view_${key}_${ex1}` });
    if (i + 1 < exercises.length) {
      const ex2 = exercises[i + 1];
      row.push({ text: `👁 ${EX_NAMES[ex2] || ex2}`, callback_data: `ex_view_${key}_${ex2}` });
    }
    keyboard.push(row);
  }

  keyboard.push([
    { text: "⏱ 45s Plank Taymeri", callback_data: "timer_plank" },
    { text: "✅ Mashqni bajardim (+20 XP)", callback_data: `done_${key}` }
  ]);
  keyboard.push([{ text: "◀️ Mashg'ulotlar ro'yxatiga", callback_data: "wo_back" }]);

  return { inline_keyboard: keyboard };
}

export function exerciseStepInline(workoutKey, exercises, currentIndex) {
  const navRow = [];
  if (currentIndex > 0) {
    navRow.push({ text: "⬅️ Oldingi", callback_data: `wo_step_${workoutKey}_${currentIndex - 1}` });
  }
  if (currentIndex < exercises.length - 1) {
    navRow.push({ text: "Keyingi ➡️", callback_data: `wo_step_${workoutKey}_${currentIndex + 1}` });
  }

  const keyboard = [];
  if (navRow.length > 0) keyboard.push(navRow);

  keyboard.push([
    { text: "⏱ 30 soniya taymer", callback_data: "timer_quick_30" },
    { text: "⏱ 45 soniya taymer", callback_data: "timer_quick_45" }
  ]);
  keyboard.push([
    { text: "📋 To'liq ro'yxatga qaytish", callback_data: `wo_${workoutKey}` }
  ]);

  return { inline_keyboard: keyboard };
}

export function singleExerciseInline(workoutKey) {
  return {
    inline_keyboard: [
      [
        { text: "⏱ 30 sek taymer", callback_data: "timer_quick_30" },
        { text: "⏱ 60 sek taymer", callback_data: "timer_quick_60" }
      ],
      [
        { text: "◀️ Mashg'ulotga qaytish", callback_data: `wo_${workoutKey || 'morning'}` }
      ]
    ]
  };
}

export function waterInline() {
  return {
    inline_keyboard: [
      [
        { text: "💧 +250 ml (1 stakan)", callback_data: "water_add_250" },
        { text: "💧 +500 ml (0.5 l)", callback_data: "water_add_500" }
      ],
      [
        { text: "💧 +1000 ml (1 litr)", callback_data: "water_add_1000" }
      ],
      [
        { text: "🔔 Suv ichish tartibi va vaqti", callback_data: "water_schedule_info" }
      ]
    ]
  };
}

export function caloriesMenuInline() {
  return {
    inline_keyboard: [
      [{ text: "🍽 O'zbek taomlari kaloriyasi", callback_data: "cal_food_list" }],
      [{ text: "🔍 Taom qidirish / Kaloriyasini bilish", callback_data: "food_search_prompt" }],
      [{ text: "📋 7 Kunlik Fitnes Menyusi (Ratsion)", callback_data: "diet_day_1" }],
      [{ text: "➕ Yegan ovqatingizni kiritish", callback_data: "cal_add_prompt" }],
      [{ text: "📊 Bugungi kaloriya hisoboti", callback_data: "cal_today_stats" }],
      [{ text: "📖 Taomnoma qoidalari", callback_data: "diet_menu_show" }]
    ]
  };
}

export function foodCategoriesInline() {
  return {
    inline_keyboard: [
      [
        { text: "🍚 Palov (650 kkal)", callback_data: "food_osh" },
        { text: "🥟 Somsa (320 kkal)", callback_data: "food_somsa_gosht" }
      ],
      [
        { text: "🥟 Manti (160 kkal)", callback_data: "food_manti" },
        { text: "🍜 Lag'mon (520 kkal)", callback_data: "food_lagmon" }
      ],
      [
        { text: "🥩 Shashlik (230 kkal)", callback_data: "food_shashlik_kuskovoy" },
        { text: "🍲 Sho'rva (290 kkal)", callback_data: "food_shorva" }
      ],
      [
        { text: "🥖 Non (240 kkal)", callback_data: "food_non_obi" },
        { text: "🥗 Achchiq-chuchuk (45 kkal)", callback_data: "food_achchiq_chuchuk" }
      ],
      [{ text: "◀️ Orqaga", callback_data: "cal_back" }]
    ]
  };
}

export function dietInline() {
  return {
    inline_keyboard: [
      [{ text: "🍳 Foydali Nonushta", callback_data: "diet_breakfast" }],
      [{ text: "🍲 To'g'ri Tushlik", callback_data: "diet_lunch" }],
      [{ text: "🥗 Yengil Kechki Ovqat", callback_data: "diet_dinner" }],
      [{ text: "🚫 Nimalardan tiyilish kerak?", callback_data: "diet_forbidden" }],
      [{ text: "◀️ Orqaga", callback_data: "cal_back" }]
    ]
  };
}

export function weeklyDietMenuInline(activeDay = 1) {
  const days = [
    { num: 1, label: "1-Dush" },
    { num: 2, label: "2-Sesh" },
    { num: 3, label: "3-Chor" },
    { num: 4, label: "4-Pay" },
    { num: 5, label: "5-Jum" },
    { num: 6, label: "6-Shan" },
    { num: 7, label: "7-Yak" }
  ];

  const row1 = days.slice(0, 4).map(d => ({
    text: d.num === activeDay ? `🔘 ${d.label}` : d.label,
    callback_data: `diet_day_${d.num}`
  }));
  const row2 = days.slice(4, 7).map(d => ({
    text: d.num === activeDay ? `🔘 ${d.label}` : d.label,
    callback_data: `diet_day_${d.num}`
  }));

  return {
    inline_keyboard: [
      row1,
      row2,
      [{ text: "◀️ Orqaga (Taomnoma)", callback_data: "cal_back" }]
    ]
  };
}

export function stepsInline() {
  return {
    inline_keyboard: [
      [
        { text: "👟 +3 000 qadam", callback_data: "step_add_3000" },
        { text: "👟 +5 000 qadam", callback_data: "step_add_5000" }
      ],
      [
        { text: "👟 +8 000 qadam", callback_data: "step_add_8000" },
        { text: "🏆 +10 000 qadam", callback_data: "step_add_10000" }
      ],
      [{ text: "✏️ Aniq raqam kiritish", callback_data: "step_prompt" }]
    ]
  };
}

export function weightAndMeasureInline() {
  return {
    inline_keyboard: [
      [
        { text: "⚖️ Vaznni yangilash", callback_data: "weight_prompt" },
        { text: "📏 Bo'yni yangilash", callback_data: "height_prompt" }
      ],
      [
        { text: "📐 Bel aylanmasi (sm)", callback_data: "measure_prompt" },
        { text: "📈 Vazn Grafigi (ASCII)", callback_data: "stat_weight_chart" }
      ],
      [
        { text: "📋 O'zgarishlar tarixi", callback_data: "measure_history" }
      ]
    ]
  };
}

export function profileInline() {
  return {
    inline_keyboard: [
      [
        { text: "⚖️ Vaznni o'zgartirish", callback_data: "weight_prompt" },
        { text: "📏 Bo'yni o'zgartirish", callback_data: "height_prompt" }
      ],
      [
        { text: "📈 Vazn Dinamikasi Grafigi", callback_data: "stat_weight_chart" }
      ]
    ]
  };
}

export function reminderMeasureInline(timeLabel) {
  return {
    inline_keyboard: [
      [
        { text: `⚖️ ${timeLabel} vaznni kiritish`, callback_data: "weight_prompt" },
        { text: "📏 Bo'yni yangilash", callback_data: "height_prompt" }
      ]
    ]
  };
}

export function challengeInline(dayNumber, isCompleted) {
  const btn = isCompleted
    ? [{ text: "✅ Bugungi topshiriq bajarilgan (+50 XP)", callback_data: "challenge_already" }]
    : [{ text: "🔥 Topshiriqni bajardim (+50 XP)", callback_data: `challenge_done_${dayNumber}` }];

  return {
    inline_keyboard: [
      btn,
      [{ text: "🗓 Barcha 21 kunlik reja", callback_data: "challenge_all" }]
    ]
  };
}

export function detoxInline() {
  return {
    inline_keyboard: [
      [{ text: "🍋 Sassi Suvi (Qorin erituvchi)", callback_data: "drink_sassi" }],
      [{ text: "🥛 Kefir va Dolchin (Tungi yog' yoquvchi)", callback_data: "drink_kefir_cinnamon" }],
      [{ text: "🍵 Yashil Choy & Zanjabil (Metabolizm)", callback_data: "drink_ginger_tea" }],
      [{ text: "🌱 Chia Urug'i va Limonli Suv", callback_data: "drink_chia_lemon" }]
    ]
  };
}

export function burnCalorieInline() {
  return {
    inline_keyboard: [
      [
        { text: "🍚 1 porsiya Osh (650 kkal)", callback_data: "burn_osh" },
        { text: "🥟 1 dona Somsa (320 kkal)", callback_data: "burn_somsa" }
      ],
      [
        { text: "🍫 1 ta Shokolad (250 kkal)", callback_data: "burn_chocolate" },
        { text: "🥤 Gazli ichimlik 0.5l (210 kkal)", callback_data: "burn_soda" }
      ],
      [
        { text: "🍔 Fastfud burger (550 kkal)", callback_data: "burn_burger" },
        { text: "🥟 4 dona Manti (640 kkal)", callback_data: "burn_manti" }
      ],
      [
        { text: "✏️ O'zingiz kaloriya kiritish", callback_data: "burn_custom_prompt" }
      ]
    ]
  };
}

export function fitnessTimerInline() {
  return {
    inline_keyboard: [
      [
        { text: "⏱ 30 soniya Plank", callback_data: "timer_run_30" },
        { text: "⏱ 45 soniya Plank", callback_data: "timer_run_45" }
      ],
      [
        { text: "⏱ 60 soniya Plank (Usta)", callback_data: "timer_run_60" },
        { text: "⏱ 90 soniya Plank (Chempion)", callback_data: "timer_run_90" }
      ],
      [
        { text: "🔥 4 daqiqalik Tabata protokoli", callback_data: "timer_tabata_info" }
      ],
      [
        { text: "🧘 Vakuum mashqi (Qorin tortish)", callback_data: "timer_vacuum_info" }
      ]
    ]
  };
}

export function leaderboardInline() {
  return {
    inline_keyboard: [
      [{ text: "🔄 Reytingni yangilash", callback_data: "leaderboard_refresh" }]
    ]
  };
}

export function statsOwnerChoiceInline() {
  return {
    inline_keyboard: [
      [{ text: "📊 Botning Barcha Statistikasi (Owner Dashboard)", callback_data: "stat_bot_global" }],
      [{ text: "👤 Mening Shaxsiy Natijalarim", callback_data: "stat_personal" }],
      [{ text: "📈 Shaxsiy Vazn Grafigi (ASCII)", callback_data: "stat_weight_chart" }]
    ]
  };
}

export function personalStatsInline() {
  return {
    inline_keyboard: [
      [
        { text: "⚖️ Vazn kiritish", callback_data: "weight_prompt" },
        { text: "💧 Suv kiritish", callback_data: "water_add_250" }
      ],
      [
        { text: "📈 Vazn Grafigi", callback_data: "stat_weight_chart" },
        { text: "🔄 Yangilash", callback_data: "stat_personal_refresh" }
      ]
    ]
  };
}

// ===================== OWNER INLINE KEYBOARDS =====================
export function ownerReminderTestInline() {
  return {
    inline_keyboard: [
      [{ text: "🌅 05:00 Ertalabki eslatmani o'zimga yuborish", callback_data: "owner_test_05" }],
      [{ text: "🌙 21:00 Kechki eslatmani o'zimga yuborish", callback_data: "owner_test_21" }],
      [{ text: "📢 Barcha foydalanuvchilarga yuborish (Sinov)", callback_data: "owner_test_all" }]
    ]
  };
}

export function ownerResetConfirmInline() {
  return {
    inline_keyboard: [
      [{ text: "✅ Ha, profilimni tozalash (Reset)", callback_data: "owner_reset_confirm" }],
      [{ text: "❌ Bekor qilish", callback_data: "owner_reset_cancel" }]
    ]
  };
}

export function idealWeightInline() {
  return {
    inline_keyboard: [
      [{ text: "📊 Ideal vaznimni to'liq hisoblash", callback_data: "calc_ideal_weight" }],
      [{ text: "🔥 Taomlar va mashqlar mutanosibligi", callback_data: "cal_burn_guide" }],
      [{ text: "🥗 7 Kunlik Fitnes Menyusi", callback_data: "diet_day_1" }]
    ]
  };
}

export function achievementsInline() {
  return {
    inline_keyboard: [
      [{ text: "🏆 21 Kunlik Marafon topshiriqlari", callback_data: "chal_menu" }],
      [{ text: "🥇 Liderlar reytingini ko'rish", callback_data: "leaderboard_show" }]
    ]
  };
}

export function shareBotInline(botUsername, userTgId) {
  const refLink = `https://t.me/${botUsername || 'fitnesuzb_bot'}?start=ref_${userTgId}`;
  const shareText = encodeURIComponent(`Salom! Men FitnesBot orqali vaznimni nazorat qilib, mashqlar qilyapman. Har kuni 05:00 va 21:00 da eslatadi, mashqlarni yosh bolaga ham tushunarli qilib o'rgatadi. Sen ham qo'shil va birga ozamiz! 🏃💪\n\n${refLink}`);
  return {
    inline_keyboard: [
      [{ text: "🚀 Telegramda do'stga ulashish (+50 XP)", url: `https://t.me/share/url?url=${refLink}&text=${shareText}` }],
      [{ text: "🏆 21 Kunlik Marafonga qo'shilish", callback_data: "chal_menu" }]
    ]
  };
}

export function quickTimerInline(seconds) {
  return {
    inline_keyboard: [
      [
        { text: "⏱ 30s", callback_data: "timer_quick_30" },
        { text: "⏱ 45s", callback_data: "timer_quick_45" },
        { text: "⏱ 60s", callback_data: "timer_quick_60" }
      ],
      [{ text: "◀️ Mashqlar bo'limiga", callback_data: "wo_back" }]
    ]
  };
}
