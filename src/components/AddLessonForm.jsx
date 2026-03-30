import { useState, useEffect } from 'react';
import { FiSave, FiX, FiBriefcase } from 'react-icons/fi';

function AddLessonForm({ students, initialData, prefillDay, onSave, onCancel, activeWorkspace }) {
  // Визначаємо, чи ми зараз створюємо/редагуємо шкільний блок
  const isSchoolMode = activeWorkspace === 'school' || initialData?.isSchool;

  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
    subject: 'Інформатика', // ДОДАНО: Для школи (Предмет та клас)
    dayOfWeek: prefillDay || 'Понеділок',
    time: isSchoolMode ? '12:40' : '15:00',
    duration: isSchoolMode ? 300 : 60, // 300 хвилин = 5 годин (твоя зміна)
    isOnline: true,
    isRegular: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.student?.id || (students.length > 0 ? students[0].id : ''),
        subject: initialData.subject || 'Інформатика',
        dayOfWeek: initialData.dayOfWeek,
        time: initialData.time,
        duration: initialData.duration || (initialData.isSchool ? 300 : 60),
        isOnline: initialData.isOnline !== undefined ? initialData.isOnline : true,
        isRegular: initialData.isRegular !== undefined ? initialData.isRegular : true
      });
    } else if (prefillDay) {
      setFormData(prev => ({ ...prev, dayOfWeek: prefillDay }));
    }
  }, [initialData, prefillDay, students]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (e.target.name === 'isRegular') {
      setFormData({ ...formData, [e.target.name]: e.target.value === 'true' });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let lessonData;

    if (isSchoolMode) {
      // ЛОГІКА ЗБЕРЕЖЕННЯ ДЛЯ ШКОЛИ
      lessonData = {
        id: initialData ? initialData.id : Date.now(),
        isSchool: true, // Вказуємо, що це шкільний блок
        subject: formData.subject,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time,
        duration: Number(formData.duration),
        isRegular: formData.isRegular,
        isCompleted: initialData ? initialData.isCompleted : false
      };
    } else {
      // ЛОГІКА ЗБЕРЕЖЕННЯ ДЛЯ РЕПЕТИТОРА
      if (!formData.studentId) {
        alert('Будь ласка, оберіть учня!');
        return;
      }
      const selectedStudent = students.find(s => s.id === Number(formData.studentId));
      lessonData = {
        id: initialData ? initialData.id : Date.now(),
        isSchool: false,
        student: selectedStudent,
        dayOfWeek: formData.dayOfWeek,
        time: formData.time,
        duration: Number(formData.duration),
        isOnline: formData.isOnline,
        isRegular: formData.isRegular,
        paymentStatus: initialData ? initialData.paymentStatus : 'debt',
        isCompleted: initialData ? initialData.isCompleted : false
      };
    }

    onSave(lessonData);
  };

  return (
    <form className="add-lesson-form" onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', borderTop: isSchoolMode ? '5px solid #3b82f6' : '5px solid #8b5cf6' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: isSchoolMode ? '#3b82f6' : 'inherit' }}>
        {initialData ? '✏️ Редагувати запис' : (isSchoolMode ? '🏫 Додати шкільну зміну' : '📅 Додати урок репетитора')}
      </h2>
      
      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        {/* --- ПОЛЯ, ЩО ЗМІНЮЮТЬСЯ ЗАЛЕЖНО ВІД РЕЖИМУ --- */}
        {isSchoolMode ? (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Предмет та Клас (або опис зміни)</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Напр. Інформатика (5-А) або Повна зміна" required />
          </div>
        ) : (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Учень</label>
            <select name="studentId" value={formData.studentId} onChange={handleChange} required>
              {students.length === 0 ? <option value="">Немає учнів у базі</option> : null}
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade} кл.)</option>)}
            </select>
          </div>
        )}

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Тип запису</label>
          <select name="isRegular" value={formData.isRegular} onChange={handleChange} style={{ fontWeight: 'bold', color: formData.isRegular ? '#3b82f6' : '#8b5cf6' }}>
            <option value="true">🔄 Постійний графік (щотижня)</option>
            <option value="false">{isSchoolMode ? '1️⃣ Одноразова заміна' : '1️⃣ Одноразовий (перенесення)'}</option>
          </select>
        </div>

        {/* --- СПІЛЬНІ ПОЛЯ --- */}
        <div className="form-group">
          <label>День тижня</label>
          <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange}>
            {['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'].map(day => (
              <option key={day} value={day}>{day}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Час початку</label>
          <input type="time" name="time" value={formData.time} onChange={handleChange} required />
        </div>
        
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Тривалість (у хвилинах)</label>
          {isSchoolMode ? (
            // Для школи даємо можливість вписати будь-яку кількість хвилин
            <input type="number" name="duration" value={formData.duration} onChange={handleChange} step="5" min="15" required />
          ) : (
            // Для репетитора залишаємо зручний випадаючий список
            <select name="duration" value={formData.duration} onChange={handleChange}>
              <option value="45">45 хвилин</option>
              <option value="60">60 хвилин (1 година)</option>
              <option value="90">90 хвилин (1.5 години)</option>
              <option value="120">120 хвилин (2 години)</option>
            </select>
          )}
        </div>
        
        {!isSchoolMode && (
          <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: 'var(--primary-bg)', borderRadius: '10px' }}>
            <input type="checkbox" id="isOnline" name="isOnline" checked={formData.isOnline} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <label htmlFor="isOnline" style={{ cursor: 'pointer', margin: 0, fontWeight: 'bold' }}>🌐 Це онлайн урок</label>
          </div>
        )}

      </div>
      
      <div className="form-actions" style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
        <button type="submit" className="btn-submit" style={{ flex: 1, backgroundColor: isSchoolMode ? '#3b82f6' : '#8b5cf6' }}>
          <FiSave /> {initialData ? 'Зберегти зміни' : 'Додати в розклад'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} style={{ flex: 1 }}>
          <FiX /> Скасувати
        </button>
      </div>
    </form>
  );
}

export default AddLessonForm;