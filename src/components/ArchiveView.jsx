import { useState } from 'react';
import { FiBook, FiCheckCircle, FiXCircle } from 'react-icons/fi';

function ArchiveView({ archive, students }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Фільтруємо архів (пошук по імені учня)
  const filteredArchive = archive
    .filter(lesson => lesson.student.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.archiveDate) - new Date(a.archiveDate)); // Від нових до старих

  return (
    <div className="finance-container">
      <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FiBook /> Журнал (Архів уроків)
        </h1>
        <input 
          type="text" 
          placeholder="🔍 Пошук за ім'ям..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', width: '250px' }}
        />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
        {filteredArchive.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center', margin: '20px 0' }}>Архів поки порожній або учня не знайдено.</p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {filteredArchive.map(lesson => (
              <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {lesson.student.name} <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 'normal' }}>({lesson.dayOfWeek}, {lesson.time})</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>
                    <strong>Дата перенесення в архів:</strong> {lesson.archiveDate}
                    {lesson.note && <span style={{ marginLeft: '10px' }}>📝 <i>{lesson.note}</i></span>}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  {/* Логіка статусу в архіві */}
                  {lesson.student.paymentType === 'per_lesson' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', backgroundColor: lesson.paymentStatus === 'paid' ? '#d1fae5' : '#fee2e2', color: lesson.paymentStatus === 'paid' ? '#065f46' : '#991b1b' }}>
                      {lesson.paymentStatus === 'paid' ? <><FiCheckCircle /> Оплачено</> : <><FiXCircle /> Був борг</>}
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', backgroundColor: lesson.isCompleted ? '#d1fae5' : '#f3f4f6', color: lesson.isCompleted ? '#065f46' : '#4b5563' }}>
                      {lesson.isCompleted ? <><FiCheckCircle /> Проведено</> : <><FiXCircle /> Не проведено</>}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArchiveView;