import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

function AddLessonForm({ students, initialData, prefillDay, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
    dayOfWeek: prefillDay || 'Понеділок',
    time: '15:00',
    duration: 60,
    isOnline: true,
    isRegular: true // ДОДАНО: За замовчуванням урок постійний
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.student.id,
        dayOfWeek: initialData.dayOfWeek,
        time: initialData.time,
        duration: initialData.duration || 60,
        isOnline: initialData.isOnline !== undefined ? initialData.isOnline : true,
        isRegular: initialData.isRegular !== undefined ? initialData.isRegular : true // ДОДАНО
      });
    } else if (prefillDay) {
      setFormData(prev => ({ ...prev, dayOfWeek: prefillDay }));
    }
  }, [initialData, prefillDay]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    // Обробка для select типу уроку (перетворюємо рядок на булеве значення)
    if (e.target.name === 'isRegular') {
      setFormData({ ...formData, [e.target.name]: e.target.value === 'true' });
    } else {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert('Будь ласка, оберіть учня!');
      return;
    }

    const selectedStudent = students.find(s => s.id === Number(formData.studentId));
    
    const lessonData = {
      id: initialData ? initialData.id : Date.now(),
      student: selectedStudent,
      dayOfWeek: formData.dayOfWeek,
      time: formData.time,
      duration: Number(formData.duration),
      isOnline: formData.isOnline,
      isRegular: formData.isRegular, // ДОДАНО: Зберігаємо тип уроку
      paymentStatus: initialData ? initialData.paymentStatus : 'debt',
      isCompleted: initialData ? initialData.isCompleted : false
    };

    onSave(lessonData);
  };

  return (
    <form className="add-lesson-form" onSubmit={handleSubmit} style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {initialData ? '✏️ Редагувати урок' : '📅 Додати новий урок'}
      </h2>
      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Учень</label>
          <select name="studentId" value={formData.studentId} onChange={handleChange} required>
            {students.length === 0 ? <option value="">Немає учнів у базі</option> : null}
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade} кл.)</option>)}
          </select>
        </div>

        {/* ДОДАНО: Вибір типу уроку */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Тип уроку</label>
          <select name="isRegular" value={formData.isRegular} onChange={handleChange} style={{ fontWeight: 'bold', color: formData.isRegular ? '#3b82f6' : '#8b5cf6' }}>
            <option value="true">🔄 Постійний (щотижня)</option>
            <option value="false">1️⃣ Одноразовий (дод. заняття / перенесення)</option>
          </select>
        </div>

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
          <label>Тривалість (хв)</label>
          <select name="duration" value={formData.duration} onChange={handleChange}>
            <option value="45">45 хвилин</option>
            <option value="60">60 хвилин (1 година)</option>
            <option value="90">90 хвилин (1.5 години)</option>
            <option value="120">120 хвилин (2 години)</option>
          </select>
        </div>
        
        <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px', backgroundColor: 'var(--primary-bg)', borderRadius: '10px' }}>
          <input type="checkbox" id="isOnline" name="isOnline" checked={formData.isOnline} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
          <label htmlFor="isOnline" style={{ cursor: 'pointer', margin: 0, fontWeight: 'bold' }}>🌐 Це онлайн урок</label>
        </div>
      </div>
      <div className="form-actions" style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
        <button type="submit" className="btn-submit" style={{ flex: 1, backgroundColor: '#8b5cf6' }}>
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