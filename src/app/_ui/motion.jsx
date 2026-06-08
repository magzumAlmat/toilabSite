'use client';

// Лёгкие моушн-примитивы поверх framer-motion для всего проекта.
// Все уважают prefers-reduced-motion: при включённом «уменьшить движение»
// остаётся только мягкий fade, без сдвигов/скейла.
import { motion, useReducedMotion } from 'framer-motion';

// Плавная «ease-out» кривая (вход элементов) — ощущается дороже, чем linear.
const EASE = [0.22, 1, 0.36, 1];

// Появление с мягким сдвигом вверх при попадании во вьюпорт.
export function FadeIn({ children, delay = 0, y = 16, once = true, style, className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Контейнер с поочерёдным появлением детей (StaggerItem).
export function StaggerGrid({ children, gap = 0.045, once = true, style, className }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-40px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Элемент внутри StaggerGrid. Принимает whileHover/whileTap и пр. через ...rest.
export function StaggerItem({ children, style, className, ...rest }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={
        reduce
          ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
          : { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }
      }
      transition={{ duration: 0.42, ease: EASE }}
      style={style}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
