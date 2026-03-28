import { useState } from 'react';
import { 
  FiUsers, FiUser, FiDollarSign, FiEdit2, FiTrash2, FiChevronRight, 
  FiChevronDown, FiPhone, FiSmile, FiBook, FiRepeat, FiClock, FiActivity, FiMessageCircle, FiCreditCard, FiGlobe, FiSearch 
} from 'react-icons/fi'; 

function StudentListView({ students, archive, transactions, onDelete, onEdit, onAddNew, isDarkMode }) {
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleExpand = (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(studentId);
      setActiveTab('info');
    }
  };

  const getFormatBadge = (format) => {
    if (format === 'online') return { bg: '#dbeafe', color: '#2563eb', text: '🌐 Онлайн' };
    if (format === 'offline') return { bg: '#fef3c7', color: '#d97706', text: '🏫 Офлайн' };
    return { bg: '#d1fae5', color: '#059669', text: '🔄 Змішаний' }; 
  };

  const getPaymentTypeText = (type) => {
    if (type === 'per_lesson') return 'За кожен урок';
    if (type === 'monthly_prepay') return 'Аванс за місяць';
    if (type === 'monthly_postpay') return 'В кінці місяця';
    return 'Не вказано';
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="finance-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiUsers /> База учнів
          </h1>
          <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '5px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            Всього: {students.length}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Показуємо пошук тільки якщо є хоча б один учень у базі */}
          {students.length > 0 && (
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Пошук учня..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '10px 15px 10px 35px', 
                  borderRadius: '10px', 
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  color: isDarkMode ? 'white' : 'black',
                  outline: 'none',
                  width: '200px'
                }}
              />
            </div>
          )}
          
          <button onClick={onAddNew} className="btn-submit" style={{ backgroundColor: '#8b5cf6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUser /> + Новий учень
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* АБСОЛЮТНО ПОРОЖНЯ БАЗА */}
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: isDarkMode ? '#1f2937' : 'white', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, color: '#9ca3af' }}>
            <FiUsers size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>База учнів порожня</h3>
            <p style={{ margin: 0, fontSize: '15px' }}>Натисніть «+ Новий учень» зверху, щоб додати свого першого учня.</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          /* УЧНІ Є, АЛЕ ПОШУК НІЧОГО НЕ ЗНАЙШОВ */
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', backgroundColor: isDarkMode ? '#1f2937' : 'white', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
            <FiSearch size={32} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p style={{ margin: 0, fontSize: '15px' }}>Учня з таким ім'ям не знайдено</p>
          </div>
        ) : (
          /* СПИСОК УЧНІВ */
          filteredStudents.map((student) => {
            const bal = student.balance || 0;
            const isDebt = bal < 0;
            const isExpanded = expandedStudentId === student.id;
            const formatStyle = getFormatBadge(student.format);

            const studentArchive = archive.filter(a => a.student.id === student.id);
            const studentTxs = transactions.filter(t => t.studentId === student.id);
            
            const historyItems = [
              ...studentArchive.map(a => ({ ...a, type: 'lesson', sortDate: a.archiveDate })),
              ...studentTxs.map(t => ({ ...t, type: 'payment', sortDate: t.date }))
            ].sort((a, b) => new Date(b.sortDate) - new Date(a.sortDate));

            return (
              <div 
                key={student.id} 
                style={{ 
                  display: 'flex', flexDirection: 'column', backgroundColor: isDarkMode ? '#1f2937' : 'white', padding: '10px 20px', borderRadius: '12px',
                  border: isExpanded ? '1px solid #8b5cf6' : `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
                  cursor: 'pointer'
                }}
              >
                <div onClick={() => toggleExpand(student.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {isExpanded ? <FiChevronDown style={{ color: '#8b5cf6' }} /> : <FiChevronRight style={{ color: '#9ca3af' }} />}
                    <h3 style={{ margin: 0, fontSize: '17px', color: isDarkMode ? 'white' : '#1f2937', fontWeight: 'bold' }}>
                      {student.name} <span style={{ fontWeight: 'normal', color: '#9ca3af', fontSize: '14px' }}>({student.grade} клас)</span>
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', padding: '3px 8px', borderRadius: '12px', backgroundColor: formatStyle.bg, color: formatStyle.color }}>
                      {formatStyle.text}
                    </span>
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: bal === 0 ? '#9ca3af' : (isDebt ? '#ef4444' : '#10b981') }}>
                      {bal === 0 ? '0 ₴' : (isDebt ? `${bal} ₴` : `+${bal} ₴`)}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '10px 0 10px 38px', borderTop: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}` }}>
                    
                    <div className="student-tabs">
                      <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Інформація</button>
                      <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Історія ({historyItems.length})</button>
                    </div>

                    {activeTab === 'info' && (
                      <div style={{ animation: 'fadeIn 0.3s' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiPhone color="#8b5cf6" /> <b>Тел. учня:</b> {student.contacts?.phone || '—'}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiSmile color="#8b5cf6" /> <b>Тел. батьків:</b> {student.contacts?.parentPhone || '—'}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiMessageCircle color="#8b5cf6" /> <b>Месенджер:</b> <span style={{ textTransform: 'capitalize' }}>{student.contacts?.messengers?.[0] || '—'}</span>
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiRepeat color="#8b5cf6" /> <b>Занять на тиждень:</b> {student.lessonsPerWeek || '—'}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiDollarSign color="#8b5cf6" /> <b>Ціна за урок:</b> {student.price} ₴
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCreditCard color="#8b5cf6" /> <b>Тип оплати:</b> {getPaymentTypeText(student.paymentType)}
                          </p>
                          <p style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#d1d5db' : '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiGlobe color="#8b5cf6" /> <b>Формат:</b> {student.format === 'online' ? 'Тільки Онлайн' : (student.format === 'offline' ? 'Тільки Офлайн' : 'Змішаний')}
                          </p>
                        </div>

                        <div className="student-notes-box" style={{ padding: '15px', borderRadius: '10px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`, marginBottom: '15px' }}>
                          <p className="notes-title" style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#8b5cf6' }}>ПРИМІТКИ ТА ОСОБЛИВОСТІ:</p>
                          <p className="notes-text" style={{ margin: 0, fontSize: '14px', color: isDarkMode ? '#f3f4f6' : '#1f2937', lineHeight: '1.5', fontStyle: 'italic' }}>
                            {student.notes || 'Важливих приміток ще не додано.'}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'history' && (
                      <div style={{ animation: 'fadeIn 0.3s', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                        {historyItems.length === 0 ? (
                          <p style={{ fontSize: '14px', color: '#9ca3af', fontStyle: 'italic' }}>Історія занять та оплат порожня.</p>
                        ) : (
                          historyItems.map((item, idx) => (
                            <div key={idx} className="history-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#f3f4f6'}` }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {item.type === 'lesson' ? <FiBook color="#8b5cf6" /> : <FiDollarSign color="#10b981" />}
                                <span style={{ color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '14px' }}>
                                  {item.type === 'lesson' ? `Проведено заняття (${item.time})` : `Зараховано оплату: ${item.amount} ₴`}
                                </span>
                              </div>
                              <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.sortDate}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: `1px solid ${isDarkMode ? '#374151' : '#f3f4f6'}`, paddingTop: '15px' }}>
                      <button className="btn-edit-student" onClick={(e) => { e.stopPropagation(); onEdit(student); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#e0e7ff', color: '#4f46e5' }}><FiEdit2 /> Редагувати</button>
                      <button className="btn-delete-student" onClick={(e) => { e.stopPropagation(); onDelete(student.id); }} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#fee2e2', color: '#ef4444' }}><FiTrash2 /> Видалити</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default StudentListView;