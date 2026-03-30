import { useRef } from 'react'; 
import { toast } from 'react-toastify'; 
import { 
  FiCalendar, FiUsers, FiDollarSign, FiBookOpen, 
  FiBook, FiSun, FiMoon, FiBookmark, FiPieChart, FiX, 
  FiDownload, FiUpload 
} from 'react-icons/fi'; 

function Sidebar({ 
  students, currentView, onGoHome, onOpenStudentList, 
  onOpenFinance, onOpenArchive, onOpenMaterials, 
  onOpenAnalytics, isDarkMode, toggleTheme,
  isOpen, onClose 
}) {
  const fileInputRef = useRef(null);

  // --- ЛОГІКА РЕЗЕРВНОЇ КОПІЇ ---
  const handleExportBackup = () => {
    const keysToBackup = [
      'tutor-students-base', 'tutor-schedule', 'tutor-transactions', 
      'tutor-archive', 'tutor-dark-mode', 'tutor-todos', 
      'tutor-materials', 'tutor-folders', 'tutor-school-rate',
      'tutor-school-balance'
    ];
    
    const backupData = {};
    keysToBackup.forEach(key => {
      backupData[key] = localStorage.getItem(key);
    });
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mathtutor-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('💾 Базу успішно завантажено на пристрій!');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
            localStorage.setItem(key, data[key]);
          }
        });
        toast.success('✅ Дані відновлено! Оновлюю сторінку...');
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        toast.error('❌ Помилка! Файл пошкоджено або це не бекап.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };

  return (
    <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand" style={{ position: 'relative' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '22px', color: '#60a5fa' }}>
          <FiBookOpen size={26} /> MathTutor
        </h2>
        <p style={{ 
          margin: '2px 0 0 38px', 
          fontSize: '9px', 
          color: isDarkMode ? '#475569' : '#94a3b8', 
          textTransform: 'uppercase', 
          letterSpacing: '3px', 
          fontWeight: '700',
          opacity: 0.7
        }}>
          Workspace
        </p>
        
        <button className="mobile-close-btn" onClick={onClose}>
          <FiX size={26} />
        </button>
      </div>

      <nav className="sidebar-nav" style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <button onClick={onGoHome} className={`nav-btn ${currentView === 'none' ? 'active' : ''}`}>
          <FiCalendar size={18} /> Розклад
        </button>
        <button onClick={onOpenStudentList} className={`nav-btn ${currentView === 'studentList' ? 'active' : ''}`}>
          <FiUsers size={18} /> База учнів
        </button>
        <button onClick={onOpenFinance} className={`nav-btn ${currentView === 'finance' ? 'active' : ''}`}>
          <FiDollarSign size={18} /> Фінанси
        </button>
        <button onClick={onOpenArchive} className={`nav-btn ${currentView === 'archive' ? 'active' : ''}`}>
          <FiBook size={18} /> Журнал
        </button>
        <button onClick={onOpenMaterials} className={`nav-btn ${currentView === 'materials' ? 'active' : ''}`}>
          <FiBookmark size={18} /> Матеріали
        </button>
        <button onClick={onOpenAnalytics} className={`nav-btn ${currentView === 'analytics' ? 'active' : ''}`}>
          <FiPieChart size={18} /> Аналітика
        </button>

        <div style={{ marginTop: 'auto', borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`, paddingTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <button onClick={toggleTheme} className="nav-btn theme-toggle" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            {isDarkMode ? <><FiSun size={18} color="#fbbf24" /> Світла тема</> : <><FiMoon size={18} color="#6366f1" /> Темна тема</>}
          </button>
          
          <button onClick={handleExportBackup} className="nav-btn theme-toggle" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            <FiDownload size={18} color="#10b981" /> Зберегти базу
          </button>
          
          <button onClick={() => fileInputRef.current.click()} className="nav-btn theme-toggle" style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
            <FiUpload size={18} color="#3b82f6" /> Відновити базу
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleImportBackup} 
            style={{ display: 'none' }} 
          />
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;