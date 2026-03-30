import { FiClock, FiEdit2, FiTrash2, FiVideo, FiMapPin, FiCheckCircle, FiXCircle, FiDollarSign, FiRepeat, FiCalendar } from 'react-icons/fi';

function LessonCard({ lesson, liveStatus, onTogglePayment, onToggleCompleted, onDeleteLesson, onEditLesson, isDarkMode }) {
  const student = lesson.student;
  const payType = student?.paymentType || 'per_lesson';
  
  // 1. ЛОГІКА ФОРМАТУ (Онлайн / Офлайн)
  const isOnline = lesson.isOnline !== undefined ? lesson.isOnline : true; 
  const formatText = isOnline ? 'Онлайн' : 'Офлайн';
  const FormatIcon = isOnline ? FiVideo : FiMapPin;
  const formatBg = isOnline ? (isDarkMode ? '#1e3a8a' : '#dbeafe') : (isDarkMode ? '#78350f' : '#fef3c7');
  const formatColor = isOnline ? (isDarkMode ? '#93c5fd' : '#2563eb') : (isDarkMode ? '#fcd34d' : '#d97706');

  // 2. ЛОГІКА ТИПУ УРОКУ (Постійний / Одноразовий)
  // За замовчуванням вважаємо всі старі уроки регулярними
  const isRegular = lesson.isRegular !== false; 
  const regText = isRegular ? 'Постійний' : 'Одноразовий';
  const RegIcon = isRegular ? FiRepeat : FiCalendar;
  const regBg = isRegular ? (isDarkMode ? '#334155' : '#f1f5f9') : (isDarkMode ? '#4c1d95' : '#ede9fe');
  const regColor = isRegular ? (isDarkMode ? '#cbd5e1' : '#64748b') : (isDarkMode ? '#c4b5fd' : '#8b5cf6');

  // 3. ЛОГІКА СТАТУСУ (Оплачено / Проведено)
  const isPaid = lesson.paymentStatus === 'paid';
  const isCompleted = lesson.isCompleted;

  let statusBg, statusColor, statusText, StatusIcon;

  if (payType === 'per_lesson') {
    statusBg = isPaid ? (isDarkMode ? '#064e3b' : '#d1fae5') : (isDarkMode ? '#7f1d1d' : '#fee2e2');
    statusColor = isPaid ? (isDarkMode ? '#6ee7b7' : '#059669') : (isDarkMode ? '#fca5a5' : '#dc2626');
    statusText = isPaid ? 'Оплачено' : 'Борг';
    StatusIcon = isPaid ? FiCheckCircle : FiXCircle;
  } else {
    statusBg = isCompleted ? (isDarkMode ? '#064e3b' : '#d1fae5') : (isDarkMode ? '#374151' : '#e5e7eb');
    statusColor = isCompleted ? (isDarkMode ? '#6ee7b7' : '#059669') : (isDarkMode ? '#9ca3af' : '#4b5563');
    statusText = isCompleted ? 'Проведено' : 'Очікує';
    StatusIcon = isCompleted ? FiCheckCircle : FiXCircle;
  }

  // 4. МАГІЯ DRAG & DROP
  const handleDragStart = (e) => {
    e.dataTransfer.setData('lessonId', lesson.id);
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };

  const handleDragEnd = (e) => { e.target.style.opacity = '1'; };

  const isActive = liveStatus?.type === 'active';
  const isNear = liveStatus?.type === 'near';

  return (
    <div 
      className={`lesson-card-modern ${isActive ? 'active-lesson-border' : ''}`}
      draggable="true" 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        backgroundColor: isActive 
          ? (isDarkMode ? '#064e3b' : '#f0fdf4') 
          : (isDarkMode ? '#1e293b' : '#ffffff'), // Змінив на чистий білий для світлої теми
        position: 'relative',
        cursor: 'grab'
      }}
    >
      {isActive && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: isDarkMode ? '#065f46' : '#d1fae5' }}>
          <div style={{ height: '100%', backgroundColor: '#10b981', width: `${liveStatus.progress}%`, transition: 'width 60s linear' }} />
        </div>
      )}

      <div className="lc-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', marginTop: isActive ? '5px' : '0' }}>
        <div className="lc-time" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold', color: isDarkMode ? '#f3f4f6' : '#1e293b' }}>
          <FiClock color={isActive ? '#10b981' : '#8b5cf6'} /> {lesson.time}
          
          {isActive && (
            <span style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '5px' }}>
              <span className="pulse-dot"></span> {liveStatus.remaining} хв
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => onEditLesson(lesson)} className="icon-btn edit-btn" title="Редагувати"><FiEdit2 size={16} /></button>
          <button onClick={() => onDeleteLesson(lesson.id)} className="icon-btn delete-btn" title="Видалити"><FiTrash2 size={16} /></button>
        </div>
      </div>

      {isNear && (
        <div style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', marginBottom: '10px', fontWeight: 'bold', display: 'inline-block' }}>
          🔔 Через {liveStatus.inMinutes} хв
        </div>
      )}

      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: isDarkMode ? '#f3f4f6' : '#111827' }}>
          {student.name} <span style={{ fontSize: '13px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: 'normal' }}>({student.grade} кл.)</span>
        </h3>
        <div style={{ fontSize: '14px', color: isDarkMode ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiDollarSign /> Ціна: <strong>{student.price} ₴</strong>
        </div>
      </div>

      {/* ОНОВЛЕНО: Блок з бейджами */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', backgroundColor: formatBg, color: formatColor }}>
          <FormatIcon size={14} /> {formatText}
        </span>
        
        {/* ДОДАНО: Бейдж типу уроку */}
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', backgroundColor: regBg, color: regColor }}>
          <RegIcon size={14} /> {regText}
        </span>
      </div>

      <div style={{ borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '12px', marginTop: 'auto' }}>
        <button 
          onClick={() => payType === 'per_lesson' ? onTogglePayment(lesson.id) : onToggleCompleted(lesson.id)}
          style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', border: 'none', cursor: 'pointer', backgroundColor: statusBg, color: statusColor, transition: '0.2s' }}
        >
          <StatusIcon size={16} /> {statusText}
        </button>
      </div>
    </div>
  );
}

export default LessonCard;