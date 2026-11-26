export const LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);
// each language in its own words, for the language menus (apart from the texts, so the menus do not carry them)
export const NAMES: Record<Locale, string> = { uz: "O‘zbekcha", ru: "Русский", en: "English" };

// where the landing lives and where every "start" button leads
export const SITE_URL = "https://morefin.uz";
export const APP_URL = "https://app.morefin.uz/";
export const pageUrl = (l: Locale) => (l === "uz" ? `${SITE_URL}/` : `${SITE_URL}/${l}`);
// where the site is served from: "" normally, "/<repo>" in the GitHub Pages preview (next.config sets it)
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const path = (l: Locale) => `${BASE}${l === "uz" ? "/" : `/${l}`}`;

// countries whose people mostly read Russian; Uzbekistan and unknown stay Uzbek, the rest get English
const RU = new Set(["RU", "KZ", "KG", "TJ", "BY", "TM", "AZ", "AM", "MD"]);
export const countryLocale = (c: string | null): Locale => (!c || c === "UZ" || c === "XX" || c === "T1" ? "uz" : RU.has(c) ? "ru" : "en");


const uz = {
  meta: {
    title: "Morefin — biznes moliyasi avtomatik hisoblanadi",
    description: "Kirim tushishi bilan sof foyda, sherik ulushi, KPI va soliq avtomatik hisoblanadi. Xarajatlar, qarzlar va rejalar — bitta joyda.",
  },
  signIn: "Kirish",
  start: "Bepul sinab ko‘rish",
  h1a: "Biznes moliyasini xatosiz yuritadigan",
  h1b: "AI xodimingiz",
  learn: { title: "Batafsil ma’lumot", sub: "Qanday ishlashini ko‘ring" },
  // the hero's rotating line: one Morefin AI "employee" at a time, the job it is doing right now
  agents: [
    { role: "Hisobchi", text: "sof foydani hisoblayapti" },
    { role: "Chek o‘quvchi", text: "xarid chekini xarajatga yozyapti" },
    { role: "Ulush bo‘luvchi", text: "sherik ulushini ajratyapti" },
    { role: "KPI hisoblagich", text: "sotuvchilar bonusini yozyapti" },
    { role: "Qarz nazoratchisi", text: "to‘lov kuni yaqin qarzlarni ko‘rsatyapti" },
    { role: "Reja tahlilchisi", text: "oylik plan bajarilishini tekshiryapti" },
    { role: "Hisobotchi", text: "oylik foyda hisobotini tayyorlayapti" },
  ],
  currency: "so‘m",

  flow: {
    title: "Kirim bo‘lishi bilan sof foyda avtomatik hisoblanadi.",
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

  ai: {
    title: "Moliyachi qiladigan ishni Morefin AI bir o‘zi qiladi.",
    steps: ["Biznesingiz", "Morefin AI ishlaydi", "Natija"],
    live: "Jonli",
    month: "Bu oy",
    million: " mln",
    feed: [["Sotuv", 48_000_000], ["Ijara", -6_000_000], ["Maosh", -18_000_000], ["Reklama", -5_600_000]] as [string, number][],
    jobs: {
      answer: { name: "Savollarga javob beradi", detail: "«Foyda qancha?» — 18,4 mln so‘m", short: "Javob" },
      report: { name: "Hisobot tayyorlaydi", detail: "Oylik foyda va zarar tayyor", short: "Hisobot" },
      remind: { name: "Eslatadi", detail: "Ertaga soliq to‘lovi bor", short: "Eslatma" },
      pay: { name: "To‘lovlarni boshqaradi", detail: "Maosh, qarz va ijara nazoratda", short: "To‘lov" },
    },
    work: "Moliyachi ishi",
    split: "Bajarilgan ishlar",
    done: "To‘liq bajarildi",
    always: ["Uxlamaydi", "Kechikmaydi", "Charchamaydi"],
  },
};

export type Dict = typeof uz;

const ru: Dict = {
  meta: {
    title: "Morefin — финансы бизнеса считаются сами",
    description: "Как только приходит доход, чистая прибыль, доля партнёра, KPI и налог считаются автоматически. Расходы, долги и планы — в одном месте.",
  },
  signIn: "Войти",
  start: "Попробовать бесплатно",
  h1a: "Финансы бизнеса без ошибок ведёт",
  h1b: "ваш AI-сотрудник",
  learn: { title: "Подробнее", sub: "Посмотрите, как это работает" },
  agents: [
    { role: "Бухгалтер", text: "считает чистую прибыль" },
    { role: "Чек-ридер", text: "заносит чек покупки в расходы" },
    { role: "Делитель долей", text: "откладывает долю партнёра" },
    { role: "KPI-счётчик", text: "начисляет бонусы продавцам" },
    { role: "Контролёр долгов", text: "показывает долги с близким сроком" },
    { role: "Аналитик плана", text: "проверяет выполнение плана месяца" },
    { role: "Отчётчик", text: "готовит отчёт о прибыли за месяц" },
  ],
  currency: "сум",

  flow: {
    title: "Как только приходит доход, чистая прибыль считается автоматически.",
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

  ai: {
    title: "Всю работу финансиста Morefin AI делает сам.",
    steps: ["Ваш бизнес", "Morefin AI работает", "Итог"],
    live: "Онлайн",
    month: "Этот месяц",
    million: " млн",
    feed: [["Продажи", 48_000_000], ["Аренда", -6_000_000], ["Зарплата", -18_000_000], ["Реклама", -5_600_000]],
    jobs: {
      answer: { name: "Отвечает на вопросы", detail: "«Какая прибыль?» — 18,4 млн сум", short: "Ответы" },
      report: { name: "Готовит отчёты", detail: "Прибыль и убытки за месяц готовы", short: "Отчёты" },
      remind: { name: "Напоминает", detail: "Завтра налоговый платёж", short: "Напоминания" },
      pay: { name: "Управляет платежами", detail: "Зарплата, долги и аренда под контролем", short: "Платежи" },
    },
    work: "Работа финансиста",
    split: "Что сделано",
    done: "Сделано полностью",
    always: ["Не спит", "Не опаздывает", "Не устаёт"],
  },
};

const en: Dict = {
  meta: {
    title: "Morefin — business finance that does the maths",
    description: "The moment income arrives, net profit, partner shares, KPI and tax are calculated automatically. Expenses, debts and plans in one place.",
  },
  signIn: "Log in",
  start: "Try it free",
  h1a: "Business finances without mistakes,",
  h1b: "kept by your AI employee",
  learn: { title: "Learn more", sub: "See how it works" },
  agents: [
    { role: "Accountant", text: "is working out the net profit" },
    { role: "Receipt reader", text: "is filing a purchase receipt as an expense" },
    { role: "Share splitter", text: "is setting aside the partner’s share" },
    { role: "KPI counter", text: "is crediting the sellers’ bonuses" },
    { role: "Debt keeper", text: "is flagging debts that fall due soon" },
    { role: "Plan analyst", text: "is checking this month’s plan" },
    { role: "Reporter", text: "is preparing the monthly profit report" },
  ],
  currency: "UZS",

  flow: {
    title: "The moment income arrives, net profit is calculated automatically.",
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

  ai: {
    title: "Morefin AI does a financier’s whole job on its own.",
    steps: ["Your business", "Morefin AI at work", "Result"],
    live: "Live",
    month: "This month",
    million: "M",
    feed: [["Sales", 48_000_000], ["Rent", -6_000_000], ["Payroll", -18_000_000], ["Ads", -5_600_000]],
    jobs: {
      answer: { name: "Answers questions", detail: "“What’s my profit?” — 18.4M UZS", short: "Answers" },
      report: { name: "Prepares reports", detail: "Monthly profit and loss ready", short: "Reports" },
      remind: { name: "Reminds you", detail: "Tax payment due tomorrow", short: "Reminders" },
      pay: { name: "Manages payments", detail: "Payroll, debts and rent on track", short: "Payments" },
    },
    work: "A financier’s job",
    split: "What got done",
    done: "Fully done",
    always: ["Never sleeps", "Never late", "Never tired"],
  },
};

export const DICT: Record<Locale, Dict> = { uz, ru, en };

/** "12 000 000" — spaces between thousands, the way amounts are written here. */
export const money = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/ | /g, " ");
