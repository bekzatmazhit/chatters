import { CheckCircle2, XCircle, AlertTriangle, Search, Filter } from 'lucide-react';

const MODELS_DATA = [
  { prompt: 'Посоветуй репетитора ЕНТ в Астане', category: 'Общие рекомендации', gpt4: 'knows', claude: 'hallucinates', gemini: 'knows', perplexity: 'knows' },
  { prompt: 'Сколько стоит обучение в вашем центре?', category: 'Цены', gpt4: 'unknown', claude: 'unknown', gemini: 'hallucinates', perplexity: 'unknown' },
  { prompt: 'Кто основатель центра TODAY?', category: 'Факты', gpt4: 'knows', claude: 'knows', gemini: 'knows', perplexity: 'knows' },
  { prompt: 'Топ курсов по математике', category: 'Сравнение', gpt4: 'hallucinates', claude: 'unknown', gemini: 'unknown', perplexity: 'knows' },
  { prompt: 'Отзывы о вашей платформе', category: 'Репутация', gpt4: 'knows', claude: 'knows', gemini: 'hallucinates', perplexity: 'unknown' },
];

const StatusBadge = ({ status }) => {
  if (status === 'knows') {
    return (
      <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold w-fit">
        <CheckCircle2 size={14} /> Знает
      </div>
    );
  }
  if (status === 'hallucinates') {
    return (
      <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold w-fit">
        <AlertTriangle size={14} /> Галлюцинирует
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold w-fit">
      <XCircle size={14} /> Не знает
    </div>
  );
};

export default function ModelsView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] fo
