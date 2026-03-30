// src/components/Dashboard.jsx
import { useState } from 'react';
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
  // Розпаковуємо нашу базу даних, щоб не міняти старий код
  const {
    students, setStudents, lessons, setLessons, transactions, setTransactions,
    archive, isDarkMode, setIsDarkMode, todos, setTodos,
    materials, setMaterials, folders, setFolders,
    togglePaymentStatus, toggleCompletedStatus, updateStudentBalance
  } = db;

  // --- ІНТЕРФЕЙС ---
  const [activeForm, setActiveForm] = useState('none'); 
  const [editingLesson, setEditingLesson] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null); 
  const [prefillDay, setPrefillDay] = useState(null); 
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, message: '', onConfirm: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const resetForms = (view = 'none') => { setActiveForm(view); setEditingLesson(null); setEditingStudent(null); setPrefillDay(null); };

  const handleNav = (view) => {
    resetForms(view);
    setIsMobileMenuOpen(false);
  };

  const requestConfirm = (message, action) => setConfirmDialog({ isOpen: true, message, onConfirm: action });
  const closeConfirm = () => setConfirmDialog({ isOpen: false, message: '', onConfirm: null });

  const handleSaveStudent = (studentData) => {
    if (editingStudent) {
      // 1. Оновлюємо самого учня в базі
      setStudents(students.map(s => s.id === studentData.id ? studentData : s));
      
      // 2. СИНХРОНІЗАЦІЯ: Пробігаємось по всьому розкладу і оновлюємо дані цього учня
      setLessons(lessons.map(lesson => {
        if (lesson.student && lesson.student.id === studentData.id) {
          // Якщо це урок цього учня, підміняємо його старі дані на нові (ім'я, ціна, клас)
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
      // 1. Видаляємо самого учня
      setStudents(students.filter(s => s.id !== id));
      
      // 2. Видаляємо ВСІ уроки цього учня з розкладу
      setLessons(lessons.filter(l => l.student?.id !== id));
      
      toast.error('🗑️ Учня видалено');
    });
  };

  const handleSaveLesson = (lessonData) => {
  if (editingLesson) {
    setLessons(lessons.map(l => l.id === lessonData.id ? lessonData : l));
    toast.success('✏️ Урок оновлено!');
  } else {
    setLessons([...lessons, lessonData]);
    toast.success('✅ Новий урок додано!');
  }
  setActiveForm('none');
  setEditingLesson(null);
  setPrefillDay(null);
  };

  const daysArr = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота', 'Неділя'];
  const jsDay = new Date().getDay();
  const currentDayName = jsDay === 0 ? 'Неділя' : daysArr[jsDay - 1];
  const todaysLessons = lessons.filter(l => l.dayOfWeek === currentDayName);

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
            <div className="page-header" style={{ marginBottom: '20px' }}>
              <h1>Мій розклад</h1>
              <button className="btn-add-lesson-main" onClick={() => setActiveForm('lesson')}>📅 + Додати урок</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div className="stat-card-new">
                <div className="stat-icon-wrapper blue"><FiCalendar size={22} /></div>
                <div className="stat-info"><p>Уроків сьогодні</p><h3>{todaysLessons.length}</h3></div>
              </div>
              <div className="stat-card-new">
                <div className="stat-icon-wrapper green"><FiTrendingUp size={22} /></div>
                <div className="stat-info"><p>План на сьогодні</p><h3>{todaysLessons.reduce((s, l) => s + (l.student?.price || 0), 0)} ₴</h3></div>
              </div>
              <div className="stat-card-new">
                <div className="stat-icon-wrapper purple"><FiUsers size={22} /></div>
                <div className="stat-info"><p>Активних учнів</p><h3>{students.length}</h3></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 600px', minWidth: 0 }}>
                <WeeklySchedule 
                  lessons={lessons} isDarkMode={isDarkMode}
                  onTogglePayment={togglePaymentStatus} onToggleCompleted={toggleCompletedStatus}
                  onDeleteLesson={(id) => requestConfirm('Видалити цей урок?', () => setLessons(lessons.filter(l => l.id !== id)))}
                  onEditLesson={(l) => { setEditingLesson(l); setActiveForm('lesson'); }}
                  onMoveLesson={(id, day) => {
                    setLessons(lessons.map(l => l.id === id ? { ...l, dayOfWeek: day } : l));
                    toast.success(`📅 Урок перенесено на ${day}`);
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
        {activeForm === 'lesson' && <AddLessonForm students={students} initialData={editingLesson} prefillDay={prefillDay} onSave={handleSaveLesson} onCancel={() => setActiveForm('none')} />}
        {activeForm === 'studentList' && <StudentListView students={students} archive={archive} transactions={transactions} onDelete={handleDeleteStudent} onEdit={(s) => { setEditingStudent(s); setActiveForm('student'); }} onAddNew={() => resetForms('student')} isDarkMode={isDarkMode} />}
        {activeForm === 'finance' && <FinanceView students={students} transactions={transactions} isDarkMode={isDarkMode} onAddTransaction={(tx) => { setTransactions([...transactions, tx]); updateStudentBalance(tx.studentId, tx.amount); }} />}
        {activeForm === 'archive' && <ArchiveView archive={archive} students={students} />}
        {activeForm === 'materials' && <MaterialsView materials={materials} setMaterials={setMaterials} folders={folders} setFolders={setFolders} isDarkMode={isDarkMode} />}
        {activeForm === 'analytics' && <AnalyticsView archive={archive} students={students} isDarkMode={isDarkMode} />}
      </main>
    </div>
  );
}