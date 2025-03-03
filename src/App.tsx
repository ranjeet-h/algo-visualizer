import { useState, useCallback, useEffect } from 'react';
import './App.css'
import { MainLayout } from './components/layout/main-layout'
import { 
  ArrayVisualizer,
  LinkedListVisualizer,
  StackVisualizer,
  QueueVisualizer,
  DequeVisualizer,
  HashVisualizer,
  HashSetVisualizer
} from './components/visualizer'
import { BinaryTreeVisualizer } from './components/visualizer/tree/binary';
import { Zap, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer } from 'react-toastify';
// import { cn } from './lib/utils';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedItem, setSelectedItem] = useState('Singly Linked List');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for smoother transitions
  useEffect(() => {
    // Force dark mode
    // document.documentElement.classList.add('dark');
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = useCallback((category: string, item: string) => {
    setIsLoading(true);
    // Small delay for loading animation
    setTimeout(() => {
      setSelectedCategory(category);
      setSelectedItem(item);
      setIsLoading(false);
    }, 300);
  }, []);

  // Render content based on selected item
  const renderContent = useCallback(() => {
    // If nothing is selected, show the ArrayVisualizer by default instead of the welcome screen
    if (!selectedCategory || !selectedItem) {
      return (
        <ArrayVisualizer 
          key="default-visualizer"
          initialArray={[15, 8, 23, 4, 42, 16, 30, 7, 11, 35]}
        />
      );
    }

    // Data Structures
    if (selectedCategory === 'Data Structures') {
      if (selectedItem === 'Arrays') {
        return (
          <ArrayVisualizer 
            key={`${selectedCategory}-${selectedItem}`}
            initialArray={[15, 8, 23, 4, 42, 16, 30, 7, 11, 35]}
          />
        );
      }
      
      // Handle "Linked Lists" parent category and its child items
      if (selectedItem === 'Linked Lists' || selectedItem === 'Singly Linked List') {
        return (
          <LinkedListVisualizer
            key={`${selectedCategory}-Singly-Linked-List`}
            type="singly"
          />
        );
      }
      if (selectedItem === 'Doubly Linked List') {
        return (
          <LinkedListVisualizer
            key={`${selectedCategory}-${selectedItem}`}
            type="doubly"
          />
        );
      }
      if (selectedItem === 'Circular Linked List') {
        return (
          <LinkedListVisualizer
            key={`${selectedCategory}-${selectedItem}`}
            type="circular"
          />
        );
      }
      
      // Handle "Stacks & Queues" parent category and its child items
      if (selectedItem === 'Stacks & Queues' || selectedItem === 'Stack') {
        return (
          <StackVisualizer
            key={`${selectedCategory}-Stack`}
          />
        );
      }
      if (selectedItem === 'Queue') {
        return (
          <QueueVisualizer
            key={`${selectedCategory}-${selectedItem}`}
          />
        );
      }
      if (selectedItem === 'Deque') {
        return (
          <DequeVisualizer
            key={`${selectedCategory}-${selectedItem}`}
          />
        );
      }
      if (selectedItem === 'Hash Map') {
        return (
          <HashVisualizer
            key={`${selectedCategory}-${selectedItem}`}
          />
        );
      }
      if (selectedItem === 'Hash Set') {
        return (
          <HashSetVisualizer
            key={`${selectedCategory}-${selectedItem}`}
          />
        );
      }
      if (selectedItem === 'Binary Tree') {
        return (
          <BinaryTreeVisualizer
            key={`${selectedCategory}-${selectedItem}`}
          />
        );
      }
      // Handle Trees parent category
      if (selectedItem === 'Trees') {
        return (
          <BinaryTreeVisualizer
            key={`${selectedCategory}-Trees`}
          />
        );
      }
    }

    // Algorithms
    if (selectedCategory === 'Algorithms') {
      if (selectedItem === 'Bubble Sort' || selectedItem === 'Selection Sort' || selectedItem === 'Insertion Sort' || selectedItem === 'Quick Sort' || selectedItem === 'Merge Sort') {
        return (
          <ArrayVisualizer 
            key={`${selectedCategory}-${selectedItem}`}
            initialArray={[15, 8, 23, 4, 42, 16, 30, 7, 11, 35]}
          />
        );
      }
      // Add other algorithms here
    }

    // Default if not implemented yet
    return <ComingSoonContent item={selectedItem} />;
  }, [selectedCategory, selectedItem]);

  return (
    <MainLayout onSelect={handleSelect}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div 
            key={`${selectedCategory}-${selectedItem}`}
            // className="min-h-[calc(100vh-4rem)] bg-[#0B0E14]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        theme="light"
      />
    </MainLayout>
  )
}

// Welcome screen component with modern design
/* 
function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 max-w-7xl mx-auto">
      <motion.div 
        className="mb-10"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-violet-600/20 dark:bg-violet-500/20 rounded-full blur-xl" />
          <div className="relative p-6 bg-gradient-to-br from-violet-600/80 to-violet-600/50 dark:from-violet-500/80 dark:to-violet-500/50 rounded-full">
            <Sparkles className="h-16 w-16 text-white" />
          </div>
        </div>
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-6xl font-bold mb-8 text-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-blue-500">
          Algorithm Visualizer
        </span>
      </motion.h1>
      
      <motion.p 
        className="text-xl text-center max-w-3xl mb-16 text-gray-300 leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        An interactive platform to visualize and understand data structures and algorithms.
        Select a topic from the sidebar to begin your exploration.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <CategoryCard 
          title="Data Structures"
          description="The building blocks of efficient software. Explore visual representations of how data is organized and stored."
          icon={<Layers className="h-7 w-7 text-blue-400" />}
          color="blue"
          features={[
            { icon: <Grid size={18} />, title: "Arrays" },
            { icon: <Hash size={18} />, title: "Linked Lists" },
            { icon: <Layers size={18} />, title: "Stacks & Queues" },
            { icon: <Grid size={18} />, title: "Trees & Graphs" }
          ]}
          delay={0.7}
        />
        
        <CategoryCard 
          title="Algorithms"
          description="Step-by-step procedures designed to solve specific problems and perform computations efficiently."
          icon={<Code className="h-7 w-7 text-purple-400" />}
          color="purple"
          features={[
            { icon: <LineChart size={18} />, title: "Sorting Algorithms" },
            { icon: <Grid size={18} />, title: "Searching Algorithms" },
            { icon: <Zap size={18} />, title: "Dynamic Programming" },
            { icon: <Hash size={18} />, title: "Graph Algorithms" }
          ]}
          delay={0.9}
        />
      </div>
    </div>
  );
}
*/

// Loading screen component with animations
function LoadingScreen() {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0E14]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-4 border-violet-500/30 rounded-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="absolute inset-0 border-4 border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
            animate={{ 
              rotate: 360
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        </div>
        <motion.p 
          className="mt-4 text-lg font-medium text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading visualization...
        </motion.p>
      </div>
    </motion.div>
  );
}

// "Coming Soon" component for unimplemented visualizations
function ComingSoonContent({ item }: { item: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-10 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-6 rounded-full bg-gray-800 mb-8"
      >
        <BookOpen className="h-12 w-12 text-gray-400" />
      </motion.div>
      
      <motion.h1 
        className="text-3xl font-bold mb-4 text-white"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {item} Visualization
      </motion.h1>
      
      <motion.p 
        className="text-xl text-center max-w-2xl text-gray-300 mb-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        We're currently working on bringing this visualization to life!
        Check back soon for an interactive experience.
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="p-6 rounded-xl border border-gray-700 bg-gray-800/50 max-w-md"
      >
        <h3 className="font-medium mb-2 text-white">In the meantime, explore:</h3>
        <ul className="text-gray-300 text-left space-y-2">
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" /> 
            <span>Interactive Array Visualizations</span>
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" /> 
            <span>Sorting Algorithms</span>
          </li>
          <li className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500" /> 
            <span>Our Documentation</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

// Category Card Component for Welcome Screen
/* 
function CategoryCard({ 
  title, 
  description, 
  icon, 
  color, 
  features, 
  delay = 0 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  color: string; 
  features: { icon: React.ReactNode; title: string }[];
  delay?: number;
}) {
  return (
    <motion.div 
      className={cn(
        "border border-[#1E2A45] rounded-xl overflow-hidden bg-[#121822] shadow-lg hover:shadow-xl transition-all duration-300",
        "hover:border-violet-500/10"
      )}
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ translateY: -5 }}
    >
      <div className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className={color === "blue" ? "p-3 rounded-lg bg-blue-900/30" : "p-3 rounded-lg bg-purple-900/30"}>
            {icon}
          </div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
        </div>
        
        <p className="mb-8 text-gray-400">
          {description}
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.title} 
              icon={feature.icon} 
              title={feature.title}
              delay={delay + 0.1 * (index + 1)}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
*/

// Feature card component for welcome screen
/* 
function FeatureCard({ 
  icon, 
  title,
  delay = 0
}: { 
  icon: React.ReactNode; 
  title: string;
  delay?: number;
}) {
  return (
    <motion.div 
      className="flex items-center gap-2 p-3 rounded-lg bg-[#0B0E14] border border-[#1E2A45] hover:bg-[#15182B] transition-colors"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03 }}
    >
      <div className="text-violet-500">{icon}</div>
      <span className="text-sm font-medium text-gray-200">{title}</span>
    </motion.div>
  );
}
*/

export default App
