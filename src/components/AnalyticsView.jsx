import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiDollarSign, FiCalendar, FiUsers, FiBriefcase } from 'react-icons/fi';

function AnalyticsView({ archive, students, transactions = [], isDarkMode }) {
  
  // 1. Дані для графіка "Дохід по учнях" (+ додаємо Школу як окрему сутність)
  const dataByStudent = students.map(s => {
    const totalEarned = archive
      .filter(a => a.student?.id === s.id && a.isCompleted)
      .reduce((sum, a) => sum + (a.student.price || 0), 0);
    return { name: s.name, value: totalEarned };
  }).filter(d => d.value > 0);

  // Додаємо школу в графік по учнях, якщо були виплати
  const schoolTotal = transactions
    .filter(tx => tx.studentId === 'school_salary')
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (schoolTotal > 0) {
    dataByStudent.push({ name: '🏫 Школа', value: schoolTotal, isSchool: true });
  }

  // 2. Дані для графіка "Дохід по місяцях" (враховуємо і уроки, і шкільні виплати)
  const monthlyDataMap = {};

  // Додаємо дохід від репетиторства
  archive.forEach(lesson => {
    if (lesson.isCompleted && lesson.archiveDate) {
      const [year, month] = lesson.archiveDate.split('-');
      const key = `${year}-${month}`;
      if (!monthlyDataMap[key]) monthlyDataMap[key] = 0;
      monthlyDataMap[key] += (lesson.student?.price || 0);
    }
  });

  // ДОДАНО: Додаємо дохід від школи з транзакцій
  transactions.forEach(tx => {
    if (tx.studentId === 'school_salary' && tx.date) {
      const [year, month] = tx.date.split('-');
      const key = `${year}-${month}`;
      if (!monthlyDataMap[key]) monthlyDataMap[key] = 0;
      monthlyDataMap[key] += tx.amount;
    }
  });

  const monthNames = { 
    '01': 'Січ', '02': 'Лют', '03': 'Бер', '04': 'Квіт', 
    '05': 'Трав', '06': 'Черв', '07': 'Лип', '08': 'Серп', 
    '09': 'Вер', '10': 'Жовт', '11': 'Лист', '12': 'Груд' 
  };

  const dataByMonth = Object.keys(monthlyDataMap).sort().map(key => {
    const [year, month] = key.split('-');
    return {
      name: `${monthNames[month]} ${year}`,
      value: monthlyDataMap[key]
    };
  });

  // 3. Загальна статистика (Репетиторство + Школа)
  const tutorRevenue = archive.reduce((sum, a) => sum + (a.student?.price || 0), 0);
  const totalRevenue = tutorRevenue + schoolTotal;
  const totalLessons = archive.length;
  const avgLessonPrice = totalLessons > 0 ? Math.round(tutorRevenue / totalLessons) : 0;

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: isDarkMode ? '#1f2937' : 'white', 
          border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, 
          padding: '10px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
        }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: isDarkMode ? '#f3f4f6' : '#1f2937' }}>{label}</p>
          <p style={{ margin: 0, color: payload[0].fill, fontWeight: 'bold' }}>{payload[0].value.toFixed(0)} ₴</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="finance-container" style={{ animation: 'fadeIn 0.3s' }}>
      <h1 style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FiPieChart /> Аналітика та Звіти
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#ede9fe', border: 'none', display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px' }}>
          <FiBarChart2 size={24} color="#8b5cf6" />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#8b5cf6', fontWeight: 'bold' }}>ЗАГАЛЬНИЙ ДОХІД</p>
            <h3 style={{ margin: 0, color: '#8b5cf6', fontSize: '24px' }}>{totalRevenue.toFixed(0)} ₴</h3>
          </div>
        </div>

        {/* Спеціальна картка для школи, якщо є дохід */}
        {schoolTotal > 0 && (
          <div className="stat-card" style={{ backgroundColor: isDarkMode ? '#1e293b' : '#eff6ff', border: '1px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px' }}>
            <FiBriefcase size={24} color="#3b82f6" />
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>ОТРИМАНО ВІД ШКОЛИ</p>
              <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '24px' }}>{schoolTotal.toFixed(0)} ₴</h3>
            </div>
          </div>
        )}

        <div className="stat-card" style={{ backgroundColor: isDarkMode ? '#1f2937' : '#dbeafe', border: 'none', display: 'flex', alignItems: 'center', gap: '15px', padding: '20px', borderRadius: '12px' }}>
          <FiTrendingUp size={24} color="#3b82f6" />
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>ПРОВЕДЕНО УРОКІВ</p>
            <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '24px' }}>{totalLessons}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Графік 1: Дохід по місяцях (Репетиторство + Школа) */}
        <div style={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', padding: '25px', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
          <h3 style={{ marginTop: 0, marginBottom: '25px', color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiCalendar color="#10b981" /> Динаміка доходу (Учні + Школа), ₴
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            {dataByMonth.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={dataByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} barSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Немає даних</div>
            )}
          </div>
        </div>

        {/* Графік 2: Розподіл (Учні та Школа) */}
        <div style={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', padding: '25px', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
          <h3 style={{ marginTop: 0, marginBottom: '25px', color: isDarkMode ? '#f3f4f6' : '#1f2937', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiUsers color="#8b5cf6" /> Розподіл доходів за весь час
          </h3>
          <div style={{ width: '100%', height: 300 }}>
            {dataByStudent.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={dataByStudent}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#e5e7eb'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={11} interval={0} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {dataByStudent.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isSchool ? '#3b82f6' : COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Немає даних</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsView;