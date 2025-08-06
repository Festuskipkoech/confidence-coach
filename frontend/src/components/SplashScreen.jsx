import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Star, Zap } from 'lucide-react';

const SplashScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const splashSteps = [
    {
      icon: <Sparkles className="w-16 h-16" />,
      title: "Welcome to",
      subtitle: "Confidence Buddy",
      color: "from-purple-500 to-pink-500",
      gradientColors: ["#8b5cf6", "#ec4899"]
    },
    {
      icon: <Heart className="w-16 h-16" />,
      title: "Your Personal",
      subtitle: "Growth Companion",
      color: "from-pink-500 to-red-500",
      gradientColors: ["#ec4899", "#ef4444"]
    },
    {
      icon: <Star className="w-16 h-16" />,
      title: "Build Confidence",
      subtitle: "One Step at a Time",
      color: "from-yellow-500 to-orange-500",
      gradientColors: ["#eab308", "#f97316"]
    },
    {
      icon: <Zap className="w-16 h-16" />,
      title: "Ready to",
      subtitle: "Transform?",
      color: "from-blue-500 to-purple-500",
      gradientColors: ["#3b82f6", "#8b5cf6"]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentStep < splashSteps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - fade out and complete
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(onComplete, 500);
        }, 1500);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete, splashSteps.length]);

  const currentSplash = splashSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${currentSplash.color} opacity-90`}
              animate={{
                background: `linear-gradient(135deg, ${currentSplash.gradientColors[0]}, ${currentSplash.gradientColors[1]})`
              }}
              transition={{ duration: 0.8 }}
            />
            
            {/* Floating Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full"
                initial={{
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                  y: typeof window !== 'undefined' ? window.innerHeight + 10 : 800,
                }}
                animate={{
                  y: -10,
                  x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1000,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <div className="relative z-10 text-center text-white px-8">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mb-8 flex justify-center"
            >
              <div className="p-6 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                {currentSplash.icon}
              </div>
            </motion.div>

            <motion.div
              key={`text-${currentStep}`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <h1 className="text-2xl md:text-3xl font-light tracking-wide">
                {currentSplash.title}
              </h1>
              <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {currentSplash.subtitle}
              </h2>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex space-x-2">
                {splashSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep ? 'bg-white w-8' : 'bg-white/30 w-2'
                    }`}
                    animate={{
                      width: index <= currentStep ? 32 : 8,
                      backgroundColor: index <= currentStep ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.3)'
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Loading Text */}
            {currentStep === splashSteps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              >
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-white rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  {/* <span className="text-sm font-medium">Preparing your journey...</span> */}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;