export const FOOD_DATABASE = [
  // O'zbek milliy taomlari
  { id: "osh", name: "To'y oshi / Palov (1 likopcha, ~350g)", serving: "350g", calories: 650, protein: "22g", fat: "28g", carbs: "75g", note: "Sabzisi ko'proq, go'shti yog'siz qismidan yeyilsa foydaliroq." },
  { id: "somsa_gosht", name: "Go'shtli somsa (1 dona, ~120g)", serving: "120g", calories: 320, protein: "12g", fat: "18g", carbs: "28g", note: "Xamiri qatlama va yog'li bo'lgani sabab haftada 1 martadan oshirmang." },
  { id: "somsa_qovoq", name: "Qovoqli somsa (1 dona, ~120g)", serving: "120g", calories: 210, protein: "5g", fat: "8g", carbs: "30g", note: "Ajoyib kletchatka manbai, go'shtlisiga qaraganda ancha yengil." },
  { id: "manti", name: "Go'shtli manti (1 dona, ~80g)", serving: "80g", calories: 160, protein: "7g", fat: "8g", carbs: "15g", note: "Bug'da pishgani uchun qovurilgan taomlarga qaraganda foydali." },
  { id: "shashlik_qiyma", name: "Qiyma shashlik (1 six, ~100g)", serving: "100g", calories: 280, protein: "18g", fat: "22g", carbs: "2g", note: "Dumbasi kamroq qismini tanlang." },
  { id: "shashlik_kuskovoy", name: "Kuskovoy go'sht shashlik (1 six, ~100g)", serving: "100g", calories: 230, protein: "24g", fat: "14g", carbs: "0g", note: "Sof oqsil manbai. Ko'p miqdorda piyoz va ko'kat bilan yeyish tavsiya etiladi." },
  { id: "shashlik_tovuq", name: "Tovuq shashlik (1 six, ~100g)", serving: "100g", calories: 170, protein: "26g", fat: "7g", carbs: "0g", note: "Fitnes uchun eng ideal oqsil taomi!" },
  { id: "lagmon", name: "Lag'mon (1 kosa, ~400g)", serving: "400g", calories: 520, protein: "20g", fat: "22g", carbs: "60g", note: "Xamiri ko'p. Kechqurun emas, faqat tushlikda yeyish mumkin." },
  { id: "shorva", name: "Go'shtli sho'rva (1 kosa, ~350g)", serving: "350g", calories: 290, protein: "18g", fat: "15g", carbs: "20g", note: "Iliq sho'rva oshqozonni to'yintiradi va metabolizmni yaxshilaydi." },
  { id: "mastava", name: "Mastava (1 kosa, ~350g)", serving: "350g", calories: 330, protein: "15g", fat: "14g", carbs: "35g", note: "Guruchi kamroq, sabzavotlari ko'proq bo'lsa ayni muddao." },
  { id: "chuchvara", name: "Chuchvara sho'rva (1 kosa)", serving: "350g", calories: 380, protein: "16g", fat: "16g", carbs: "42g", note: "Qatiq va ko'katlar bilan iste'mol qiling." },

  // Non mahsulotlari
  { id: "non_obi", name: "Obi non (chorak qism, ~100g)", serving: "100g", calories: 240, protein: "8g", fat: "1g", carbs: "50g", note: "Oq nonga qaraganda kepakli yoki qora non tavsiya etiladi." },
  { id: "non_patir", name: "Yog'li patir non (100g)", serving: "100g", calories: 340, protein: "8g", fat: "14g", carbs: "46g", note: "Tarkibida sariyog' va sut ko'p, vazn tashlashda kamroq iste'mol qiling." },

  // Salatlar
  { id: "achchiq_chuchuk", name: "Achchiq-chuchuk salat (150g)", serving: "150g", calories: 45, protein: "2g", fat: "1g", carbs: "8g", note: "Zaytun moyi bilan. Yog'larni parchalashga yordam beradi." },
  { id: "olivye", name: "Olivye salat (mayonezli, 150g)", serving: "150g", calories: 290, protein: "7g", fat: "24g", carbs: "12g", note: "Mayonez o'rniga kam yog'li smetana yoki qatiq solish maqsadga muvofiq." },

  // Fitnes & Sog'lom oziq-ovqatlar
  { id: "tuxum", name: "Qaynatilgan tuxum (1 dona)", serving: "55g", calories: 75, protein: "6.5g", fat: "5g", carbs: "0.5g", note: "Ideal nonushta — uzoq vaqt to'q tutadi." },
  { id: "tovuq_file", name: "Qaynatilgan tovuq ko'kragi (100g)", serving: "100g", calories: 165, protein: "31g", fat: "3.6g", carbs: "0g", note: "Eng toza oqsil manbai, mushaklarni saqlab yog' yoqadi." },
  { id: "grechka", name: "Pishirilgan grechka (150g)", serving: "150g", calories: 160, protein: "6g", fat: "2g", carbs: "31g", note: "Sekin hazm bo'luvchi murakkab uglevod, quvvat beradi." },
  { id: "ovsyanka", name: "Suli bo'tqasi / Ovsyanka (200g)", serving: "200g", calories: 140, protein: "5g", fat: "3g", carbs: "24g", note: "Ichaklarni tozalaydi va xolesterinni kamaytiradi." },
  { id: "kefir", name: "Kefir / Qatiq 1.5% (1 stakan, 250ml)", serving: "250ml", calories: 100, protein: "7g", fat: "3.5g", carbs: "10g", note: "Kechqurun uxlashdan oldin ichish hazmni yengillashtiradi." },
  { id: "tvorog", name: "Tvorog 5% (100g)", serving: "100g", calories: 120, protein: "17g", fat: "5g", carbs: "3g", note: "Kazein oqsili tunda mushaklarni tiklaydi va ozdiradi." },
  { id: "olma", name: "Olma (1 dona o'rtacha)", serving: "180g", calories: 80, protein: "0.5g", fat: "0.3g", carbs: "19g", note: "Kletchatka va pektin manbai." },
  { id: "banan", name: "Banan (1 dona)", serving: "120g", calories: 105, protein: "1.3g", fat: "0.3g", carbs: "27g", note: "Mashg'ulotdan 30 daqiqa oldin yoki keyin yeyish tavsiya etiladi." },
  { id: "baliq_sudak", name: "Pechda pishirilgan baliq (150g)", serving: "150g", calories: 150, protein: "28g", fat: "3g", carbs: "0g", note: "Omega-3 va toza oqsil. Yog'siz eng yaxshi kechki ovqat." },

  // Fastfud & Ichimliklar
  { id: "lavash", name: "Lavash / Shourma (1 dona o'rtacha)", serving: "250g", calories: 580, protein: "24g", fat: "26g", carbs: "62g", note: "Sousi va xamiri tufayli juda yuqori kaloriyali." },
  { id: "burger", name: "Fastfud go'shtli burger", serving: "200g", calories: 550, protein: "22g", fat: "29g", carbs: "48g", note: "Trans yog'lar ko'p, ortiqcha vazn keltirib chiqaradi." },
  { id: "cola", name: "Coca-Cola / Gazli ichimlik (0.5 l)", serving: "500ml", calories: 210, protein: "0g", fat: "0g", carbs: "53g", note: "Tarkibida 12 choy qoshiq shakar bor! Qorindagi yog'ning asosiy sababchisi." },
  { id: "choy_shakarli", name: "Shakarli choy (2 qoshiq shakar)", serving: "200ml", calories: 60, protein: "0g", fat: "0g", carbs: "15g", note: "Kuniga 4 stakan shakarli choy = +240 ortiqcha kkal!" }
];

export const FOOD_MAP = Object.fromEntries(FOOD_DATABASE.map(f => [f.id, f]));

export function searchFood(queryText) {
  if (!queryText) return [];
  const q = queryText.toLowerCase().trim();
  return FOOD_DATABASE.filter(f =>
    f.name.toLowerCase().includes(q) ||
    f.id.toLowerCase().includes(q)
  );
}

export function calculateDailyCalorieNeed(weight, height, gender = 'erkak', age = 28) {
  // Mifflin-St Jeor formulasi
  let bmr;
  if (gender === 'ayol') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  }
  const tdee = Math.round(bmr * 1.375);
  const deficitCal = Math.max(1200, tdee - 450);
  return { bmr: Math.round(bmr), tdee, targetCal: deficitCal };
}
