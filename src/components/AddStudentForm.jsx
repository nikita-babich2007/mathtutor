import { useState, useEffect } from 'react';
import { FiSave, FiX } from 'react-icons/fi';

function AddStudentForm({ initialData, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    defaultPrice: '',
    phone: '',
    messengers: 'telegram',
    parentPhone: '',
    notes: '',
    paymentType: 'per_lesson',
    format: 'online',
    lessonsPerWeek: '2' // НОВОЕ ПОЛЕ: По умолчанию 2 раза в неделю
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        grade: initialData.grade,
        defaultPrice: initialData.price,
        phone: initialData.contacts?.phone || '',
        messengers: initialData.contacts?.messengers?.[0] || 'telegram',
        parentPhone: initialData.contacts?.parentPhone || '',
        notes: initialData.notes || '',
        paymentType: initialData.paymentType || 'per_lesson',
        format: initialData.format || 'online',
        lessonsPerWeek: initialData.lessonsPerWeek || '2' // Подтягиваем старое
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const studentData = initialData ? {
      ...initialData,
      name: formData.name,
      grade: Number(formData.grade),
      price: Number(formData.defaultPrice),
      paymentType: formData.paymentType,
      format: formData.format, 
      lessonsPerWeek: Number(formData.lessonsPerWeek), // Сохраняем как число
      contacts: {
        phone: formData.phone,
        messengers: [formData.messengers],
        parentPhone: formData.parentPhone
      },
      notes: formData.notes
    } : {
      id: Date.now(),
      name: formData.name,
      grade: Number(formData.grade),
      price: Number(formData.defaultPrice),
      paymentType: formData.paymentType,
      format: formData.format, 
      lessonsPerWeek: Number(formData.lessonsPerWeek), // Сохраняем как число
      contacts: {
        phone: formData.phone,
        messengers: [formData.messengers],
        parentPhone: formData.parentPhone
      },
      notes: formData.notes,
      balance: 0 
    };

    onSave(studentData);
  };

  return (
    <form className="add-lesson-form" style={{ borderTopColor: '#8b5cf6' }} onSubmit={handleSubmit}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {initialData ? '✏️ Редагувати дані учня' : '👤 Додати нового учня'}
      </h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Ім'я учня</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Клас</label>
          <input type="number" name="grade" value={formData.grade} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Ціна за урок (грн)</label>
          <input type="number" name="defaultPrice" value={formData.defaultPrice} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Формат занять</label>
          <select name="format" value={formData.format} onChange={handleChange}>
            <option value="online">🌐 Тільки Онлайн</option>
            <option value="offline">🏫 Тільки Офлайн</option>
            <option value="mixed">🔄 Змішаний (Онлайн/Офлайн)</option>
          </select>
        </div>

        {/* НОВОЕ ПОЛЕ: Частота занятий */}
        <div className="form-group">
          <label>Занять на тиждень</label>
          <select name="lessonsPerWeek" value={formData.lessonsPerWeek} onChange={handleChange}>
            <option value="1">1 раз на тиждень</option>
            <option value="2">2 рази на тиждень</option>
            <option value="3">3 рази на тиждень</option>
            <option value="4">4 рази на тиждень</option>
            <option value="5">5 разів на тиждень</option>
          </select>
        </div>

        <div className="form-group">
          <label>Як платить учень?</label>
          <select name="paymentType" value={formData.paymentType} onChange={handleChange}>
            <option value="per_lesson">За урок (поштучно)</option>
            <option value="monthly_prepay">Аванс за місяць</option>
            <option value="monthly_postpay">В кінці місяця</option>
          </select>
        </div>

        <div className="form-group">
          <label>Телефон учня</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <label>Телефон мами/тата</label>
          <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Месенджер</label>
          <select name="messengers" value={formData.messengers} onChange={handleChange}>
            <option value="telegram">Telegram</option>
            <option value="viber">Viber</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label>Примітки (характер, теми, особливості)</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
        </div>
      </div>
      
      <div className="form-actions" style={{ marginTop: '20px' }}>
        <button type="button" className="btn-cancel" onClick={onCancel} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiX /> Скасувати
        </button>
        <button type="submit" className="btn-submit" style={{ backgroundColor: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <FiSave /> {initialData ? 'Зберегти зміни' : 'Зберегти учня'}
        </button>
      </div>
    </form>
  );
}

export default AddStudentForm;