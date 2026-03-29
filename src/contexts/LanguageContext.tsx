import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'en' | 'ar' | 'fr' | 'de' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.deals': 'Deals',
    'nav.vendor': 'Vendor Central',
    'nav.wishlist': 'Wishlist',
    'nav.orders': 'My Orders',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'search.placeholder': 'Search for futuristic tech...',
    'auth.login': 'Sign In',
    'auth.signup': 'Join Velora',
    'wishlist.title': 'My Wishlist',
    'wishlist.empty': 'Your wishlist is empty',
    'wishlist.login': 'Please sign in to view your wishlist',
    'orders.title': 'Order History',
    'orders.empty': "You haven't placed any orders yet",
    'orders.login': 'Please sign in to view your orders',
    'orders.tracking': 'Tracking #',
    'orders.carrier': 'Carrier',
    'orders.est_delivery': 'Est. Delivery',
    'orders.id': 'Order ID',
    'orders.date': 'Date',
    'orders.total': 'Total',
    'orders.shipping': 'Shipping Address',
    'orders.payment': 'Payment Method',
    'orders.status': 'Tracking Status',
    'home.featured': 'Featured Innovations',
    'home.trending': 'Trending Gear',
    'home.ai_picks': 'Neural Engine Picks',
    'footer.about': 'About Velora',
    'footer.contact': 'Contact Us',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.products': 'المنتجات',
    'nav.categories': 'الفئات',
    'nav.deals': 'العروض',
    'nav.vendor': 'مركز البائعين',
    'nav.wishlist': 'المفضلة',
    'nav.orders': 'طلباتي',
    'nav.profile': 'الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'search.placeholder': 'ابحث عن أحدث التقنيات...',
    'auth.login': 'تسجيل الدخول',
    'auth.signup': 'انضم إلى Velora',
    'wishlist.title': 'المفضلة',
    'wishlist.empty': 'المفضلة فارغة',
    'wishlist.login': 'سجل الدخول لعرض المفضلة',
    'orders.title': 'سجل الطلبات',
    'orders.empty': 'لا توجد طلبات بعد',
    'orders.login': 'سجل الدخول لعرض الطلبات',
    'orders.tracking': 'رقم التتبع',
    'orders.carrier': 'شركة الشحن',
    'orders.est_delivery': 'التسليم المتوقع',
    'orders.id': 'رقم الطلب',
    'orders.date': 'التاريخ',
    'orders.total': 'الإجمالي',
    'orders.shipping': 'عنوان الشحن',
    'orders.payment': 'طريقة الدفع',
    'orders.status': 'حالة الطلب',
    'home.featured': 'ابتكارات مميزة',
    'home.trending': 'الأكثر رواجًا',
    'home.ai_picks': 'اختيارات الذكاء الاصطناعي',
    'footer.about': 'عن Velora',
    'footer.contact': 'اتصل بنا',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.terms': 'شروط الخدمة',
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.products': 'Produits',
    'nav.categories': 'Categories',
    'nav.deals': 'Offres',
    'nav.vendor': 'Centre Vendeur',
    'nav.wishlist': 'Favoris',
    'nav.orders': 'Mes Commandes',
    'nav.profile': 'Profil',
    'nav.logout': 'Deconnexion',
    'search.placeholder': 'Rechercher des technologies...',
    'auth.login': 'Connexion',
    'auth.signup': 'Rejoindre Velora',
    'wishlist.title': 'Mes Favoris',
    'wishlist.empty': 'Votre liste est vide',
    'wishlist.login': 'Connectez-vous pour voir vos favoris',
    'orders.title': 'Historique Commandes',
    'orders.empty': "Vous n'avez pas encore commande",
    'orders.login': 'Connectez-vous pour voir vos commandes',
    'orders.tracking': 'Suivi #',
    'orders.carrier': 'Transporteur',
    'orders.est_delivery': 'Livraison',
    'orders.id': 'Commande',
    'orders.date': 'Date',
    'orders.total': 'Total',
    'orders.shipping': 'Adresse',
    'orders.payment': 'Paiement',
    'orders.status': 'Statut',
    'home.featured': 'Innovations Vedettes',
    'home.trending': 'Tendances',
    'home.ai_picks': "Choix de l'IA",
    'footer.about': 'A propos',
    'footer.contact': 'Contact',
    'footer.privacy': 'Confidentialite',
    'footer.terms': 'Conditions',
  },
  de: {
    'nav.home': 'Startseite',
    'nav.products': 'Produkte',
    'nav.categories': 'Kategorien',
    'nav.deals': 'Angebote',
    'nav.vendor': 'Verkaeufer-Center',
    'nav.wishlist': 'Wunschliste',
    'nav.orders': 'Bestellungen',
    'nav.profile': 'Profil',
    'nav.logout': 'Abmelden',
    'search.placeholder': 'Suche nach Technik...',
    'auth.login': 'Anmelden',
    'auth.signup': 'Velora beitreten',
    'wishlist.title': 'Meine Wunschliste',
    'wishlist.empty': 'Deine Wunschliste ist leer',
    'wishlist.login': 'Bitte melde dich an',
    'orders.title': 'Bestell Verlauf',
    'orders.empty': 'Noch keine Bestellungen',
    'orders.login': 'Bitte melde dich an',
    'orders.tracking': 'Tracking #',
    'orders.carrier': 'Versand',
    'orders.est_delivery': 'Lieferung',
    'orders.id': 'Bestellung',
    'orders.date': 'Datum',
    'orders.total': 'Gesamt',
    'orders.shipping': 'Adresse',
    'orders.payment': 'Zahlung',
    'orders.status': 'Status',
    'home.featured': 'Vorgestellte Innovationen',
    'home.trending': 'Trends',
    'home.ai_picks': 'KI-Auswahl',
    'footer.about': 'Ueber uns',
    'footer.contact': 'Kontakt',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Bedingungen',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.products': 'Productos',
    'nav.categories': 'Categorias',
    'nav.deals': 'Ofertas',
    'nav.vendor': 'Centro de Vendedores',
    'nav.wishlist': 'Favoritos',
    'nav.orders': 'Mis Pedidos',
    'nav.profile': 'Perfil',
    'nav.logout': 'Cerrar sesion',
    'search.placeholder': 'Buscar tecnologia...',
    'auth.login': 'Iniciar Sesion',
    'auth.signup': 'Unirse a Velora',
    'wishlist.title': 'Mis Favoritos',
    'wishlist.empty': 'Tu lista esta vacia',
    'wishlist.login': 'Inicia sesion para verla',
    'orders.title': 'Historial Pedidos',
    'orders.empty': 'Aun no hay pedidos',
    'orders.login': 'Inicia sesion para verlos',
    'orders.tracking': 'Seguimiento #',
    'orders.carrier': 'Transportista',
    'orders.est_delivery': 'Entrega',
    'orders.id': 'Pedido',
    'orders.date': 'Fecha',
    'orders.total': 'Total',
    'orders.shipping': 'Direccion',
    'orders.payment': 'Pago',
    'orders.status': 'Estado',
    'home.featured': 'Innovaciones Destacadas',
    'home.trending': 'Tendencias',
    'home.ai_picks': 'Selecciones IA',
    'footer.about': 'Sobre nosotros',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Terminos',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const storedLanguage = localStorage.getItem('velora-language');
    if (storedLanguage === 'en' || storedLanguage === 'ar' || storedLanguage === 'fr' || storedLanguage === 'de' || storedLanguage === 'es') {
      return storedLanguage;
    }

    return 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('velora-language', language);
  }, [language]);

  const t = (key: string) => translations[language][key] || key;
  const isRTL = language === 'ar';

  return <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
