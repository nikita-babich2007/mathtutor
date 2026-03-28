import { useState } from 'react';
import { 
  FiBookmark, FiPlus, FiTrash2, FiExternalLink, 
  FiFolder, FiFolderPlus, FiX, FiChevronRight, FiArrowLeft 
} from 'react-icons/fi';

function MaterialsView({ materials, setMaterials, folders, setFolders, isDarkMode }) {
  // Стан для навігації: null означає корінь, або ID поточної папки
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  
  const [newFolderName, setNewFolderName] = useState('');
  const [matData, setMatData] = useState({ title: '', url: '' });

  // 1. ЛОГІКА НАВІГАЦІЇ
  // Отримуємо поточну папку для заголовка
  const currentFolder = folders.find(f => f.id === currentFolderId);
  
  // Фільтруємо вміст: тільки те, що належить ПОТОЧНІЙ папці
  const visibleFolders = folders.filter(f => f.parentId === currentFolderId);
  const visibleMaterials = materials.filter(m => m.folderId === currentFolderId);

  // Побудова "хлібних крихт" (шлях назад)
  const getBreadcrumbs = () => {
    let crumbs = [];
    let temp = currentFolder;
    while (temp) {
      crumbs.unshift(temp);
      temp = folders.find(f => f.id === temp.parentId);
    }
    return crumbs;
  };

  // 2. ДІЇ З ПАПКАМИ
  const handleAddFolder = (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const newFolder = {
      id: Date.now(),
      name: newFolderName,
      parentId: currentFolderId // Створюється всередині поточної папки
    };
    setFolders([...folders, newFolder]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation(); // Щоб не спрацював вхід у папку
    if (window.confirm("Видалити папку та все, що в ній?")) {
      // Рекурсивно видаляємо (спрощено: видаляємо папку та її прямих дітей)
      setFolders(folders.filter(f => f.id !== folderId && f.parentId !== folderId));
      setMaterials(materials.filter(m => m.folderId !== folderId));
    }
  };

  // 3. ДІЇ З МАТЕРІАЛАМИ
  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!matData.title || !matData.url) return;
    
    let finalUrl = matData.url;
    if (!finalUrl.startsWith('http')) finalUrl = 'https://' + finalUrl;

    setMaterials([...materials, { 
      id: Date.now(), 
      ...matData, 
      url: finalUrl, 
      folderId: currentFolderId // Прив'язка до поточної папки
    }]);
    setMatData({ title: '', url: '' });
    setIsAddingMaterial(false);
  };

  return (
    <div className="finance-container" style={{ animation: 'fadeIn 0.3s' }}>
      
      {/* ШЛЯХ (BREADCRUMBS) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#9ca3af', fontSize: '14px' }}>
        <span 
          onClick={() => setCurrentFolderId(null)} 
          style={{ cursor: 'pointer', hover: {color: '#8b5cf6'} }}
        >
          Бібліотека
        </span>
        {getBreadcrumbs().map(crumb => (
          <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiChevronRight size={14} />
            <span 
              onClick={() => setCurrentFolderId(crumb.id)} 
              style={{ cursor: 'pointer', color: crumb.id === currentFolderId ? '#8b5cf6' : 'inherit', fontWeight: crumb.id === currentFolderId ? 'bold' : 'normal' }}
            >
              {crumb.name}
            </span>
          </span>
        ))}
      </div>

      <div className="page-header" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          {currentFolderId ? <FiArrowLeft onClick={() => setCurrentFolderId(currentFolder.parentId)} style={{cursor: 'pointer', fontSize: '20px'}} /> : <FiBookmark />}
          {currentFolder ? currentFolder.name : 'Матеріали'}
        </h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsAddingFolder(true)} className="btn-add-day-lesson">
            <FiFolderPlus /> + Папка
          </button>
          <button onClick={() => setIsAddingMaterial(true)} className="btn-submit" style={{ backgroundColor: '#8b5cf6', margin: 0 }}>
            <FiPlus /> Додати файл
          </button>
        </div>
      </div>

      {/* ФОРМА: НОВА ПАПКА */}
      {isAddingFolder && (
        <form onSubmit={handleAddFolder} style={{ display: 'flex', gap: '10px', marginBottom: '25px', backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6', padding: '15px', borderRadius: '12px' }}>
          <input 
            type="text" autoFocus value={newFolderName} onChange={e => setNewFolderName(e.target.value)} 
            placeholder="Назва нової папки..." 
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} 
          />
          <button type="submit" className="btn-submit" style={{margin:0}}>Створити</button>
          <button type="button" onClick={() => setIsAddingFolder(false)} className="btn-cancel">Скасувати</button>
        </form>
      )}

      {/* ФОРМА: НОВИЙ МАТЕРІАЛ */}
      {isAddingMaterial && (
        <form onSubmit={handleAddMaterial} className="add-lesson-form" style={{ marginBottom: '30px', border: '2px solid #8b5cf6' }}>
          <h3 style={{ marginTop: 0 }}>Додати у "{currentFolder ? currentFolder.name : 'Корінь'}"</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Назва ресурсу</label>
              <input type="text" value={matData.title} onChange={e => setMatData({...matData, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>URL (посилання)</label>
              <input type="text" value={matData.url} onChange={e => setMatData({...matData, url: e.target.value})} placeholder="idroo.com" required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button type="submit" className="btn-submit">Зберегти</button>
            <button type="button" onClick={() => setIsAddingMaterial(false)} className="btn-cancel">Скасувати</button>
          </div>
        </form>
      )}

      {/* СІТКА ПАПОК ТА ФАЙЛІВ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
        
        {/* ВІДОБРАЖЕННЯ ПАПОК */}
        {visibleFolders.map(folder => (
          <div 
            key={folder.id} 
            onClick={() => setCurrentFolderId(folder.id)}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
              padding: '20px', borderRadius: '14px', cursor: 'pointer',
              backgroundColor: isDarkMode ? '#1f2937' : '#f8fafc',
              border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
              transition: '0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
            className="folder-card-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiFolder size={24} color="#8b5cf6" style={{ fill: '#8b5cf6', fillOpacity: 0.1 }} />
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{folder.name}</span>
            </div>
            <FiTrash2 
              className="delete-icon-hover"
              onClick={(e) => handleDeleteFolder(folder.id, e)} 
              style={{ color: '#ef4444', opacity: 0.5 }} 
            />
          </div>
        ))}

        {/* ВІДОБРАЖЕННЯ ФАЙЛІВ */}
        {visibleMaterials.map(mat => (
          <div 
            key={mat.id} 
            style={{ 
              display: 'flex', flexDirection: 'column', gap: '10px',
              padding: '20px', borderRadius: '14px',
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
              position: 'relative'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '14px', paddingRight: '20px' }}>{mat.title}</h4>
            <a href={mat.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: '12px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <FiExternalLink /> Перейти
            </a>
            <button 
              onClick={() => setMaterials(materials.filter(m => m.id !== mat.id))} 
              style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }}
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}

        {visibleFolders.length === 0 && visibleMaterials.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <FiFolder size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
            <p>Ця папка порожня. Додайте сюди щось!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialsView;