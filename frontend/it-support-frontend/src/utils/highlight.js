// src/utils/highlight.js
export const highlightHtml = (text = '', kw = '') => {
  if (!kw.trim()) return text;

  // делим по пробелам/табам, убираем пустые элементы
  const words = kw.trim().split(/\s+/).filter(Boolean);

  // если пользователь ввёл только спец-символы
  if (words.length === 0) return text;

  // экранируем спец-символы в каждом слове
  const escaped = words
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');                                // word1|word2|word3

  const regex = new RegExp(`(${escaped})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
};