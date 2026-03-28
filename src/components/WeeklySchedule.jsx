import { useState, useEffect } from 'react';
import LessonCard from './LessonCard';
import { FiCalendar, FiInbox, FiPlus } from 'react-icons/fi';

// Функція для розрахунку "живого" статусу (залишаємо без змін)
const getLessonLiveStatus = (lessonTime, duration, lessonDay) => {
  const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
  const now = new Date();
  const currentDayName = days[now.getDay()];

  if (currentDayName !== lessonDay) return { type: 'upcoming' };

  const [hours, minutes] = lessonTime.split(':').map(Number);
  const startTotal = hours * 60 + minutes;
  const nowTotal = now.getHours() * 60 + now.getMinutes();
  const endTotal = startTotal + (duration || 60);

  if (nowTotal >= startTotal && nowTotal < endTotal) {
    return { 
      type: 'active', 
      remaining: endTotal - nowTotal, 
      progress: Math.round(((nowTotal - startTotal) / (duration || 60)) * 100) 
    };
  }
  if (nowTotal < startTotal && startTotal - nowTotal <= 30) {
    return { type: 'near', inMinutes: startTotal - nowTotal };
  }
  return { type: nowTotal >= endTotal ? 'finished' : 'upcoming' };
};

function WeeklySchedule({ lessons, onTogglePayment, onToggleCompleted, onDeleteLesson, onEditLesson, onMoveLesson, onAddLessonForDay, isDarkMode }) {
  const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  
  // ВИЗНАЧАЄМО СЬОГОДНІШНІЙ ДЕНЬ
  const jsDay = new Date().getDay(); // 0 - неділя, 1 - понеділок...
  const todayName = jsDay === 0 ? 'Неділя' : days[jsDay - 1];

  const [draggedOverDay, setDraggedOverDay] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const groupedLessons = days.reduce((acc, day) => {
    acc[day] = lessons.filter(l => l.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  const handleDrop = (e, day) => {
    e.preventDefault();
    setDraggedOverDay(null);
    const lessonId = Number(e.dataTransfer.getData('lessonId'));
    if (lessonId) onMoveLesson(lessonId, day);
  };

  return (
    <div className="schedule-container">
      {days.map(day => {
        const dayLessons = groupedLessons[day];
        const isDraggingOver = draggedOverDay === day;
        const isToday = day === todayName; // Перевірка чи цей день є сьогоднішнім

        return (
          <div 
            key={day} 
            className={`schedule-day-zone ${isDraggingOver ? 'dragging-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDraggedOverDay(day); }}
            onDragLeave={() => setDraggedOverDay(null)}
            onDrop={(e) => handleDrop(e, day)}
            style={{ 
              marginBottom: '30px',
              // Якщо день сьогоднішній, додамо йому дуже легку підсвітку фону
              backgroundColor: isToday ? (isDarkMode ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)') : 'transparent',
              borderRadius: '12px',
              padding: '10px'
            }}
          >
            <div className="day-header-container" style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              borderBottom: `2px solid ${isToday ? '#3b82f6' : (isDarkMode ? '#374151' : '#e5e7eb')}`, 
              paddingBottom: '10px', 
              marginBottom: '15px' 
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: isToday ? '#3b82f6' : (isDarkMode ? '#f3f4f6' : '#1f2937') 
              }}>
                <FiCalendar style={{ color: isToday ? '#3b82f6' : '#8b5cf6' }} /> 
                {day}
                
                {/* ПОВЕРНУЛИ БЕЙДЖ "СЬОГОДНІ" */}
                {isToday && (
                  <span style={{ 
                    fontSize: '11px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    padding: '3px 10px', 
                    borderRadius: '20px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Сьогодні
                  </span>
                )}
              </h2>
              
              <button onClick={() => onAddLessonForDay(day)} className="btn-add-day-lesson">
                <FiPlus /> Додати
              </button>
            </div>
            
            {dayLessons.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                {dayLessons.map(lesson => (
                  <LessonCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    liveStatus={getLessonLiveStatus(lesson.time, lesson.duration, day)}
                    onTogglePayment={onTogglePayment} 
                    onToggleCompleted={onToggleCompleted} 
                    onDeleteLesson={onDeleteLesson} 
                    onEditLesson={onEditLesson} 
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-day-dropzone">
                <FiInbox size={20} style={{ opacity: 0.5 }} />
                <p style={{ fontSize: '13px' }}>Немає уроків</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeeklySchedule;