import { Users, UserPlus, MoreHorizontal } from 'lucide-react';

const TEAM = [
  { id: 1, name: 'Ануар Карим', email: 'anuar@chatters.kz', role: 'Владелец', avatar: 'AK' },
  { id: 2, name: 'Сабина Муратова', email: 'sabina@chatters.kz', role: 'Администратор', avatar: 'СМ' },
  { id: 3, name: 'Даулет Оспанов', email: 'daulet@chatters.kz', role: 'Аналитик', avatar: 'ДО' },
];

export default function TeamView() {
  return (
    <div className="flex flex-col gap-6 fade-up pb-10">
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Профиль и Команда</h1>
          <p className="text-gray-500 text-[13px] mt-1">Управление доступом коллег к вашему рабочему пространству</p>
        </div>
        <button className="blue-btn"><UserPlus size={14} fill="white"/> Пригласить</button>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h2 className="text-[16px] font-bold text-gray-900">Участники проекта (3/5)</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Пользователь</th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Роль</th>
                <th className="px-6 py-3 text-left text-[12px] font-semibold text-gray-500 uppercase trac
