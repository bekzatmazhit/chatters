import { useState } from 'react';
import { X, ChevronRight, Check } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: 'sidebar',
    title: 'Навигация по платформе',
    content: 'Здесь находятся все основные модули: от общей сводки до аналитики ИИ-выдачи.',
    position: 'left-[240px] top-[100px]'
  },
  {
    target: 'search',
    title: 'Умный поиск',
    content: 'Ищите конкретные запросы, галлюцинации или задачи по оптимизации.',
    position: 'left-[50%] top-[70px] -translate-x-1/2'
  },
  {
    target: 'new_scan',
    title: 'Новый скан',
    content: 'Запускайте ручной опрос нейросетей от лица созданных персонажей.',
    position: 'right-[150px] top-[70px]'
  }
];

export default function TourOverlay({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handleSkip = () => {
    onClose();
    setCurrentStep(0);
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-auto">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={handleSkip} />
      
      {/* Spotlight simulation (just static visual for now) */}
      <div 
        className="absolute bg-panel border-2 border-accent rounded-xl shadow-2xl p-5 w-[300px] transition-all duration-300 ease-out z-[101]"
        style={{
          // Extract basic position classes and apply them
          // In a real app we'd use getBoundingClientRect on elements
          left: step.position.includes('left-') ? step.position.split('left-[')[1].split(']')[0] : 'a
