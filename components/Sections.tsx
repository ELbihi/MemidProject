import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, ShieldAlert, BookOpen, Users, ShieldOff, 
  Activity, Bot, ShieldCheck, Trophy, Layout, GraduationCap, 
  Stethoscope, Presentation, ChevronDown, ChevronUp, Play, HeartPulse, Brain
} from 'lucide-react';
import { Button, Section, SectionTitle, Badge, BentoCard } from './UI';
import { FEATURES, AUDIENCE_SEGMENTS, PRICING_BENEFITS, FAQ_ITEMS } from '../constants';

/* --- HERO SECTION --- */
export const Hero = () => {
  const ref = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotateX = useTransform(scrollY, [0, 500], [10, 0]);

  return (
    <div ref={ref} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-50 min-h-screen flex flex-col justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.4]" />
      <motion.div style={{ y: y1, x: -100 }} className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-[100px]" />
      <motion.div style={{ y: y2, x: 100 }} className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-brand-200/50 px-4 py-1.5 rounded-full mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="text-sm font-semibold text-brand-700 tracking-wide">
            500 places beta disponibles
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.05]"
        >
          Deviens le médecin <br className="hidden md:block" />
          dont <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">un enfant</span> a besoin.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Simulation pédiatrique interactive. Entraîne-toi sur des cas virtuels, commets tes erreurs ici, et sois prêt quand la réalité frappe.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="h-14 px-10 text-lg shadow-brand-500/20 shadow-xl" onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
            Rejoindre la liste
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="secondary" size="lg" className="h-14 px-10 text-lg" onClick={() => document.getElementById('features')?.scrollIntoView()}>
            <Play className="w-4 h-4 mr-2 fill-current" />
            Voir la démo
          </Button>
        </motion.div>

        {/* 3D Tilted UI Mockup */}
        <motion.div 
          style={{ rotateX }}
          initial={{ opacity: 0, scale: 0.9, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, type: "spring" }}
          className="mt-20 relative mx-auto max-w-5xl perspective-1000"
        >
          <div className="relative rounded-2xl bg-slate-900 p-2 shadow-2xl ring-1 ring-slate-900/10 transform-gpu rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-1 w-20 h-1 bg-slate-700 rounded-b-lg opacity-50"></div>
             <div className="rounded-xl overflow-hidden aspect-[16/10] bg-slate-800 relative group">
                <img 
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2832&auto=format&fit=crop" 
                  alt="Interface MedMemic" 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="glass-card-dark p-8 rounded-3xl border border-white/10 max-w-md text-left transform group-hover:scale-105 transition-transform duration-500">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Urgence Vitale</Badge>
                        <span className="text-slate-400 text-sm">Il y a 2 min</span>
                      </div>
                      <h3 className="text-white text-2xl font-bold mb-2">Nourrisson, 4 mois.</h3>
                      <p className="text-slate-300 mb-6">Motif : "Il est tout mou et il ne se réveille pas." Parents très anxieux. Température 36.2°C.</p>
                      <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                           <div className="h-full w-3/4 bg-red-500 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-slate-500 text-right">Fréquence Cardiaque: 190 bpm</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* --- PROBLEM SECTION (Bento Grid) --- */
export const Problem = () => {
  return (
    <Section id="problem">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Badge className="mb-4">Le constat</Badge>
        <SectionTitle 
          title="L'apprentissage médical est cassé." 
          subtitle="En pédiatrie, l'écart entre la théorie des livres et la réalité des urgences est un gouffre. Et vous n'avez pas le droit à l'erreur."
          center
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
        {/* Card 1: Large Span */}
        <BentoCard className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-red-50 to-white border-red-100" delay={0.1}>
          <div className="flex flex-col md:flex-row gap-6 items-center h-full">
            <div className="flex-1">
               <div className="p-3 bg-red-100 w-fit rounded-xl text-red-600 mb-4">
                 <ShieldAlert className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 mb-2">La peur de l'erreur fatale</h3>
               <p className="text-slate-600">Devant un enfant, le stress bloque le raisonnement. En stage, on a peur de toucher, peur de mal faire. Résultat : on reste en retrait.</p>
            </div>
            <div className="w-full md:w-1/3 bg-white rounded-2xl p-4 shadow-sm border border-red-50 text-center">
              <span className="text-4xl font-bold text-red-500">85%</span>
              <p className="text-sm text-slate-500 mt-2">des internes redoutent leur première garde aux urgences pédiatriques.</p>
            </div>
          </div>
        </BentoCard>

        {/* Card 2: Vertical */}
        <BentoCard className="md:row-span-2 bg-slate-50" delay={0.2} title="Manque de pratique" icon={<BookOpen className="w-6 h-6"/>}>
          <p className="mb-4">Les stages sont courts. Les pathologies saisonnières varient. </p>
          <p>Vous pouvez passer 3 mois en pédiatrie sans jamais voir une méningite ou une déshydratation sévère. Le jour où ça arrive, c'est la panique.</p>
          <div className="mt-8 relative h-32 w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
             {/* Abstract chart representation */}
             <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around px-2 pb-2">
                <div className="w-4 h-10 bg-slate-200 rounded-t"></div>
                <div className="w-4 h-16 bg-slate-200 rounded-t"></div>
                <div className="w-4 h-8 bg-slate-200 rounded-t"></div>
                <div className="w-4 h-24 bg-brand-500 rounded-t"></div> 
                <div className="w-4 h-12 bg-slate-200 rounded-t"></div>
             </div>
             <div className="absolute top-2 left-2 text-xs font-bold text-brand-600">Cas réels vus</div>
          </div>
        </BentoCard>

        {/* Card 3: Standard */}
        <BentoCard title="Supervision limitée" icon={<Users className="w-6 h-6"/>} delay={0.3}>
          Services saturés = seniors débordés. Le feedback est souvent "C'est bien" ou "Fais gaffe", sans explication détaillée du raisonnement clinique.
        </BentoCard>

        {/* Card 4: Standard */}
        <BentoCard title="Pas de 'Sandbox'" icon={<ShieldOff className="w-6 h-6"/>} delay={0.4}>
          Aucun endroit pour tester "Et si je ne donnais pas d'antibio ?" ou "Et si j'attendais 1h ?". Dans la réalité, le risque est trop grand.
        </BentoCard>
      </div>
    </Section>
  );
};

/* --- FEATURES SECTION (Sticky Scroll) --- */
export const Solution = () => {
  return (
    <Section id="features" className="bg-slate-950 text-white overflow-hidden" dark>
       {/* Ambient Glow */}
       <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <SectionTitle 
        title={<span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">Une clinique virtuelle <br/>dans votre poche.</span>}
        subtitle="MedMemic n'est pas un QCM. C'est un simulateur de conséquences."
        light
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {FEATURES.map((feature, idx) => {
          const icons = {
            'activity': <Activity className="w-6 h-6"/>,
            'bot': <Bot className="w-6 h-6"/>,
            'shield-check': <ShieldCheck className="w-6 h-6"/>,
            'trophy': <Trophy className="w-6 h-6"/>,
            'layout': <Layout className="w-6 h-6"/>,
            'users': <Users className="w-6 h-6"/>
          };
          
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="group relative bg-slate-900 border border-slate-800 p-8 rounded-3xl hover:bg-slate-800 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              
              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-brand-400 group-hover:scale-110 group-hover:bg-brand-500/20 transition-all duration-300 relative z-10">
                {icons[feature.iconName as keyof typeof icons] || <Activity />}
              </div>
              
              <h3 className="text-xl font-bold mb-3 relative z-10">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed relative z-10">{feature.description}</p>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
};

/* --- AUDIENCE SECTION --- */
export const Audience = () => {
  return (
    <Section id="audience">
      <SectionTitle title="Adapté à votre niveau de responsabilité" center />
      
      <div className="flex flex-col md:flex-row gap-6 mt-12">
        {AUDIENCE_SEGMENTS.map((seg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15 }}
            className="flex-1 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-100 to-indigo-100 rounded-3xl blur opacity-0 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="relative h-full bg-white border border-slate-100 p-8 rounded-3xl shadow-lg flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-700">
                {idx === 0 ? <GraduationCap className="w-8 h-8"/> : idx === 1 ? <Stethoscope className="w-8 h-8"/> : <Presentation className="w-8 h-8"/>}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{seg.title}</h3>
              <p className="text-slate-600 leading-relaxed">{seg.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* --- PRICING SECTION --- */
export const Pricing = () => {
  return (
    <Section id="pricing" className="bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[2.5rem] bg-slate-900 overflow-hidden p-10 md:p-20 text-center"
        >
          {/* Holographic Background Effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-150"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/30 rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/30 rounded-full blur-[80px]" />

          <div className="relative z-10">
            <Badge className="bg-white/10 text-white border-white/20 backdrop-blur-md mb-8 px-4 py-1.5 text-sm">
              🚀 Accès Bêta Limitée
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Sécurisez votre place.
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Rejoignez les 500 premiers étudiants qui transformeront leur pratique médicale. Accès anticipé + tarif fondateur à vie.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {PRICING_BENEFITS.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 text-brand-400" />
                  <span className="text-slate-200 font-medium">{b.text}</span>
                </div>
              ))}
            </div>

            <div className="max-w-md mx-auto bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/10">
              <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="votre-email@univ-medecine.fr" 
                  className="w-full px-4 py-4 rounded-xl bg-slate-900/50 border border-transparent text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
                />
                <Button size="lg" fullWidth className="h-14 text-lg">
                  Réserver mon accès
                </Button>
              </form>
            </div>
            <p className="mt-6 text-sm text-slate-400">Pas de spam. Désinscription en 1 clic.</p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};

/* --- FAQ SECTION --- */
export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="faq">
      <SectionTitle title="Questions ?" center />
      <div className="max-w-2xl mx-auto grid gap-4">
        {FAQ_ITEMS.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <button 
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
            >
              <span className="font-bold text-slate-900 text-lg pr-8">{item.question}</span>
              <div className={`p-2 rounded-full bg-slate-100 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-slate-600" />
              </div>
            </button>
            <AnimatePresence>
              {openIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

/* --- FOOTER --- */
export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-12">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="bg-brand-600 p-1.5 rounded-lg">
             <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-slate-900 font-bold text-lg tracking-tight">MedMemic</span>
        </div>
        <div className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} MedMemic. Fait avec <HeartPulse className="w-3 h-3 inline text-red-500"/> pour les futurs médecins.
        </div>
        <div className="flex gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-brand-600 transition-colors">Mentions légales</a>
          <a href="#" className="hover:text-brand-600 transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
};