import { useState, useEffect } from 'react';
import LessonCard from './LessonCard';
import { FiCalendar, FiInbox, FiPlus } from 'react-icons/fi';

// Функція для розрахунку "живого" статусу
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

function WeeklySchedule({ 
  lessons, isDarkMode, onTogglePayment, onToggleCompleted, 
  onDeleteLesson, onEditLesson, onMoveLesson, onAddLessonForDay,
  onCompleteSchool, 
  activeWorkspace, showAddMenu, onOpenAdd // НОВІ ПРОПСИ
}) {
  const days = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  
  // ВИЗНАЧАЄМО СЬОГОДНІШНІЙ ДЕНЬ
  const jsDay = new Date().getDay(); 
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
        const isToday = day === todayName; 

        return (
          <div 
            key={day} 
            className={`schedule-day-zone ${isDraggingOver ? 'dragging-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDraggedOverDay(day); }}
            onDragLeave={() => setDraggedOverDay(null)}
            onDrop={(e) => handleDrop(e, day)}
            style={{ 
              marginBottom: '30px',
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
                fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', 
                color: isToday ? '#3b82f6' : (isDarkMode ? '#f3f4f6' : '#1f2937') 
              }}>
                <FiCalendar style={{ color: isToday ? '#3b82f6' : '#8b5cf6' }} /> 
                {day}
                
                {isToday && (
                  <span style={{ 
                    fontSize: '11px', backgroundColor: '#3b82f6', color: 'white', 
                    padding: '3px 10px', borderRadius: '20px', fontWeight: 'bold',
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>
                    Сьогодні
                  </span>
                )}
              </h2>
              
              {/* НОВИЙ БЛОК З КНОПКОЮ ДОДАТИ І МЕНЮ */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => onAddLessonForDay(day)} className="btn-add-day-lesson" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <FiPlus /> Додати
                </button>
                
                {showAddMenu === day && activeWorkspace === 'all' && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: isDarkMode ? '#1f2937' : 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 50, width: '180px', border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`, overflow: 'hidden' }}>
                    <button onClick={() => onOpenAdd('tutor', day)} style={{ width: '100%', padding: '10px 15px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🎓 Урок
                    </button>
                    <button onClick={() => onOpenAdd('school', day)} style={{ width: '100%', padding: '10px 15px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', borderTop: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}` }}>
                      🏫 Школа
                    </button>
                  </div>
                )}
              </div>
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
                    onCompleteSchool={onCompleteSchool}
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