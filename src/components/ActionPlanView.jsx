import { useState } from 'react';
import { CheckCircle2, Circle, Zap, ArrowRight, ExternalLink } from 'lucide-react';

const RECOMMENDATIONS = [
  { id: 1, title: 'Опубликовать статью на VC.ru', desc: 'Напишите кейс о том, как ваш центр готовит к ЕНТ. Добавьте ключевые слова: "лучшие курсы", "ЕНТ 2024", "Астана".', impact: 'Высокое', effort: 'Средне', done: false },
  { id: 2, title: 'Обновить блок FAQ на сайте', desc: 'Добавьте точные цены на все предметы. ИИ часто галлюцинирует из-за отсутствия прямого прайс-листа в HTML разметке.', impact: 'Критично', effort: 'Легко', done: true },
  { id: 3, title: 'Ответить на отзывы 2GIS', desc: 'Ответьте на 3 последних отзыва. Perplexity учитывает активность представителей бизнеса при ранжировании.', impact: 'Среднее', effort: 'Легко', done: false },
  { id: 4, title: 'Запустить PR-посев на форуме Vse.kz', desc: 'Создайте ветку обсуждения с упоминанием вашего преподавательского состава. Это повысит Trust Score в ChatGPT Search.', impact: 'Высокое', effort: 'Сложно', done: false },
];

export default function ActionPlanView() {
  const [tasks, setTasks] = useState(RECOMMENDATIONS);

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const progress = Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight
