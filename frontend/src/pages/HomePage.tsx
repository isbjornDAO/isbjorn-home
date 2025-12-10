import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
  HeartIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface PublicStats {
  registeredCharities: number;
  donationsProcessed: number;
  totalDonatedNzd: number;
  businessPartners: number;
}

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring animation for scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await apiService.get<{ success: boolean; data: PublicStats }>('/public/stats');
        if ((result as any).success && (result as any).data) {
          setStats((result as any).data as PublicStats);
        }
      } catch (e) {
        console.error('Failed to load public stats', e);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div ref={containerRef} className="relative bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">

      {/* CHAPTER 1: THE ARCTIC - Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Arctic Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            scale: useTransform(smoothProgress, [0, 0.2], [1, 1.2]),
            opacity: useTransform(smoothProgress, [0, 0.15, 0.2], [1, 0.5, 0])
          }}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/50 to-slate-900"></div>
        </motion.div>

        {/* Floating Ice Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-4xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 50 - 25, 0],
                rotate: [0, 360],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              ❄
            </motion.div>
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Polar Bear Emoji with Glow */}
            <motion.div
              className="text-9xl mb-8 filter drop-shadow-2xl"
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              🐻‍❄️
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 text-white leading-tight">
              <motion.span
                className="inline-block bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-200 bg-clip-text text-transparent"
                animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
                transition={{ duration: 8, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              >
                Every Donation
              </motion.span>
              <br />
              <span className="text-white">Tells a Story</span>
            </h1>

            <p className="text-xl md:text-2xl lg:text-3xl text-blue-100/90 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Join a global movement revolutionizing conservation through
              <span className="font-bold text-cyan-300"> transparent</span>,
              <span className="font-bold text-cyan-300"> traceable</span>,
              <span className="font-bold text-cyan-300"> blockchain-powered</span> donations
            </p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Link
                to={isAuthenticated ? '/donate' : '/signup'}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 bg-[length:200%_100%] px-12 py-6 rounded-full text-white text-xl font-bold shadow-2xl hover:shadow-cyan-500/50 transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                {/* Aurora effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                <span className="relative z-10">Begin Your Journey</span>
                <ArrowRightIcon className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex flex-col items-center gap-2 text-white/60">
                <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
                <motion.div
                  className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2"
                  whileHover={{ borderColor: 'rgba(255,255,255,0.8)' }}
                >
                  <motion.div
                    className="w-1.5 h-3 bg-white/60 rounded-full"
                    animate={{ y: [0, 12, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CHAPTER 2: THE CRISIS - Melting Ice Narrative */}
      <ScrollSection
        title="The Arctic is Changing"
        subtitle="Climate change threatens polar bear habitats at an unprecedented rate"
        bgImage="https://images.unsplash.com/photo-1564053489984-317bbd824340?q=80&w=2070"
        darkOverlay
      >
        <div className="grid md:grid-cols-2 gap-12 text-white">
          <StatsCard
            number="30%"
            label="Sea Ice Lost Since 1979"
            icon="🧊"
            delay={0.2}
          />
          <StatsCard
            number="22,000"
            label="Polar Bears Remaining"
            icon="🐻‍❄️"
            delay={0.4}
          />
        </div>
        <p className="text-xl text-blue-100 mt-12 text-center max-w-3xl mx-auto leading-relaxed">
          But this isn't just a polar bear story. It's about <span className="font-bold text-cyan-300">transparency</span>,
          <span className="font-bold text-cyan-300"> accountability</span>, and
          <span className="font-bold text-cyan-300"> revolutionizing</span> how the world gives back.
        </p>
      </ScrollSection>

      {/* CHAPTER 3: THE OLD WAY - Traditional Charity Problems */}
      <ScrollSection
        title="The Traditional Charity Problem"
        subtitle="Where does your money really go?"
        bgGradient="from-slate-900 via-gray-900 to-slate-900"
      >
        <div className="grid md:grid-cols-3 gap-8">
          <ProblemCard
            icon="📊"
            title="No Transparency"
            description="Donations disappear into black boxes. You never know if your $100 became $75 or $25 in actual impact."
            delay={0.2}
          />
          <ProblemCard
            icon="⏳"
            title="Slow & Inefficient"
            description="Weeks of processing, multiple intermediaries, and fees eating away at your generosity."
            delay={0.4}
          />
          <ProblemCard
            icon="🤷"
            title="Zero Accountability"
            description="No real-time updates, no proof of impact, no way to verify where your donation went."
            delay={0.6}
          />
        </div>
      </ScrollSection>

      {/* CHAPTER 4: THE REVOLUTION - Blockchain Solution */}
      <ScrollSection
        title="Crystal Clear. Blockchain-Powered."
        subtitle="Imagine donating with the transparency of ice"
        bgImage="https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2070"
      >
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <FeatureHighlight
              icon={<CheckCircleIcon className="w-8 h-8" />}
              title="Every Transaction Traced"
              description="Blockchain technology records every cent. Watch your donation flow from your wallet to the Arctic in real-time."
              delay={0.2}
            />
            <FeatureHighlight
              icon={<ShieldCheckIcon className="w-8 h-8" />}
              title="Immutable Proof"
              description="Your impact is permanently recorded. No one can alter, hide, or manipulate donation records—ever."
              delay={0.4}
            />
            <FeatureHighlight
              icon={<SparklesIcon className="w-8 h-8" />}
              title="Zero Hidden Fees"
              description="Smart contracts eliminate middlemen. 100% of your donation reaches verified conservation projects."
              delay={0.6}
            />
          </div>

          {/* Animated Blockchain Visualization */}
          <div className="relative">
            <motion.div
              className="relative rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-400/30 p-8 shadow-2xl"
              whileInView={{ scale: [0.95, 1], opacity: [0, 1] }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                {['You Donate', 'Blockchain Verifies', 'Conservation Receives', 'Impact Tracked'].map((step, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <span className="text-white font-semibold">{step}</span>
                    <motion.div
                      className="ml-auto text-cyan-300"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    >
                      ✓
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </ScrollSection>

      {/* CHAPTER 5: THE HERO'S JOURNEY - User Empowerment */}
      <ScrollSection
        title="You Are the Next Conservationist"
        subtitle="Join the pioneers revolutionizing global giving"
        bgImage="https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=2070"
        darkOverlay
      >
        <div className="max-w-4xl mx-auto text-center space-y-8 text-white">
          <motion.p
            className="text-2xl md:text-3xl font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            You're not just donating. You're joining a <span className="font-bold text-cyan-300">legacy</span>.
          </motion.p>

          <motion.p
            className="text-xl md:text-2xl text-blue-100/90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            The same pioneering spirit that drove <span className="font-semibold">Jane Goodall</span>,
            <span className="font-semibold"> Dian Fossey</span>, and
            <span className="font-semibold"> Steve Irwin</span> now flows through <span className="font-bold text-cyan-300">you</span>.
          </motion.p>

          <motion.div
            className="pt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="inline-block bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-2xl px-8 py-6">
              <p className="text-2xl font-bold text-cyan-300 mb-2">Your name. On the blockchain. Forever.</p>
              <p className="text-lg text-blue-100">Immutable proof that you stood for our planet.</p>
            </div>
          </motion.div>
        </div>
      </ScrollSection>

      {/* CHAPTER 6: IMPACT STATS - Real Numbers */}
      <ScrollSection
        title="Real Impact. Real Time."
        subtitle="Join a growing movement making measurable change"
        bgGradient="from-blue-950 via-slate-900 to-blue-950"
      >
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[
            { value: stats?.donationsProcessed || 0, label: 'Donations Made', icon: '💝' },
            { value: stats?.totalDonatedNzd || 0, label: 'Total Donated', icon: '💰', prefix: '$' },
            { value: stats?.registeredCharities || 0, label: 'Verified Charities', icon: '🏛️' },
            { value: '100', label: 'On-Chain Transparency', icon: '🔗', suffix: '%' },
          ].map((stat, i) => (
            <AnimatedCounter
              key={i}
              value={typeof stat.value === 'number' ? stat.value : parseInt(stat.value)}
              label={stat.label}
              icon={stat.icon}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={i * 0.1}
            />
          ))}
        </motion.div>
      </ScrollSection>

      {/* CHAPTER 7: THE CALL TO ACTION - Final CTA */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Northern Lights Background */}
        <motion.div
          className="absolute inset-0 z-0"
          animate={{
            background: [
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              'linear-gradient(135deg, #06beb6 0%, #48b1bf 100%)',
              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-12"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-8xl"
            >
              🌍
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
              The Planet Needs
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                You
              </span>
            </h2>

            <p className="text-2xl md:text-3xl text-white/90 max-w-3xl mx-auto font-light">
              Every donation is a vote for a better future.
              <br />
              Every transaction is a testament to transparency.
              <br />
              Every action creates ripples across the Arctic ice.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={isAuthenticated ? '/donate' : '/signup'}
                className="inline-flex items-center gap-4 bg-white text-blue-900 px-16 py-8 rounded-full text-2xl font-bold shadow-2xl hover:shadow-white/50 transition-all duration-500"
              >
                <span>Start Your Legacy</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRightIcon className="w-8 h-8" />
                </motion.div>
              </Link>
            </motion.div>

            <div className="flex items-center justify-center gap-8 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Blockchain Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Zero Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" />
                <span>100% Transparent</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Reusable Components

const ScrollSection: React.FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
  bgImage?: string;
  bgGradient?: string;
  darkOverlay?: boolean;
}> = ({ title, subtitle, children, bgImage, bgGradient, darkOverlay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center py-32 overflow-hidden">
      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          {darkOverlay && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-blue-950/70 to-slate-900/80"></div>
          )}
        </div>
      )}
      {bgGradient && (
        <div className={`absolute inset-0 z-0 bg-gradient-to-b ${bgGradient}`}></div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {title}
          </h2>
          <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
};

const StatsCard: React.FC<{ number: string; label: string; icon: string; delay: number }> = ({ number, label, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center hover:bg-white/20 transition-all duration-300 group"
  >
    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <div className="text-5xl font-black text-cyan-300 mb-2">{number}</div>
    <div className="text-lg text-white/80">{label}</div>
  </motion.div>
);

const ProblemCard: React.FC<{ icon: string; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-red-500/50 transition-all duration-300"
  >
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-gray-300 leading-relaxed">{description}</p>
  </motion.div>
);

const FeatureHighlight: React.FC<{ icon: React.ReactNode; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    className="flex gap-6 items-start group"
  >
    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-xl">
      {icon}
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-blue-100/80 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

const AnimatedCounter: React.FC<{
  value: number;
  label: string;
  icon: string;
  prefix?: string;
  suffix?: string;
  delay: number;
}> = ({ value, label, icon, prefix = '', suffix = '', delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="text-center group cursor-default"
    >
      <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{icon}</div>
      <div className="text-4xl md:text-5xl font-black text-cyan-300 mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-lg text-white/80">{label}</div>
    </motion.div>
  );
};

export default HomePage;
