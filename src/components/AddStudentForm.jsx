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
    lessonsPerWeek: '2',
    balance: 0 // ДОДАНО: Стан для балансу
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
        lessonsPerWeek: initialData.lessonsPerWeek || '2',
        balance: initialData.balance || 0 // ДОДАНО: Підтягуємо існуючий баланс
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
      lessonsPerWeek: Number(formData.lessonsPerWeek),
      contacts: {
        phone: formData.phone,
        messengers: [formData.messengers],
        parentPhone: formData.parentPhone
      },
      notes: formData.notes,
      balance: Number(formData.balance) // ДОДАНО: Оновлюємо баланс при збереженні
    } : {
      id: Date.now(),
      name: formData.name,
      grade: Number(formData.grade),
      price: Number(formData.defaultPrice),
      paymentType: formData.paymentType,
      format: formData.format, 
      lessonsPerWeek: Number(formData.lessonsPerWeek),
      contacts: {
        phone: formData.phone,
        messengers: [formData.messengers],
        parentPhone: formData.parentPhone
      },
      notes: formData.notes,
      balance: Number(formData.balance) || 0 // ДОДАНО: Зберігаємо початковий баланс
    };

    onSave(studentData);
  };

  return (
    <form className="add-lesson-form" style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }} onSubmit={handleSubmit}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        {initialData ? '✏️ Редагувати дані учня' : '👤 Додати нового учня'}
      </h2>
      
      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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

        {/* НОВИЙ БЛОК: РУЧНЕ КЕРУВАННЯ БАЛАНСОМ */}
        <div className="form-group" style={{ gridColumn: '1 / -1', backgroundColor: 'var(--primary-bg)', padding: '15px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', color: formData.balance < 0 ? 'var(--danger-red)' : (formData.balance > 0 ? 'var(--success-green)' : 'inherit') }}>
            <span>Поточний баланс (₴)</span>
            <span style={{ fontSize: '11px', fontWeight: 'normal', opacity: 0.6 }}>Можна редагувати вручну</span>
          </label>
          <input 
            type="number" 
            name="balance" 
            value={formData.balance} 
            onChange={handleChange} 
            style={{ 
              borderColor: formData.balance < 0 ? '#fca5a5' : 'var(--border-subtle)',
              fontWeight: 'bold',
              color: formData.balance < 0 ? 'var(--danger-red)' : (formData.balance > 0 ? 'var(--success-green)' : 'inherit')
            }} 
          />
        </div>
        
        <div className="form-group">
          <label>Формат занять</label>
          <select name="format" value={formData.format} onChange={handleChange}>
            <option value="online">🌐 Тільки Онлайн</option>
            <option value="offline">🏫 Тільки Офлайн</option>
            <option value="mixed">🔄 Змішаний (Онлайн/Офлайн)</option>
          </select>
        </div>

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

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Месенджер</label>
          <select name="messengers" value={formData.messengers} onChange={handleChange}>
            <option value="telegram">Telegram</option>
            <option value="viber">Viber</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label>Примітки (характер, теми, особливості)</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
        </div>
      </div>
      
      <div className="form-actions" style={{ marginTop: '25px', display: 'flex', gap: '15px' }}>
        <button type="submit" className="btn-submit" style={{ flex: 1, backgroundColor: 'var(--primary-purple)', color: 'white' }}>
          <FiSave /> {initialData ? 'Зберегти зміни' : 'Зберегти учня'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel} style={{ flex: 1 }}>
          <FiX /> Скасувати
        </button>
      </div>
    </form>
  );
}

export default AddStudentForm;