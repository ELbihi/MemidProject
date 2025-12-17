import { FAQItem, FeatureItem, NavLink, PricingBenefit, ProblemItem } from "./types";

export const NAV_LINKS: NavLink[] = [
  { label: "Problème", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Public", href: "#audience" },
  { label: "FAQ", href: "#faq" },
];

export const PROBLEM_ITEMS: ProblemItem[] = [
  { text: "La peur de bloquer devant un nourrisson en détresse.", iconName: "alert" },
  { text: "Trop de théorie, presque aucune exposition réelle aux cas pédiatriques.", iconName: "book" },
  { text: "Services saturés = supervision limitée & feedback quasi absent.", iconName: "users" },
  { text: "Aucun espace sécurisé pour tester, se tromper et comprendre avant d’agir.", iconName: "shield-off" },
];

export const FEATURES: FeatureItem[] = [
  {
    title: "Cas cliniques pédiatriques interactifs",
    description: "Prends en charge des enfants de tout âge. Décide face à une fièvre inquiétante, une bronchiolite, une allergie sévère, une déshydratation… avec le réalisme du terrain.",
    iconName: "activity"
  },
  {
    title: "Patients virtuels & Feedback pédagogique",
    description: "Chaque patient virtuel évolue selon tes décisions. Obtiens un retour immédiat et fondé sur le raisonnement clinique pédiatrique réel.",
    iconName: "bot"
  },
  {
    title: "Safe-Failure Learning",
    description: "Le seul endroit où tu peux “te tromper” en pédiatrie… sans conséquence. Et où chaque erreur devient une compétence.",
    iconName: "shield-check"
  },
  {
    title: "Gamification clinique",
    description: "Loin du jeu. Près de la motivation. Badges cliniques, suivi de compétences, progression visible et défis pour rester régulier.",
    iconName: "trophy"
  },
  {
    title: "Modules 100% pédiatrie",
    description: "Urgences pédiatriques, nourrisson, néonat, pédiatrie générale : tout ce que tu verras — ou redouteras — en stage.",
    iconName: "layout"
  },
  {
    title: "Mode solo & collaboratif (roadmap)",
    description: "Entraîne-toi seul ou discute un cas avec un interne ou résident. Comme un débrief de garde, mais accessible 24/7.",
    iconName: "users"
  },
];

export const AUDIENCE_SEGMENTS = [
  {
    title: "Externes",
    description: "Pour ne plus arriver en stage avec la sensation d’être “là pour la première fois”.",
    iconName: "graduation-cap"
  },
  {
    title: "Internes",
    description: "Pour répéter les situations fréquentes et apprendre à gérer la pression de la garde.",
    iconName: "stethoscope"
  },
  {
    title: "Résidents",
    description: "Pour affiner le raisonnement et t’entraîner à des situations complexes ou rares… avant qu’elles n’arrivent en vrai.",
    iconName: "presentation"
  }
];

export const PRICING_BENEFITS: PricingBenefit[] = [
  { text: "500 places seulement" },
  { text: "Accès anticipé" },
  { text: "Avantages à vie" },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "MedMemic remplace-t-il les stages ?",
    answer: "Non. MedMemic te prépare pour que tu profites mieux de tes stages et que tu arrives avec plus d’expérience virtuelle que la plupart des étudiants."
  },
  {
    question: "Les cas pédiatriques sont-ils validés par des médecins ?",
    answer: "Oui, ils sont construits et relus avec des professeurs en pédiatrie."
  },
  {
    question: "Est-ce adapté à mon niveau ?",
    answer: "Totalement. Les cas vont du simple (fièvre, toux) au critique (détresse respiratoire, nourrisson apathique)."
  },
  {
    question: "Sur quels appareils fonctionne MedMemic ?",
    answer: "Mobile, tablette, ordinateur. Aucune installation nécessaire."
  },
  {
    question: "Vous ouvrez où ?",
    answer: "D’abord au Maroc, puis progressivement aux autres régions francophones."
  },
];