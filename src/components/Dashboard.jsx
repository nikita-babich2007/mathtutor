// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify'; 
import { FiCalendar, FiUsers, FiTrendingUp, FiMenu, FiBookOpen } from 'react-icons/fi'; 

import Sidebar from './Sidebar';
import WeeklySchedule from './WeeklySchedule';
import AddLessonForm from './AddLessonForm';
import AddStudentForm from './AddStudentForm';
import StudentListView from './StudentListView';
import FinanceView from './FinanceView';
import ArchiveView from './ArchiveView';
import MaterialsView from './MaterialsView'; 
import AnalyticsView from './AnalyticsView';
import TodoListWidget from './TodoListWidget'; 
import ConfirmModal from './ConfirmModal'; 
import ZoomWidget from './ZoomWidget';

export default function Dashboard({ db }) {
  // Розпаковуємо нашу базу даних
  const {
    students, setStudents, lessons, setLessons, transactions, setTransactions,
    archive, isDarkMode, setIsDarkMode, todos, setTodos,
    materials, setMaterials, folders, setFolders,
    togglePaymentStatus, toggleCompletedStatus, updateStudentBalance
  } = db;

  // --- ІНТЕРФЕЙС ТА СТАНИ ---
  const [activeForm, setActiveForm] = useState('none'); 
  const [editingLesson, setEditingLesson] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null); 
  const [prefillDay, setPrefillDay] = useState(null); 
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- ЛОГІКА WORKSPACE ТА ШКОЛИ ---
  const [activeWorkspace, setActiveWorkspace] = useState('all'); // За замовчуванням бачимо все
  
  // Ставка та баланс школи (зберігаємо в пам'яті)
  const [schoolRate, setSchoolRate] = useState(() => Number(localStorage.getItem('tutor-school-rate')) || 200);
  const [schoolBalance, setSchoolBalance] = useState(() => Number(localStorage.getItem('tutor-school-balance')) || 0);

  // Автозбереження ставки та балансу
  useEffect(() => localStorage.setItem('tutor-school-rate', schoolRate), [schoolRate]);
  useEffect(() => localStorage.setItem('tutor-school-balance', schoolBalance), [schoolBalance]);

  const resetForms = (view = 'none') => { setActiveForm(view); setEditingLesson(null); setEditingStudent(null); setPrefillDay(null); };

  const handleNav = (view) => {
    resetForms(view);
    setIsMobileMenuOpen(false);
  };

  const requestConfirm = (message, action) => setConfirmDialog({ isOpen: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, message: '', onConfirm: null });

  // --- ЗБЕРЕЖЕННЯ / ВИДАЛЕННЯ ---
  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === studentData.id ? studentData : s));
      setLessons(lessons.map(lesson => {
        if (lesson.student && lesson.student.id === studentData.id) {
          return { ...lesson, student: studentData };
        }
        return lesson;
      }));
      toast.success('✏️ Дані учня та його уроки оновлено!');
    } else {
      setStudents([...students, studentData]);
      toast.success('✅ Новий учень доданий!');
    }
    setActiveForm('studentList');
    setEditingStudent(null);
  };

  const handleDeleteStudent = (id) => {
    requestConfirm('Видалити учня та всі його уроки з розкладу?', () => {
      setStudents(students.filter(s => s.id !== id));
      setLessons(lessons.filter(l => l.student?.id !== id));
      toast.error('🗑️ Учня та його уроки видалено');
    });
  };

  const handleSaveLesson = (lessonData) => {
    if (editingLesson) {
      setLessons(lessons.map(l => l.id === lessonData.id ? lessonData : l));
      toast.success('✏️ Запис оновлено!');
    } else {
      setLessons([...lessons, lessonData]);
      toast.success('✅ Новий запис додано!');
    }
    setActiveForm('none');
    setEditingLesson(null);
    setPrefillDay(null);
  };

  // --- ФІНАНСИ ШКОЛИ (ВІДПРАЦЮВАННЯ ЗМІНИ) ---
  const handleCompleteSchoolLesson = (lesson) => {
    if (lesson.isCompleted) {
      // Скасовуємо відпрацювання — віднімаємо гроші
      const earned = (lesson.duration / 60) * schoolRate;
      setSchoolBalance(prev => prev - earned);
    } else {
      // Відпрацював — додаємо гроші на баланс
      const earned = (lesson.duration / 60) * schoolRate;
      setSchoolBalance(prev => prev + earned);
      toast.success(`🏫 За зміну нараховано: ${earned.toFixed(0)} ₴`);
    }
    
    // Змінюємо статус уроку на "Проведено/Очікує"
    setLessons(lessons.map(l => l.id === lesson.id ? { ...l, isCompleted: !l.isCompleted } : l));
  };

  // --- ФІЛЬТРАЦІЯ УРОКІВ ДЛЯ РОЗКЛАДУ ---
  const filteredLessons = lessons.filter(lesson => {
    if (activeWorkspace === 'all') return true;
    if (activeWorkspace === 'school') return lesson.isSchool === true;
    return !lesson.isSchool;
  });

  const daysArr = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  const jsDay = new Date().getDay();
  const currentDayName = jsDay === 0 ? 'Неділя' : daysArr[jsDay - 1];
  
  const todaysLessons = filteredLessons.filter(l => l.dayOfWeek === currentDayName);

  // Визначаємо заголовок сторінки
  const getPageTitle = () => {
    if (activeWorkspace === 'all') return '🌍 Загальний розклад';
    if (activeWorkspace === 'school') return '🏫 Шкільний розклад';
    return '🎓 Розклад репетитора';
  };

  return (
    <div className={`dashboard-layout ${isDarkMode ? 'dark-theme' : ''}`}>
      <ToastContainer position="bottom-right" autoClose={3000} theme={isDarkMode ? 'dark' : 'colored'} />
      <ConfirmModal isOpen={confirmDialog.isOpen} message={confirmDialog.message} onConfirm={() => { confirmDialog.onConfirm(); closeConfirm(); }} onCancel={closeConfirm} />

      <div className="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', color: '#60a5fa', fontWeight: 'bold' }}>
          <FiBookOpen /> MathTutor
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="burger-btn">
          <FiMenu size={28} color={isDarkMode ? '#fff' : '#1f2937'} />
        </button>
      </div>

      {isMobileMenuOpen && <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <Sidebar 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        students={students} currentView={activeForm} 
        onGoHome={() => handleNav('none')} 
        onOpenStudentList={() => handleNav('studentList')} 
        onOpenFinance={() => handleNav('finance')} 
        onOpenArchive={() => handleNav('archive')} 
        onOpenMaterials={() => handleNav('materials')}
        onOpenAnalytics={() => handleNav('analytics')}
        isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />
      
      <main className="main-content-area">
        {activeForm === 'none' && (
          <div className="home-view">
            <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <h1 style={{ margin: 0 }}>{getPageTitle()}</h1>
              <button className="btn-add-lesson-main" onClick={() => setActiveForm('lesson')}>
                {activeWorkspace === 'school' ? '🏫 + Додати зміну' : '📅 + Додати урок'}
              </button>
            </div>

            {/* НОВЕ МІСЦЕ ДЛЯ ПЕРЕМИКАЧА (Над статистикою розкладу) */}
            <div style={{ 
              display: 'flex', gap: '5px', marginBottom: '25px', 
              backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', 
              padding: '6px', borderRadius: '12px', width: 'fit-content',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
            }}>
              <button 
                onClick={() => setActiveWorkspace('all')}
                style={{ 
                  padding: '8px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
                  backgroundColor: activeWorkspace === 'all' ? '#10b981' : 'transparent',
                  color: activeWorkspace === 'all' ? 'white' : (isDarkMode ? '#94a3b8' : '#64748b'),
                  boxShadow: activeWorkspace === 'all' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🌍 Всі заняття
              </button>
              <button 
                onClick={() => setActiveWorkspace('tutor')}
                style={{ 
                  padding: '8px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
                  backgroundColor: activeWorkspace === 'tutor' ? '#8b5cf6' : 'transparent',
                  color: activeWorkspace === 'tutor' ? 'white' : (isDarkMode ? '#94a3b8' : '#64748b'),
                  boxShadow: activeWorkspace === 'tutor' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🎓 Репетитор
              </button>
              <button 
                onClick={() => setActiveWorkspace('school')}
                style={{ 
                  padding: '8px 20px', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s',
                  backgroundColor: activeWorkspace === 'school' ? '#3b82f6' : 'transparent',
                  color: activeWorkspace === 'school' ? 'white' : (isDarkMode ? '#94a3b8' : '#64748b'),
                  boxShadow: activeWorkspace === 'school' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                🏫 Школа
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card-new">
                <div className="stat-icon-wrapper blue"><FiCalendar size={22} /></div>
                <div className="stat-info"><p>Записів сьогодні</p><h3>{todaysLessons.length}</h3></div>
              </div>
              <div className="stat-card-new">
                <div className="stat-icon-wrapper green"><FiTrendingUp size={22} /></div>
                <div className="stat-info">
                  <p>План на сьогодні (Реп-р)</p>
                  <h3>{todaysLessons.filter(l => !l.isSchool).reduce((s, l) => s + (l.student?.price || 0), 0)} ₴</h3>
                </div>
              </div>
              {/* Якщо ми в шкільному режимі, показуємо баланс школи, інакше активних учнів */}
              {activeWorkspace === 'school' ? (
                <div className="stat-card-new" style={{ border: '2px solid #3b82f6' }}>
                  <div className="stat-icon-wrapper blue" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}><FiTrendingUp size={22} /></div>
                  <div className="stat-info"><p>Шкільний баланс</p><h3 style={{ color: '#3b82f6' }}>{schoolBalance.toFixed(0)} ₴</h3></div>
                </div>
              ) : (
                <div className="stat-card-new">
                  <div className="stat-icon-wrapper purple"><FiUsers size={22} /></div>
                  <div className="stat-info"><p>Активних учнів</p><h3>{students.length}</h3></div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                <WeeklySchedule 
                  lessons={filteredLessons} 
                  isDarkMode={isDarkMode}
                  onTogglePayment={togglePaymentStatus} 
                  onToggleCompleted={toggleCompletedStatus}
                  onCompleteSchool={handleCompleteSchoolLesson} // <--- Функція нарахування ЗП для школи
                  onDeleteLesson={(id) => requestConfirm('Видалити цей запис?', () => setLessons(lessons.filter(l => l.id !== id)))}
                  onEditLesson={(l) => { setEditingLesson(l); setActiveForm('lesson'); }}
                  onMoveLesson={(id, day) => {
                    setLessons(lessons.map(l => l.id === id ? { ...l, dayOfWeek: day } : l));
                    toast.success(`📅 Запис перенесено на ${day}`);
                  }}
                  onAddLessonForDay={(day) => { setPrefillDay(day); setActiveForm('lesson'); }}
                />
              </div>
              <div style={{ flex: '0 0 320px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ZoomWidget isDarkMode={isDarkMode} />
                <TodoListWidget todos={todos} setTodos={setTodos} isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        )}
        
        {activeForm === 'student' && <AddStudentForm students={students} initialData={editingStudent} onSave={handleSaveStudent} onCancel={() => setActiveForm('studentList')} />}
        {activeForm === 'lesson' && <AddLessonForm students={students} initialData={editingLesson} prefillDay={prefillDay} onSave={handleSaveLesson} onCancel={() => setActiveForm('none')} activeWorkspace={activeWorkspace} />}
        {activeForm === 'studentList' && <StudentListView students={students} archive={archive} transactions={transactions} onDelete={handleDeleteStudent} onEdit={(s) => { setEditingStudent(s); setActiveForm('student'); }} onAddNew={() => resetForms('student')} isDarkMode={isDarkMode} />}
        {activeForm === 'finance' && (
          <FinanceView 
            students={students} 
            transactions={transactions} 
            isDarkMode={isDarkMode} 
            onAddTransaction={(tx) => { setTransactions([...transactions, tx]); updateStudentBalance(tx.studentId, tx.amount); }}

            schoolRate={schoolRate}
            setSchoolRate={setSchoolRate}
            schoolBalance={schoolBalance}
            setSchoolBalance={setSchoolBalance}
          />
        )}
        {activeForm === 'archive' && <ArchiveView archive={archive} students={students} />}
        {activeForm === 'materials' && <MaterialsView materials={materials} setMaterials={setMaterials} folders={folders} setFolders={setFolders} isDarkMode={isDarkMode} />}
        {activeForm === 'analytics' && <AnalyticsView archive={archive} students={students} isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
}