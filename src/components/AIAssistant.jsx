import { useState, useRef } from 'react';
import { Bot, Send, Sparkles, X } from 'lucide-react';

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    text: 'Привет! Я ваш AI-ассистент для анализа видимости бренда. Что хотите узнать?',
  },
  {
    role: 'user',
    text: 'Почему бренд "Учебный центр TODAY" не упоминается в ответах ИИ?',
  },
  {
    role: 'ai',
    text: '🔍 Анализирую данные... Основная причина — слабое цифровое присутствие бренда. Нейросети обучаются на публичных текстах: статьях, форумах, отзывах. Рекомендую:\
\
• Создать страницы на 2ГИС, Google Maps, HH\
• Публиковать кейсы и отзывы учеников\
• Добиться упоминаний в региональных СМИ',
  },
];

const QUICK_ACTIONS = ['Что улучшить?', 'Почему 0%?', 'Топ конкуренты'];

export default function AIAssistant() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `Понял ваш запрос: «${msg}». Анализирую данные по вашим проектам и готовлю детальный ответ. Это демо-режим — полный AI-анализ будет доступен после подключения API.`,
        },
      ]);
      setIsTyping(false);
      bottom
