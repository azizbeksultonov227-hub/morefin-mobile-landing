export const LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

// where the landing lives and where every "start" button leads
export const SITE_URL = "https://morefin.uz";
export const APP_URL = "https://app.morefin.uz/";
export const pageUrl = (l: Locale) => (l === "uz" ? `${SITE_URL}/` : `${SITE_URL}/${l}`);
export const path = (l: Locale) => (l === "uz" ? "/" : `/${l}`);

// countries whose people mostly read Russian; Uzbekistan and unknown stay Uzbek, the rest get English
const RU = new Set(["RU", "KZ", "KG", "TJ", "BY", "TM", "AZ", "AM", "MD"]);
export const countryLocale = (c: string | null): Locale => (!c || c === "UZ" || c === "XX" || c === "T1" ? "uz" : RU.has(c) ? "ru" : "en");

// the share each rule takes from an income; the figures illustrate the calculation, they are not customer data
export const RULES = { partner: 0.2, kpi: 0.05, tax: 0.04 } as const;

const uz = {
  name: "O‘zbekcha",
  meta: {
    title: "Morefin — biznes moliyasi avtomatik hisoblanadi",
    description: "Kirim tushishi bilan sof foyda, sherik ulushi, KPI va soliq avtomatik hisoblanadi. Xarajatlar, qarzlar va rejalar — bitta joyda.",
  },
  signIn: "Kirish",
  start: "Bepul sinab ko‘rish",
  h1a: "Shuncha pul qayerga ketdi?",
  h1b: "Endi aniq bilasiz.",
  card: "Morefin kirimni shunday hisoblaydi:",
  rows: { income: "Kirim", partner: "Sherik ulushi", kpi: "KPI", tax: "Soliq", net: "Sof foyda" },
  tryIt: "Bosib ko‘ring — yangi kirim tushadi.",
  lead: "Kirim bo‘lishi bilan sof foyda avtomatik hisoblanadi. 95% qo‘l mehnatidan ozod bo‘lasiz.",
  currency: "so‘m",
  methods: ["Click", "Naqd", "Bank", "Payme"],

  flow: {
    title: "Kirim bo‘lishi bilan sof foyda avtomatik hisoblanadi.",
    subtitle: "95% qo‘l mehnatidan ozod bo‘lasiz.",
    steps: ["Kirim", "Qoidalar o‘zi ishlaydi", "Natija"],
    incoming: "Kirim tushdi",
    waiting: "Kirim kutilmoqda",
    when: "Bugun, 14:32",
    sale: "Sotuv",
    methods: ["Click", "Naqd", "Bank"],
    swipe: "Boshqa kirimni ko‘rish uchun suring",
    previous: "Oldingi kirim",
    next: "Keyingi kirim",
    rules: {
      share: { name: "Ulush", detail: "Sherik ulushi" },
      tax: { name: "Soliq", detail: "Aylanma solig‘i" },
      kpi: { name: "KPI", detail: "Sotuvchi bonusi" },
      fee: { name: "Xarajat", detail: "Ijara, reklama va boshqalar" },
    },
    net: "Sof foyda",
    split: "Pul qayerga ketdi",
    done: "Hammasi hisoblandi",
    statCaption: "hisob-kitob o‘zi bajariladi",
    manual: "Qo‘lda",
  },

  aiTitle: "Chekni rasmga oling — qolganini AI o‘qiydi.",
  aiText: "Summa va toifani Morefin o‘zi ajratadi. Oxirgi qaror sizniki: tasdiqlamaguningizcha hech narsa saqlanmaydi.",
  receipt: "XARID CHEKI",
  receiptItems: [["Non", 8000], ["Sut", 14000], ["Mevalar", 46000]] as [string, number][],
  total: "Jami",
  aiRead: "Chek o‘qildi",
  aiFields: { amount: "Summa", category: "Toifa", account: "Hisob" },
  aiCategory: "Oziq-ovqat",
  aiAccount: "Naqd pul",
  confirm: "Tasdiqlash",
  aiSaved: "Xarajat saqlandi. Qoldiq va hisobot yangilandi.",
  now: "hozir",

  moreTitle: "Hammasi bir joyda.",
  more: [
    { tag: "Qarzdorlar", text: "Sizdan kimlarning qarzi bor, siz kimlardan qarzsiz — hammasi bitta ekranda. To‘lov kuni kelsa, kimga qancha to‘lash kerakligi tayyor." },
    { tag: "Reja", text: "Sotuv va xarajat planini qo‘yasiz — Morefin necha foiz bajarilganini va nolga chiqish nuqtasini o‘zi hisoblaydi." },
    { tag: "Hisobot", text: "Kirim, chiqim va foyda oyma-oy. Biznesingiz qaysi tomonga ketayotganini bir qarashda ko‘rasiz." },
  ],

  ctaTitle: "Moliyani xatosiz boshqaring.",
  ctaText: "Morefin AI bilan moliyangizni avtomatlashtiring.",
};

export type Dict = typeof uz;

const ru: Dict = {
  name: "Русский",
  meta: {
    title: "Morefin — финансы бизнеса считаются сами",
    description: "Как только приходит доход, чистая прибыль, доля партнёра, KPI и налог считаются автоматически. Расходы, долги и планы — в одном месте.",
  },
  signIn: "Войти",
  start: "Попробовать бесплатно",
  h1a: "Куда ушло столько денег?",
  h1b: "Теперь вы знаете точно.",
  card: "Так Morefin считает доход:",
  rows: { income: "Доход", partner: "Доля партнёра", kpi: "KPI", tax: "Налог", net: "Чистая прибыль" },
  tryIt: "Нажмите — придёт новый доход.",
  lead: "Как только приходит доход, чистая прибыль считается автоматически. Вы избавляетесь от 95% ручной работы.",
  currency: "сум",
  methods: ["Click", "Наличные", "Банк", "Payme"],

  flow: {
    title: "Как только приходит доход, чистая прибыль считается автоматически.",
    subtitle: "Вы избавляетесь от 95% ручной работы.",
    steps: ["Доход", "Правила работают сами", "Итог"],
    incoming: "Поступил доход",
    waiting: "Ожидаем доход",
    when: "Сегодня, 14:32",
    sale: "Продажа",
    methods: ["Click", "Наличные", "Банк"],
    swipe: "Проведите, чтобы выбрать другой доход",
    previous: "Предыдущий доход",
    next: "Следующий доход",
    rules: {
      share: { name: "Доля", detail: "Доля партнёра" },
      tax: { name: "Налог", detail: "Налог с оборота" },
      kpi: { name: "KPI", detail: "Бонус продавца" },
      fee: { name: "Расходы", detail: "Аренда, реклама и прочее" },
    },
    net: "Чистая прибыль",
    split: "Куда ушли деньги",
    done: "Всё рассчитано",
    statCaption: "расчётов выполняется само",
    manual: "Вручную",
  },

  aiTitle: "Сфотографируйте чек — остальное прочитает AI.",
  aiText: "Morefin сам распознаёт сумму и категорию. Решение за вами: без вашего подтверждения ничего не сохранится.",
  receipt: "ТОВАРНЫЙ ЧЕК",
  receiptItems: [["Хлеб", 8000], ["Молоко", 14000], ["Фрукты", 46000]],
  total: "Итого",
  aiRead: "Чек распознан",
  aiFields: { amount: "Сумма", category: "Категория", account: "Счёт" },
  aiCategory: "Продукты",
  aiAccount: "Наличные",
  confirm: "Подтвердить",
  aiSaved: "Расход сохранён. Остаток и отчёт обновлены.",
  now: "сейчас",

  moreTitle: "Всё в одном месте.",
  more: [
    { tag: "Долги", text: "Кто должен вам и кому должны вы — на одном экране. Настал день платежа — кому и сколько платить, уже готово." },
    { tag: "План", text: "Ставите план продаж и расходов — Morefin сам считает процент выполнения и точку безубыточности." },
    { tag: "Отчёт", text: "Доходы, расходы и прибыль по месяцам. С одного взгляда видно, куда движется бизнес." },
  ],

  ctaTitle: "Управляйте финансами без ошибок.",
  ctaText: "Автоматизируйте финансы с Morefin AI.",
};

const en: Dict = {
  name: "English",
  meta: {
    title: "Morefin — business finance that does the maths",
    description: "The moment income arrives, net profit, partner shares, KPI and tax are calculated automatically. Expenses, debts and plans in one place.",
  },
  signIn: "Log in",
  start: "Try it free",
  h1a: "Where did all that money go?",
  h1b: "Now you know.",
  card: "This is how Morefin counts an income:",
  rows: { income: "Income", partner: "Partner share", kpi: "KPI", tax: "Tax", net: "Net profit" },
  tryIt: "Tap anywhere — a new income arrives.",
  lead: "The moment income arrives, net profit is calculated automatically. You are freed from 95% of the manual work.",
  currency: "UZS",
  methods: ["Click", "Cash", "Bank", "Payme"],

  flow: {
    title: "The moment income arrives, net profit is calculated automatically.",
    subtitle: "You are freed from 95% of the manual work.",
    steps: ["Income", "Rules run themselves", "Result"],
    incoming: "Income received",
    waiting: "Waiting for income",
    when: "Today, 14:32",
    sale: "Sale",
    methods: ["Click", "Cash", "Bank"],
    swipe: "Swipe to try another income",
    previous: "Previous income",
    next: "Next income",
    rules: {
      share: { name: "Share", detail: "Partner’s share" },
      tax: { name: "Tax", detail: "Turnover tax" },
      kpi: { name: "KPI", detail: "Seller bonus" },
      fee: { name: "Expenses", detail: "Rent, ads and the rest" },
    },
    net: "Net profit",
    split: "Where the money went",
    done: "Everything calculated",
    statCaption: "of the calculation runs itself",
    manual: "Manual",
  },

  aiTitle: "Snap the receipt — AI reads the rest.",
  aiText: "Morefin picks out the amount and the category. You have the final say: nothing is saved until you confirm.",
  receipt: "PURCHASE RECEIPT",
  receiptItems: [["Bread", 8000], ["Milk", 14000], ["Fruit", 46000]],
  total: "Total",
  aiRead: "Receipt read",
  aiFields: { amount: "Amount", category: "Category", account: "Account" },
  aiCategory: "Groceries",
  aiAccount: "Cash",
  confirm: "Confirm",
  aiSaved: "Expense saved. Balance and report updated.",
  now: "now",

  moreTitle: "Everything in one place.",
  more: [
    { tag: "Debts", text: "Who owes you and whom you owe — on one screen. When a payment is due, whom to pay and how much is ready." },
    { tag: "Plan", text: "Set a sales and an expense plan — Morefin works out the progress and the break-even point by itself." },
    { tag: "Reports", text: "Income, expenses and profit month by month. See where your business is heading at a glance." },
  ],

  ctaTitle: "Manage your finances without mistakes.",
  ctaText: "Automate your finances with Morefin AI.",
};

export const DICT: Record<Locale, Dict> = { uz, ru, en };

/** "12 000 000" — spaces between thousands, the way amounts are written here. */
export const money = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/ | /g, " ");
