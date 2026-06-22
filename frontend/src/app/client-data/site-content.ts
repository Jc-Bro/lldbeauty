export interface NavLink {
  label: string;
  fragment: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  description: string;
  primaryActionLabel: string;
  primaryActionFragment: string;
  secondaryActionLabel: string;
  secondaryActionFragment: string;
  imageUrl: string;
  imageAlt: string;
}

export interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  price: string;
}

export interface GalleryItem {
  title: string;
  imageUrl: string;
  imageAlt: string;
}

export interface BookingMonth {
  label: string;
  active: boolean;
}

export interface BookingDay {
  label: string;
  currentMonth?: boolean;
  active?: boolean;
}

export interface BookingServiceOption {
  label: string;
}

export interface ContactDetail {
  icon: string;
  title: string;
  lines: string[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export const siteBrand = 'LLDBeauty';

export const navLinks: NavLink[] = [
  { label: 'Services', fragment: 'about' },
  { label: 'Galerie', fragment: 'gallery' },
  { label: 'Reservation', fragment: 'booking' },
  { label: 'Contact', fragment: 'contact' },
];

export const heroContent: HeroContent = {
  eyebrow: 'Expertise & Serenite',
  title: "L'Art du Regard",
  description:
    'Sublimez votre beaute naturelle avec nos soins specialises de rehaussement de cils et d\'extensions sur mesure. Une experience calme et luxueuse pour un regard transforme.',
  primaryActionLabel: 'Reserver maintenant',
  primaryActionFragment: 'booking',
  secondaryActionLabel: 'Decouvrir les soins',
  secondaryActionFragment: 'about',
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCHsXh7IA7tS2U_oyHy3EVeJHAgMrH_0DFnfohB8ZQoY4g8ISxufR1gJkD6-yiXCiObBa5YQ5ikcaY6fh_tAdgnFQ1dveA7XIDRBHncu19Z67sNXJpmybgEUp6weorqzyPYgSkdX2LV5TybQklNfoGSFcnziRdRw6uRJoh2XBwpO68yb1N3XC9uFbUvs6tRfItpMX6iSbK8kMRvnMBln6Vqf5e00lJnj7vzA3n4ye91N2SEl-8DU9xPM5wFiS4hZkBpGB62kBpZR2E',
  imageAlt:
    "A high-end editorial close-up of a woman's eye with perfectly applied eyelash extensions.",
};

export const serviceCards: ServiceCard[] = [
  {
    icon: 'auto_awesome',
    title: 'Rehaussement de Cils',
    description:
      'Une technique innovante pour courber vos cils naturels depuis la racine. Le resultat ouvre le regard et allonge visuellement les cils pendant 6 a 8 semaines.',
    price: 'A partir de 65 EUR',
  },
  {
    icon: 'brush',
    title: 'Extensions de Cils',
    description:
      'Du cil a cil naturel au volume russe sophistique. Chaque pose est adaptee a la morphologie de votre oeil pour un resultat harmonieux et durable.',
    price: 'A partir de 85 EUR',
  },
];

export const servicesVisual = {
  imageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBo61UJyxcaB2HEnVj0Im8DmnO0yxT6Y-eS43yOWQGrEkqSY4fzmo_-i3-79KEf47SMkkIafG357OTwGn4dd5RbI30T5wbnUIJ5WJGsj11fUyIjPbdjEhF69tLnlt3CUiisbYSD0gaExM1-JaEFz7sy-fm3xd4VZgypb5ThmVHHR9nWJdlU20RBsz3bDxqeiuSQpM4QdbA9SaceQZa1g3feRWo8qtDDP603N1BeE1op9PcOJKKPP5ijHOguV7SRLDF7F_rouQN4PkI',
  imageAlt:
    'A serene wide-angle shot of a minimalist luxury beauty studio interior.',
  quote: 'Un moment hors du temps.',
};

export const galleryItems: GalleryItem[] = [
  {
    title: 'Rehaussement',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_qNn6056eP2Hax-jT2_43HHaJgFNqasVuk8cSrq9MhE7lFRlLjI-Se3vfAJcle5apu3XuG05-cFjMUOilNlxpscHqzpqfDeQdXrXaQ9wjMJNgO7crbwmHkweSTb-5w0nYB9KP8v1mWzyIUeXHF8VKxlQ6iODPdgiHladZaWbW_1nlx8QnSiP2j3YrLU02cMHZK4Kd09Vu6br5uH7i74yK6WbRH-oylv0KuWnKR9uo3y7KT2w5_ffJXBpgxGVwMrdDtjEbr2DaMRk',
    imageAlt: 'Macro photography of a lash lift result on light blue eyes.',
  },
  {
    title: 'Volume Russe',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBv8UrQDJoM4ZsLxSqnWhlskfWB3DrWXba0fZ3uuyAr8Ht_CktLrbFNluFXHkle1rp9Uc1CDrbYnMy1kLpAg7EKpeNiq2A5KaSddnMvA7eWrXw-OlEKZ-87jcZgSFNNJItSKh4--8TnBmkos8eXCpJdzvYeER8LZJ0zU-sRvWgN5vhifCrPz6N49HRVC5yxCf64sF2jr1kwqBNVtiB3eNnpp0i2LDHiXwlMIylByMwYlMueCGfEtmTybAOnHFDY3pnFgri0felfaak',
    imageAlt: 'Close up of a volume russe eyelash extension on brown eyes.',
  },
  {
    title: 'Mixte',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAJL0pTxKNWC9VGv6DhP-ZEMFrbh0kIrc_me-_h7wZL4fE_5b2agDuI5GMnSNFo47iIQrkYUO5uoJxLs5aQoRNON3XqL0hmhi1E-Snh78c_1hRugGuuTYeXgUibdRO3AxE_8Z9kCjzHkcTPBEy7I_-cyWjsdw6iqq6MNegHxp0bzLaxodoDUrU_qOhddIQvw9iPRyEZYf_wrJ3VxarXz3p_yHlu5cSOv60PK-W4_LgC0QhpNartu1oK7PDEbBxpaZoUurcu3TLeP_M',
    imageAlt: 'Side profile of long elegant lash extensions.',
  },
  {
    title: 'Cil a Cil',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD5bQhFUo3BgxTQjdMMhGOlcNYqwnNLqhE6_hG5ZQ3TepaX2faSR2UvNqTO5jSrvfyb4dxxjIdZD64zHvMPzjTtYGzJWHThNV9ho-5T60vbpcynR209hatXMwlD5bglXlFMznEWSnQjCrpUdljRCTatxSxxfVEPSeRtDRobJVSzUNDJlUeStTNI6dgHviC--mdYr3UitfiKDIsuivMZRCKT_NZw9Fu0MatcRvwezu5zuMYVphcQyaKeXNUITgO1SdIE6Uyuf2LhPCY',
    imageAlt: 'Macro of a natural lash set.',
  },
  {
    title: 'Lash Tint',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCsTe94eqfE9xhKZf9ydXddOFumZwB8CPd1m5I6xrzpy-N38FPhxumcXGv-dHH96FMjkm0KOY7xh8_SR0mYPa955iHd2XtQlvKQRPnl4acFHhTDrj244dRQlQaVGIm6nXjRLvLo_l4wKmfmYh7T_-7QVh1atCGpmBnKYffbvTXv2LFpvwtFKGMiSiPkB7v_rQ61dCsukkmvqntU1r9a72QisFRDtA0e1AgrJEryuzbPeADiIVYHxXoe0M2praJOFiA6V2Wzns1riy8',
    imageAlt: 'Lash tint and lift results on dark lashes.',
  },
  {
    title: 'Le Processus',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCNcUCF3YVKx83z0kWSoMeeqg81bIhq22rynpct_E4auzZpSj3cFRS-bPwLTiyDyckSldovg9I6vZejVqMU8SqzXo_p1kXPFdpw3v5A96pyavwR_Zt2qPYtRyQ5FOD3HeM2zn9qVSOGIVPmTcoX0mRCzVcQp9CrRQ_bwCUUB2HVdtXBvn7zvs_vjkKoQGfWa-8yMUXInTrJNYRgC9HYVMuYn4uywOvUXue0nJ9WqO0OUva51xjU7H7nHD-1DUfvU68dpsJpfSsTHyg',
    imageAlt: 'Detail shot of the application process.',
  },
];

export const bookingServiceOptions: BookingServiceOption[] = [
  { label: 'Rehaussement de Cils Signature' },
  { label: 'Extension Cil a Cil Naturel' },
  { label: 'Extension Volume Russe' },
  { label: 'Pose Mixte' },
];

export const bookingMonths: BookingMonth[] = [
  { label: 'Octobre', active: true },
  { label: 'Novembre', active: false },
  { label: 'Decembre', active: false },
];

export const bookingWeekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const bookingDays: BookingDay[] = [
  { label: '28', currentMonth: false },
  { label: '29', currentMonth: false },
  { label: '30', currentMonth: false },
  { label: '1', currentMonth: true },
  { label: '2', currentMonth: true },
  { label: '3', currentMonth: true, active: true },
  { label: '4', currentMonth: true },
  { label: '5', currentMonth: true },
  { label: '6', currentMonth: true },
  { label: '7', currentMonth: true },
  { label: '8', currentMonth: true },
  { label: '9', currentMonth: true },
  { label: '10', currentMonth: true },
  { label: '11', currentMonth: true },
];

export const bookingTimeSlots = ['09:00', '11:30', '14:00', '16:30'];

export const bookingIntro = {
  title: 'Reserver votre seance',
  description:
    'Selectionnez votre prestation et trouvez le creneau ideal pour votre moment de detente.',
  availabilityLabel: 'Horaires disponibles le 3 Octobre',
  confirmationLabel: 'Confirmer la selection',
};

export const contactDetails: ContactDetail[] = [
  {
    icon: 'location_on',
    title: 'Le Studio',
    lines: ['12 Rue de la Paix, 75002 Paris'],
  },
  {
    icon: 'schedule',
    title: "Horaires d'Ouverture",
    lines: ['Mardi - Vendredi: 10h - 19h', 'Samedi: 09h - 18h'],
  },
  {
    icon: 'call',
    title: 'Telephone',
    lines: ['01 23 45 67 89'],
  },
];

export const contactIntro = {
  title: 'Nous Contacter',
  namePlaceholder: 'Votre nom',
  emailPlaceholder: 'Votre email',
  messagePlaceholder: 'Votre message',
  submitLabel: 'Envoyer',
};

export const footerBrand = 'LUMIERE LASH';

export const footerLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'FAQ', href: '#' },
];

export const footerCopyright =
  '© 2024 Lumiere Lash & Aesthetics. All rights reserved.';
