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
  { label: 'Réservation', fragment: 'booking' },
  { label: 'Contact', fragment: 'contact' },
];

export const heroContent: HeroContent = {
  eyebrow: 'Expertise & Sérénite',
  title: "L'Art du Regard",
  description:
    'Sublimez votre regard au sein de mon institut avec les différentes prestations que je peux vous proposer. Différentes techniques sont élaborée pour vous correspondre au mieux',
  primaryActionLabel: 'Réserver maintenant',
  primaryActionFragment: 'booking',
  secondaryActionLabel: 'Découvrir les soins',
  secondaryActionFragment: 'about',
  imageUrl:
    '../../../../assets/images/hero-img.jpeg',
  imageAlt:
    "Rehaussement de cils présta 1",
};

export const serviceCards: ServiceCard[] = [
  {
    icon: 'auto_awesome',
    title: 'Rehaussement de Cils',
    description:
      'Une technique innovante pour courber vos cils naturels depuis la racine. Le résultat ouvre le regard et allonge visuellement les cils pendant 6 à 8 semaines.',
    price: 'À partir de 65 EUR',
  },
  {
    icon: 'brush',
    title: 'Extensions de Cils',
    description:
      'Du cil à cil naturel au volume russe sophistiqué. Chaque pose est adaptée à la morphologie de votre oeil pour un résultat harmonieux et durable.',
    price: 'À partir de 85 EUR',
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
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_1.jpeg',
    imageAlt: 'Macro photography of a lash lift result on light blue eyes.',
  },
  {
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_2.jpeg',
    imageAlt: 'Close up of a volume russe eyelash extension on brown eyes.',
  },
  {
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_3.jpeg',
    imageAlt: 'Side profile of long elegant lash extensions.',
  },
  {
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_4.jpeg',
    imageAlt: 'Macro of a natural lash set.',
  },
  {
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_5.jpeg',
    imageAlt: 'Lash tint and lift results on dark lashes.',
  },
  {
    title: '',
    imageUrl:
    '../../../../assets/images/gallery_6.jpeg',
    imageAlt: 'Detail shot of the application process.',
  },
];

export const bookingServiceOptions: BookingServiceOption[] = [
  { label: 'Rehaussement de Cils Signature' },
  { label: 'Extension Cil a Cil Naturel' },
];

export const bookingWeekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export const bookingIntro = {
  title: 'Reserver votre seance',
  description:
    'Sélectionnez votre prestation et trouvez le créneau idéal pour votre moment de détente.',
  availabilityLabel: 'Horaires disponibles le',
  confirmationLabel: 'Confirmer la sélection',
};

export const contactDetails: ContactDetail[] = [
  {
    icon: 'location_on',
    title: 'LLDBeauty',
    lines: ['25 chemin de la chaussée, 35120 Dol-de-Bretagne'],
  },
  {
    icon: 'schedule',
    title: "Horaires d'Ouverture",
    lines: ['Mardi - Vendredi: 10h - 19h', 'Samedi: 09h - 18h'],
  },
  {
    icon: 'call',
    title: 'Telephone',
    lines: ['06 83 39 55 86'],
  },
];

export const contactIntro = {
  title: 'Nous Contacter',
  namePlaceholder: 'Votre nom',
  emailPlaceholder: 'Votre email',
  messagePlaceholder: 'Votre message',
  submitLabel: 'Envoyer',
};

export const footerBrand = 'LLDBEAUTY';

export const footerLinks: FooterLink[] = [
  { label: 'Politique de confidentialité', href: '#' },
  { label: 'Mentions Légales', href: '#' },
  { label: 'FAQ', href: '#' },
];

export const footerCopyright =
  '© 2026 LLDBeauty. All rights reserved.';
