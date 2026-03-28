import { FiLayout, FiExternalLink } from 'react-icons/fi';

function ZoomWidget({ isDarkMode }) {
  const launchZoomApp = () => {
    // Ми використовуємо протокол zoomus://zoom.us/ БЕЗ команди /join.
    // Це каже системі: "Просто виведи головне вікно програми на передній план".
    const zoomUri = "zoomus://zoom.us/";
    
    // Створюємо тимчасовий елемент-посилання для надійного "кліку" в Windows
    const link = document.createElement('a');
    link.href = zoomUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="zoom-widget-card" style={{
      backgroundColor: isDarkMode ? '#1f2937' : 'white',
      padding: '20px',
      borderRadius: '16px',
      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      boxShadow: '0 4px 12px rgba(45, 140, 255, 0.2)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <div style={{ 
          backgroundColor: '#2D8CFF', 
          color: 'white', 
          padding: '8px', 
          borderRadius: '10px', 
          display: 'flex' 
        }}>
          {/* Іконка, що символізує робочий простір */}
          <FiLayout size={20} />
        </div>
        <h3 style={{ 
          margin: 0, 
          fontSize: '14px', 
          fontWeight: '800', 
          color: isDarkMode ? '#f3f4f6' : '#1f2937',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Zoom Workplace
        </h3>
      </div>

      <button onClick={launchZoomApp} className="btn-zoom-launch">
        <span>Відкрити програму</span>
        <FiExternalLink size={14} />
      </button>
      
      <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#94a3b8', textAlign: 'center', fontWeight: '500' }}>
        Головний екран (Home)
      </p>
    </div>
  );
}

export default ZoomWidget;