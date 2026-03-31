// src/components/Dashboard.jsx
import { useState, useEffect, useRef } from 'react'; 
import { ToastContainer, toast } from 'react-toastify'; 
import { FiCalendar, FiUsers, FiTrendingUp, FiMenu, FiBookOpen, FiBell } from 'react-icons/fi'; 

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
  const {
    students, setStudents, lessons, setLessons, transactions, setTransactions,
    archive, isDarkMode, setIsDarkMode, todos, setTodos,
    materials, setMaterials, folders, setFolders,
    togglePaymentStatus, toggleCompletedStatus, updateStudentBalance
  } = db;

  // --- ІНТЕРФЕЙС ТА СТАНИ (ЗЧИТУЄМО З URL) ---
  const [activeForm, setActiveForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'none';
  }); 
  
  const [editingLesson, setEditingLesson] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null); 
  const [prefillDay, setPrefillDay] = useState(null); 
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(null); 

  const [activeWorkspace, setActiveWorkspace] = useState('all'); 
  const [schoolRate, setSchoolRate] = useState(() => Number(localStorage.getItem('tutor-school-rate')) || 200);
  const [schoolBalance, setSchoolBalance] = useState(() => Number(localStorage.getItem('tutor-school-balance')) || 0);

  // --- НАВІГАЦІЯ ТА КНОПКИ БРАУЗЕРА (НАЗАД/ВПЕРЕД) ---
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view') || 'none';
      setActiveForm(view);
      
      // Скидаємо всі форми, якщо користувач натиснув "Назад"
      setEditingLesson(null);
      setEditingStudent(null);
      setPrefillDay(null);
      setShowAddMenu(null);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- ДИНАМІЧНА НАЗВА ВКЛАДКИ БРАУЗЕРА ---
  useEffect(() => {
    const titles = {
      'none': 'Розклад',
      'studentList': 'База учнів',
      'finance': 'Фінанси',
      'archive': 'Журнал',
      'materials': 'Матеріали',
      'analytics': 'Аналітика'
    };
    document.title = `${titles[activeForm] || 'MathTutor'} | MathTutor`;
  }, [activeForm]);

  // Розумна функція для переходу між сторінками
  const navigateTo = (view) => {
    setActiveForm(view);
    const newUrl = view === 'none' ? window.location.pathname : `?view=${view}`;
    window.history.pushState({ view }, '', newUrl);
  };

  const resetForms = (view = 'none') => { 
    navigateTo(view); 
    setEditingLesson(null); 
    setEditingStudent(null); 
    setPrefillDay(null); 
    setShowAddMenu(null); 
  };

  const handleNav = (view) => {
    resetForms(view);
    setIsMobileMenuOpen(false);
  };

  const openAddLesson = (workspace, day = null) => {
    setActiveWorkspace(workspace);
    setPrefillDay(day);
    navigateTo('lesson');
    setShowAddMenu(null); 
  };

  // --- LOGIC: NOTIFICATIONS ---
  const notifiedLessons = useRef(new Set()); 

  useEffect(() => {
    const checkSchedule = () => {
      const days = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
      const now = new Date();
      const currentDayName = days[now.getDay()];
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentTimeStr === "00:00") notifiedLessons.current.clear();

      lessons.forEach(lesson => {
        if (lesson.dayOfWeek === currentDayName) {
          const [h, m] = lesson.time.split(':').map(Number);
          const lessonMinutes = h * 60 + m;
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const diff = lessonMinutes - nowMinutes;

          if (diff === 10 && !notifiedLessons.current.has(lesson.id)) {
            const title = lesson.isSchool ? `🏫 Школа: ${lesson.subject}` : `🎓 Урок: ${lesson.student?.name}`;
            toast.info(
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiBell style={{ minWidth: '20px' }} />
                <div>
                  <strong>Початок за 10 хвилин!</strong>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>{title}</div>
                </div>
              </div>, 
              { position: "top-center", autoClose: 10000, icon: false }
            );
            notifiedLessons.current.add(lesson.id);
          }
        }
      });
    };

    const interval = setInterval(checkSchedule, 30000); 
    checkSchedule(); 
    return () => clearInterval(interval);
  }, [lessons]);

  // --- ЗБЕРЕЖЕННЯ / ВИДАЛЕННЯ ---
  useEffect(() => localStorage.setItem('tutor-school-rate', schoolRate), [schoolRate]);
  useEffect(() => localStorage.setItem('tutor-school-balance', schoolBalance), [schoolBalance]);

  const requestConfirm = (message, action) => setConfirmDialog({ isOpen: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, message: '', onConfirm: null });

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
    resetForms('studentList');
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
    resetForms('none');
  };

  const handleCompleteSchoolLesson = (lesson) => {
    if (lesson.isCompleted) {
      const earned = (lesson.duration / 60) * schoolRate;
      setSchoolBalance(prev => prev - earned);
    } else {
      const earned = (lesson.duration / 60) * schoolRate;
      setSchoolBalance(prev => prev + earned);
      toast.success(`🏫 За зміну нараховано: ${earned.toFixed(0)} ₴`);
    }
    setLessons(lessons.map(l => l.id === lesson.id ? { ...l, isCompleted: !l.isCompleted } : l));
  };

  const filteredLessons = lessons.filter(lesson => {
    if (activeWorkspace === 'all') return true;
    if (activeWorkspace === 'school') return lesson.isSchool === true;
    return !lesson.isSchool;
  });

  const daysArr = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  const jsDay = new Date().getDay();
  const currentDayName = jsDay === 0 ? 'Неділя' : daysArr[jsDay - 1];
  
  const todaysLessons = filteredLessons.filter(l => l.dayOfWeek === currentDayName);

  const todayTutorIncome = todaysLessons
    .filter(l => !l.isSchool)
    .reduce((s, l) => s + (l.student?.price || 0), 0);

  const todaySchoolIncome = todaysLessons
    .filter(l => l.isSchool)
    .reduce((s, l) => s + ((l.duration / 60) * schoolRate), 0);

  const todayTotalIncome = todayTutorIncome + todaySchoolIncome;

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
              
              <div style={{ position: 'relative' }}>
                <button 
                  className="btn-add-lesson-main" 
                  onClick={() => {
                    if (activeWorkspace === 'all') {
                      setShowAddMenu(showAddMenu === 'main' ? null : 'main');
                    } else {
                      openAddLesson(activeWorkspace);
                    }
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  ➕ {activeWorkspace === 'school' ? 'Додати зміну' : activeWorkspace === 'tutor' ? 'Додати урок' : 'Додати запис'}
                </button>

                {showAddMenu === 'main' && (
                  <div style={{ position: 'absolute', top: '110%', right: 0, backgroundColor: isDarkMode ? '#1e293b' : 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', zIndex: 100, width: '220px', border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, overflow: 'hidden' }}>
                    <button onClick={() => openAddLesson('tutor')} style={{ width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }} className="nav-btn">
                      <span style={{ fontSize: '18px' }}>🎓</span> Урок репетитора
                    </button>
                    <button onClick={() => openAddLesson('school')} style={{ width: '100%', padding: '12px 15px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}` }} className="nav-btn">
                      <span style={{ fontSize: '18px' }}>🏫</span> Шкільна зміна
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ 
              display: 'flex', gap: '5px', marginBottom: '25px', 
              backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', 
              padding: '6px', borderRadius: '12px', width: 'fit-content',
              border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`
            }}>
              <button 
                onClick={() => { setActiveWorkspace('all'); setShowAddMenu(null); }}
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
                onClick={() => { setActiveWorkspace('tutor'); setShowAddMenu(null); }}
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
                onClick={() => { setActiveWorkspace('school'); setShowAddMenu(null); }}
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
                <div className="stat-info">
                  <p>
                    {activeWorkspace === 'school' ? 'Змін сьогодні' : 
                     activeWorkspace === 'tutor' ? 'Уроків сьогодні' : 'Записів сьогодні'}
                  </p>
                  <h3>{todaysLessons.length}</h3>
                </div>
              </div>

              <div className="stat-card-new">
                <div className="stat-icon-wrapper green"><FiTrendingUp size={22} /></div>
                <div className="stat-info">
                  <p>
                    {activeWorkspace === 'school' ? 'План на сьогодні (Школа)' : 
                     activeWorkspace === 'tutor' ? 'План на сьогодні (Реп-р)' : 'Загальний план на день'}
                  </p>
                  <h3>
                    {activeWorkspace === 'school' ? todaySchoolIncome.toFixed(0) : 
                     activeWorkspace === 'tutor' ? todayTutorIncome : todayTotalIncome.toFixed(0)} ₴
                  </h3>
                </div>
              </div>

              {activeWorkspace === 'school' ? (
                <div className="stat-card-new" style={{ border: '1px solid #3b82f6', background: isDarkMode ? 'rgba(59, 130, 246, 0.05)' : '#f0f9ff' }}>
                  <div className="stat-icon-wrapper blue" style={{ backgroundColor: '#3b82f6', color: 'white' }}><FiTrendingUp size={22} /></div>
                  <div className="stat-info">
                    <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>НАКОПИЧЕНО ЗА МІСЯЦЬ</p>
                    <h3 style={{ color: '#3b82f6' }}>{schoolBalance.toFixed(0)} ₴</h3>
                  </div>
                </div>
              ) : (
                <div className="stat-card-new">
                  <div className="stat-icon-wrapper purple"><FiUsers size={22} /></div>
                  <div className="stat-info">
                    <p>Активних учнів</p>
                    <h3>{students.length}</h3>
                  </div>
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
                  onCompleteSchool={handleCompleteSchoolLesson} 
                  onDeleteLesson={(id) => requestConfirm('Видалити цей запис?', () => setLessons(lessons.filter(l => l.id !== id)))}
                  onEditLesson={(l) => { setEditingLesson(l); navigateTo('lesson'); }}
                  onMoveLesson={(id, day) => {
                    setLessons(lessons.map(l => l.id === id ? { ...l, dayOfWeek: day } : l));
                    toast.success(`📅 Запис перенесено на ${day}`);
                  }}
                  activeWorkspace={activeWorkspace}
                  showAddMenu={showAddMenu}
                  onOpenAdd={openAddLesson}
                  onAddLessonForDay={(day) => {
                    if (activeWorkspace === 'all') {
                      setShowAddMenu(showAddMenu === day ? null : day);
                    } else {
                      openAddLesson(activeWorkspace, day);
                    }
                  }}
                />
              </div>
              <div style={{ flex: '0 0 320px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ZoomWidget isDarkMode={isDarkMode} />
                <TodoListWidget todos={todos} setTodos={setTodos} isDarkMode={isDarkMode} />
              </div>
            </div>
          </div>
        )}
        
        {activeForm === 'student' && <AddStudentForm students={students} initialData={editingStudent} onSave={handleSaveStudent} onCancel={() => resetForms('studentList')} />}
        {activeForm === 'lesson' && <AddLessonForm students={students} initialData={editingLesson} prefillDay={prefillDay} onSave={handleSaveLesson} onCancel={() => resetForms('none')} activeWorkspace={activeWorkspace} />}
        {activeForm === 'studentList' && <StudentListView students={students} archive={archive} transactions={transactions} onDelete={handleDeleteStudent} onEdit={(s) => { setEditingStudent(s); navigateTo('student'); }} onAddNew={() => resetForms('student')} isDarkMode={isDarkMode} />}
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
            requestConfirm={requestConfirm}
          />
        )}
        {activeForm === 'archive' && <ArchiveView archive={archive} students={students} />}
        {activeForm === 'materials' && <MaterialsView materials={materials} setMaterials={setMaterials} folders={folders} setFolders={setFolders} isDarkMode={isDarkMode} />}
        {activeForm === 'analytics' && <AnalyticsView archive={archive} students={students} isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
}