import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Language = "en" | "ta";

type TranslationKey =
  | "home"
  | "members"
  | "settings"
  | "shuffle"
  | "admin"
  | "login"
  | "username"
  | "password"
  | "logging_in"
  | "enter_username_password"
  | "live_chit"
  | "track_month"
  | "optimized_mobile"
  | "logout"
  | "now_active"
  | "members_count"
  | "paid"
  | "pending"
  | "winner"
  | "winner_not_selected"
  | "this_month"
  | "paid_members"
  | "pending_members"
  | "marked_paid"
  | "awaiting_payment"
  | "no_payments"
  | "everyone_paid"
  | "timeline"
  | "month_by_month_winners"
  | "no_winner"
  | "delete"
  | "undo"
  | "member_list"
  | "people"
  | "manage_members"
  | "members_in_group"
  | "no_members_group"
  | "add_member"
  | "quick_add_mobile"
  | "name"
  | "phone"
  | "save"
  | "cancel"
  | "edit"
  | "settings_title"
  | "group_controls"
  | "settings_desc"
  | "select_group"
  | "lifecycle"
  | "start_month"
  | "duration"
  | "total_amount"
  | "member_limit"
  | "export"
  | "pdf_report"
  | "export_desc"
  | "export_pdf"
  | "preparing_pdf"
  | "share_whatsapp"
  | "preparing_whatsapp"
  | "move_calendar"
  | "save_start_month"
  | "saving"
  | "close_chit"
  | "end_group"
  | "close_chit_desc"
  | "end_this_chit"
  | "already_ended"
  | "ending"
  | "new_group"
  | "start_next_chit"
  | "new_group_desc"
  | "create_new_group"
  | "creating"
  | "lucky_draw"
  | "shuffle_title"
  | "shuffle_desc"
  | "eligible_members"
  | "current_winner"
  | "not_selected"
  | "shuffle_result"
  | "winner_locked"
  | "shuffling"
  | "winner_selected"
  | "tap_shuffle"
  | "shuffle_winner"
  | "eligible_pool"
  | "members_in_draw"
  | "no_eligible_members"
  | "language"
  | "english"
  | "tamil"
  | "active"
  | "ended";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    home: "Home",
    members: "Members",
    settings: "Settings",
    shuffle: "Shuffle",
    admin: "Admin",
    login: "Login",
    username: "Username",
    password: "Password",
    logging_in: "Logging in...",
    enter_username_password: "Enter username and password",
    live_chit: "Live Chit",
    track_month: "Track this month at a glance",
    optimized_mobile: "Optimized for quick mobile updates during collection.",
    logout: "Logout",
    now_active: "Now Active",
    members_count: "Members",
    paid: "Paid",
    pending: "Pending",
    winner: "Winner",
    winner_not_selected: "No winner selected yet",
    this_month: "This month",
    paid_members: "Paid Members",
    pending_members: "Pending Members",
    marked_paid: "Marked paid",
    awaiting_payment: "Awaiting payment",
    no_payments: "No payments recorded for this month.",
    everyone_paid: "Everyone is paid up for this month.",
    timeline: "Timeline",
    month_by_month_winners: "Month by month winners",
    no_winner: "No winner",
    delete: "Delete",
    undo: "Undo",
    member_list: "People",
    people: "People",
    manage_members: "Keep your member list clean and ready",
    members_in_group: "members added so far",
    no_members_group: "No members in this group yet.",
    add_member: "Add Member",
    quick_add_mobile: "Quick add from mobile",
    name: "Name",
    phone: "Phone",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    settings_title: "Settings",
    group_controls: "Group controls",
    settings_desc: "Change start month, close a chit, or launch the next group.",
    select_group: "Select Group",
    lifecycle: "Lifecycle",
    start_month: "Start Month",
    duration: "Duration",
    total_amount: "Total Amount",
    member_limit: "Member Limit",
    export: "Export",
    pdf_report: "Current month PDF report",
    export_desc: "Export paid, pending, and the current month winner as a print-ready PDF.",
    export_pdf: "Export PDF",
    preparing_pdf: "Preparing PDF...",
    share_whatsapp: "Share to WhatsApp",
    preparing_whatsapp: "Preparing WhatsApp...",
    move_calendar: "Move the chit calendar",
    save_start_month: "Save Start Month",
    saving: "Saving...",
    close_chit: "Close Chit",
    end_group: "End this group",
    close_chit_desc: "Use this when a chit is completed and you want to keep it as history.",
    end_this_chit: "End This Chit",
    already_ended: "This chit is already ended",
    ending: "Ending...",
    new_group: "New Group",
    start_next_chit: "Start the next chit",
    new_group_desc: "Create a fresh group with its own schedule and start month.",
    create_new_group: "Create New Group",
    creating: "Creating...",
    lucky_draw: "Lucky Draw",
    shuffle_title: "Shuffle a winner for the current month",
    shuffle_desc: "Picks from members who have not already won this chit.",
    eligible_members: "Eligible members",
    current_winner: "Current winner",
    not_selected: "Not selected",
    shuffle_result: "Shuffle Result",
    winner_locked: "Winner already locked for this month",
    shuffling: "Shuffling...",
    winner_selected: "Winner selected",
    tap_shuffle: "Tap shuffle to draw a random eligible member.",
    shuffle_winner: "Shuffle Winner",
    eligible_pool: "Eligible Pool",
    members_in_draw: "Members in the draw",
    no_eligible_members: "No eligible members for this month.",
    language: "Language",
    english: "English",
    tamil: "Tamil",
    active: "Active",
    ended: "Ended",
  },
  ta: {
    home: "முகப்பு",
    members: "உறுப்பினர்கள்",
    settings: "அமைப்புகள்",
    shuffle: "குலுக்கு",
    admin: "நிர்வாகி",
    login: "உள்நுழை",
    username: "பயனர்பெயர்",
    password: "கடவுச்சொல்",
    logging_in: "உள்நுழைகிறது...",
    enter_username_password: "பயனர்பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்",
    live_chit: "நடப்பு சிட்டு",
    track_month: "இந்த மாத நிலையை உடனே பாருங்கள்",
    optimized_mobile: "மொபைலில் வேகமாக பயன்படுத்த உருவாக்கப்பட்டது.",
    logout: "வெளியேறு",
    now_active: "தற்போது செயலில்",
    members_count: "உறுப்பினர்கள்",
    paid: "செலுத்தியது",
    pending: "நிலுவை",
    winner: "வெற்றி பெற்றவர்",
    winner_not_selected: "இன்னும் வெற்றியாளர் தேர்வு செய்யப்படவில்லை",
    this_month: "இந்த மாதம்",
    paid_members: "செலுத்தியவர்கள்",
    pending_members: "நிலுவையினர்",
    marked_paid: "செலுத்தப்பட்டது",
    awaiting_payment: "செலுத்த வேண்டியுள்ளது",
    no_payments: "இந்த மாதத்திற்கு கட்டணம் பதிவாகவில்லை.",
    everyone_paid: "இந்த மாதத்திற்கு அனைவரும் செலுத்தி விட்டார்கள்.",
    timeline: "காலவரிசை",
    month_by_month_winners: "மாதந்தோறும் வெற்றியாளர்கள்",
    no_winner: "வெற்றியாளர் இல்லை",
    delete: "நீக்கு",
    undo: "மீளமை",
    member_list: "உறுப்பினர்கள்",
    people: "உறுப்பினர்கள்",
    manage_members: "உறுப்பினர் பட்டியலை ஒழுங்காக வைத்திருங்கள்",
    members_in_group: "உறுப்பினர்கள் சேர்க்கப்பட்டுள்ளனர்",
    no_members_group: "இந்த குழுவில் இன்னும் உறுப்பினர்கள் இல்லை.",
    add_member: "உறுப்பினர் சேர்க்க",
    quick_add_mobile: "மொபைலில் விரைவாக சேர்க்க",
    name: "பெயர்",
    phone: "தொலைபேசி",
    save: "சேமி",
    cancel: "ரத்து",
    edit: "திருத்து",
    settings_title: "அமைப்புகள்",
    group_controls: "குழு கட்டுப்பாடுகள்",
    settings_desc: "தொடக்க மாதம் மாற்றவும், சிட்டை முடிக்கவும் அல்லது புதிய குழுவைத் தொடங்கவும்.",
    select_group: "குழுவைத் தேர்வு செய்",
    lifecycle: "நிலை",
    start_month: "தொடக்க மாதம்",
    duration: "காலம்",
    total_amount: "மொத்த தொகை",
    member_limit: "உறுப்பினர் வரம்பு",
    export: "ஏற்றுமதி",
    pdf_report: "நடப்பு மாத PDF அறிக்கை",
    export_desc: "செலுத்தியது, நிலுவை மற்றும் நடப்பு மாத வெற்றியாளரை PDF ஆக பெறுங்கள்.",
    export_pdf: "PDF ஏற்று",
    preparing_pdf: "PDF தயார் செய்கிறது...",
    share_whatsapp: "வாட்ஸ்அப் பகிர்வு",
    preparing_whatsapp: "வாட்ஸ்அப் தயார் செய்கிறது...",
    move_calendar: "சிட்டு காலண்டரை மாற்றவும்",
    save_start_month: "தொடக்க மாதத்தை சேமி",
    saving: "சேமிக்கிறது...",
    close_chit: "சிட்டை முடி",
    end_group: "இந்த குழுவை முடி",
    close_chit_desc: "சிட்டு முடிந்ததும் வரலாற்றாக வைத்திருக்க இதைப் பயன்படுத்தவும்.",
    end_this_chit: "இந்த சிட்டை முடி",
    already_ended: "இந்த சிட்டு ஏற்கனவே முடிந்துள்ளது",
    ending: "முடிக்கிறது...",
    new_group: "புதிய குழு",
    start_next_chit: "அடுத்த சிட்டை தொடங்கு",
    new_group_desc: "தனியான அட்டவணையுடன் புதிய குழுவை உருவாக்கவும்.",
    create_new_group: "புதிய குழு உருவாக்கு",
    creating: "உருவாக்குகிறது...",
    lucky_draw: "அதிர்ஷ்ட குலுக்கு",
    shuffle_title: "நடப்பு மாத வெற்றியாளரை குலுக்கி தேர்வு செய்",
    shuffle_desc: "ஏற்கனவே வென்றிராத உறுப்பினர்களில் இருந்து தேர்வு செய்யப்படும்.",
    eligible_members: "தகுதியானவர்கள்",
    current_winner: "தற்போதைய வெற்றியாளர்",
    not_selected: "தேர்வு செய்யப்படவில்லை",
    shuffle_result: "குலுக்கு முடிவு",
    winner_locked: "இந்த மாத வெற்றியாளர் ஏற்கனவே உறுதி செய்யப்பட்டுள்ளார்",
    shuffling: "குலுக்குகிறது...",
    winner_selected: "வெற்றியாளர் தேர்வு செய்யப்பட்டது",
    tap_shuffle: "தகுதியான ஒருவரை தேர்வு செய்ய குலுக்கு அழுத்தவும்.",
    shuffle_winner: "வெற்றியாளரை குலுக்கு",
    eligible_pool: "தகுதி பட்டியல்",
    members_in_draw: "குலுக்கில் உள்ளவர்கள்",
    no_eligible_members: "இந்த மாதத்திற்கு தகுதியானவர்கள் இல்லை.",
    language: "மொழி",
    english: "ஆங்கிலம்",
    tamil: "தமிழ்",
    active: "செயலில்",
    ended: "முடிந்தது",
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return saved === "ta" ? "ta" : "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
