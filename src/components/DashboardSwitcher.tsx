/**
 * Dashboard Switcher Component
 * Beautiful toggle switch between CMS and Application dashboards
 * with dramatic full-page transition animation
 *
 * Behavior based on Site Mode:
 * - Website mode: Only shows CMS (no toggle)
 * - App mode: Only shows Apps (no toggle)
 * - Hybrid mode: Shows both CMS and Apps toggle
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, AppWindow, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

type DashboardType = 'cms' | 'application';

interface DashboardOption {
  id: DashboardType;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  gradient: string;
  bgGradient: string;
}

const dashboards: DashboardOption[] = [
  {
    id: 'cms',
    name: 'CMS Dashboard',
    shortName: 'CMS',
    description: 'Content Management',
    icon: <LayoutDashboard className="w-5 h-5" />,
    path: '/dashboard',
    gradient: 'from-blue-500 via-indigo-500 to-violet-600',
    bgGradient: 'from-blue-600 via-indigo-600 to-violet-700',
  },
  {
    id: 'application',
    name: 'App Dashboard',
    shortName: 'Apps',
    description: 'Application Platform',
    icon: <AppWindow className="w-5 h-5" />,
    path: '/dashboard/apps',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    bgGradient: 'from-purple-600 via-pink-600 to-rose-600',
  },
];

export function DashboardSwitcher() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'expanding' | 'showing' | 'collapsing'>('idle');
  // Store the animation target so it doesn't change mid-animation when URL changes
  const [animationTarget, setAnimationTarget] = useState<DashboardOption | null>(null);
  const navigate = useNavigate();
  const { siteModeSettings, dashboardMode, setDashboardMode } = useAppStore();

  // Determine current dashboard from store
  const currentDashboard = dashboardMode === 'apps' ? 'application' : 'cms';
  const current = dashboards.find(d => d.id === currentDashboard) || dashboards[0];
  const target = dashboards.find(d => d.id !== currentDashboard)!;

  // Site Mode Logic:
  // - Website mode: Only CMS available (no toggle needed)
  // - App mode: Only Apps available (no toggle needed)
  // - Hybrid mode: Both available (show toggle)
  const showToggle = siteModeSettings.mode === 'hybrid';
  const singleModeLabel = siteModeSettings.mode === 'website' ? 'CMS' : siteModeSettings.mode === 'app' ? 'Apps' : null;
  const singleModeDashboard = siteModeSettings.mode === 'website' ? dashboards[0] : siteModeSettings.mode === 'app' ? dashboards[1] : null;

  const handleToggle = () => {
    if (isAnimating) return;

    // Capture the target at animation start - this won't change during animation
    setAnimationTarget(target);
    setIsAnimating(true);
    setAnimationPhase('expanding');

    // Phase 1: Expand animation
    setTimeout(() => {
      setAnimationPhase('showing');
    }, 400);

    // Phase 2: Navigate and update store
    setTimeout(() => {
      // Update the store first so navigation stays in sync
      setDashboardMode(target.id === 'application' ? 'apps' : 'cms');
      navigate(target.path);
      setAnimationPhase('collapsing');
    }, 1000);

    // Phase 3: Complete
    setTimeout(() => {
      setAnimationPhase('idle');
      setIsAnimating(false);
      setAnimationTarget(null);
    }, 1500);
  };

  // Use captured target during animation, otherwise use calculated target
  const displayTarget = animationTarget || target;

  // Keyboard shortcut: Ctrl+D to switch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleToggle();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dashboardMode, isAnimating]);

  // If single mode (website or app), just show a badge indicator
  if (!showToggle && singleModeDashboard) {
    return (
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${singleModeDashboard.gradient} text-white`}>
        {singleModeDashboard.icon}
        <span className="text-sm font-semibold">{singleModeLabel}</span>
      </div>
    );
  }

  // Full page overlay rendered via portal to ensure it covers EVERYTHING
  const overlay = (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          className="fixed inset-0 overflow-hidden"
          style={{
            zIndex: 999999,
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'all',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated gradient background - starts from center and expands */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${displayTarget.bgGradient}`}
            initial={{
              clipPath: 'circle(0% at 50% 50%)',
            }}
            animate={{
              clipPath: animationPhase === 'collapsing'
                ? 'circle(0% at 50% 50%)'
                : 'circle(150% at 50% 50%)',
            }}
            transition={{
              duration: animationPhase === 'collapsing' ? 0.5 : 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          {/* Animated particles/sparkles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080) - 200],
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.03,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>

          {/* Center content - shows ONLY target mode name (CMS or Apps) */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: animationPhase === 'showing' || animationPhase === 'expanding' ? 1 : 0,
              scale: animationPhase === 'showing' ? 1 : animationPhase === 'expanding' ? 0.8 : 0.5,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="text-center text-white">
              {/* Large icon - ONLY shows target icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/30"
              >
                {displayTarget.id === 'application' ? (
                  <AppWindow className="w-14 h-14" />
                ) : (
                  <LayoutDashboard className="w-14 h-14" />
                )}
              </motion.div>

              {/* RustPress CMS or RustPress Apps - ONLY shows target name */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-5xl font-bold tracking-tight"
              >
                <span className="opacity-80">RustPress</span>{' '}
                <span>{displayTarget.shortName}</span>
              </motion.h1>

              {/* Loading indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex justify-center gap-2 mt-8"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-white/60 rounded-full"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.12,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Portal overlay to cover everything including sidebar */}
      {typeof document !== 'undefined' && createPortal(overlay, document.body)}

      {/* Compact Toggle Button for Sidebar */}
      <motion.button
        onClick={handleToggle}
        disabled={isAnimating}
        className={`relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-r ${current.gradient} text-white shadow-md overflow-hidden`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title={`Switch to ${target.shortName} (Ctrl+D)`}
      >
        {/* Icon only */}
        <span className="relative z-10">
          {current.id === 'cms' ? (
            <LayoutDashboard className="w-4 h-4" />
          ) : (
            <AppWindow className="w-4 h-4" />
          )}
        </span>
      </motion.button>
    </>
  );
}

// Compact toggle for mobile/smaller spaces
export function DashboardSwitcherCompact() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'active'>('idle');
  const navigate = useNavigate();
  const { dashboardMode, setDashboardMode } = useAppStore();

  const currentDashboard = dashboardMode === 'apps' ? 'application' : 'cms';
  const target = dashboards.find(d => d.id !== currentDashboard)!;

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationPhase('active');

    setTimeout(() => {
      setDashboardMode(target.id === 'application' ? 'apps' : 'cms');
      navigate(target.path);
    }, 600);

    setTimeout(() => {
      setAnimationPhase('idle');
      setIsAnimating(false);
    }, 1200);
  };

  return (
    <>
      {/* Full page overlay */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className={`fixed inset-0 z-[9999] bg-gradient-to-br ${target.bgGradient}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 flex items-center justify-center text-white"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center"
                >
                  {target.icon}
                </motion.div>
                <p className="text-lg font-semibold">{target.shortName}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact toggle button */}
      <motion.button
        onClick={handleToggle}
        disabled={isAnimating}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`relative w-12 h-12 rounded-xl bg-gradient-to-r ${target.gradient} text-white shadow-lg transition-all hover:shadow-xl flex items-center justify-center`}
        title={`Switch to ${target.name}`}
      >
        {target.icon}
      </motion.button>
    </>
  );
}

// Large toggle for sidebar
export function DashboardSwitcherLarge() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'expanding' | 'showing' | 'collapsing'>('idle');
  const navigate = useNavigate();
  const { dashboardMode, setDashboardMode } = useAppStore();

  const currentDashboard = dashboardMode === 'apps' ? 'application' : 'cms';
  const current = dashboards.find(d => d.id === currentDashboard) || dashboards[0];
  const target = dashboards.find(d => d.id !== currentDashboard)!;

  const handleToggle = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setAnimationPhase('expanding');

    setTimeout(() => setAnimationPhase('showing'), 400);
    setTimeout(() => {
      setDashboardMode(target.id === 'application' ? 'apps' : 'cms');
      navigate(target.path);
      setAnimationPhase('collapsing');
    }, 1000);
    setTimeout(() => {
      setAnimationPhase('idle');
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <>
      {/* Full Page Transition - same as main component */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            className="fixed inset-0 z-[9999] overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${target.bgGradient}`}
              initial={{ clipPath: 'circle(0% at 50% 100%)' }}
              animate={{
                clipPath: animationPhase === 'collapsing'
                  ? 'circle(0% at 50% 0%)'
                  : 'circle(150% at 50% 100%)',
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: animationPhase === 'showing' ? 1 : 0 }}
            >
              <div className="text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: animationPhase === 'showing' ? 1 : 0 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center"
                >
                  {target.id === 'application' ? <AppWindow className="w-10 h-10" /> : <LayoutDashboard className="w-10 h-10" />}
                </motion.div>
                <h2 className="text-2xl font-bold">{target.name}</h2>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Large toggle card */}
      <motion.div
        onClick={handleToggle}
        className="cursor-pointer p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Mode</span>
          <motion.div
            className={`w-12 h-6 rounded-full p-1 ${currentDashboard === 'cms' ? 'bg-indigo-500' : 'bg-pink-500'}`}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow"
              animate={{ x: currentDashboard === 'cms' ? 0 : 24 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${current.gradient} text-white`}>
            {current.icon}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 dark:text-white">{current.shortName}</p>
            <p className="text-xs text-neutral-500">{current.description}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
