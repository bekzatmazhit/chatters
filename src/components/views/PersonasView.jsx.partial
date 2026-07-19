import { useState } from 'react';
import { User, UserCircle2, Plus, Edit2, Trash2, CheckCircle2, Play, Users } from 'lucide-react';
import { useBrands } from '../BrandContext';

const DEFAULT_PERSONAS = [
  {
    id: 'default_1',
    name: 'Базовый юзер',
    age: '25-35',
    country: 'США',
    city: 'Нью-Йорк',
    role: 'Менеджер',
    hobbies: 'Технологии, бизнес',
    systemPrompt: 'Ты - обычный интернет-пользователь, ищешь лучшее решение для своей задачи.'
  },
  {
    id: 'default_2',
    name: 'CTO Стартапа',
    age: '30-40',
    country: 'Великобритания',
    city: 'Лондон',
    role: 'Технический директор',
    hobbies: 'Программирование, AI, инвестиции',
    systemPrompt: 'Ты технический директор (CTO) B2B стартапа. Ищешь надежные инструменты для масштабирования, обращаешь внимание на цены, документацию и интеграции.'
  },
  {
    id: 'default_3',
    name: 'Студент',
    age: '18-22',
    country: 'Казахстан',
    city: 'Алматы',
    role: 'Студент',
    hobbies: 'Игры, учеба, гаджеты',
    systemPrompt: 'Ты студент ВУЗа. Ищешь дешевые или бесплатные решения, обращаешь внимание на отзывы и удобство интерфейса.'
  }
];

export default function PersonasView() {
  const { activeBrand } = useBrands();
  const [personas, setPersonas] = useState([...DEFAULT_PERSONAS]);
  const [activePersonaId, setActivePersonaId] = useState(personas[0].id);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const activePersona = personas.find(p => p.id === activePersonaId) || personas[0];

  con
