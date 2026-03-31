import { useState } from 'react';
import { toast } from 'react-toastify'; 
import { FiDollarSign, FiBriefcase, FiPlus, FiList, FiSearch, FiClock, FiEdit2, FiCheck } from 'react-icons/fi';

function FinanceView({ students, transactions, onAddTransaction, isDarkMode, schoolRate, setSchoolRate, schoolBalance, setSchoolBalance, requestConfirm }) {
  const [formData, setFormData] = useState({
    studentId: students.length > 0 ? students[0].id : '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [tempRate, setTempRate] = useState(schoolRate);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) return;

    const newTx = {
      id: Date.now(),
      studentId: Number(formData.studentId),
      studentName: students.find(s => s.id === Number(formData.studentId))?.name,
      amount: Number(formData.amount),
      date: formData.date,
      comment: formData.comment
    };

    onAddTransaction(newTx);
    setFormData({ ...formData, amount: '', comment: '' });
    toast.success('Оплату успішно внесено!');
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.studentName && tx.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="finance-container" style={{ animation: 'fadeIn 0.3s' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <FiDollarSign /> Каса та Оплати
        </h1>
        <p style={{ color: '#9ca3af', margin: '5px 0 0 0' }}>Керування надходженнями від учнів</p>
      </div>

      {/* ========================================================= */}
      {/* БЛОК: ШКІЛЬНА ЗАРПЛАТА */}
      {/* ========================================================= */}
      <div className="finance-view-card" style={{ padding: '20px', marginBottom: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', borderLeft: '5px solid #3b82f6', backgroundColor: 'var(--card-bg)' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
            <FiBriefcase /> Шкільна Зарплата
          </h3>
          <p style={{ margin: 0, fontSize: '13px', color: isDarkMode ? '#94a3b8' : '#64748b', lineHeight: '1.5' }}>
            Накопичується за відпрацьовані зміни. <br/>
            Коли школа перерахує гроші в кінці місяця, натисни кнопку, щоб <b>перенести цю суму в загальний дохід</b> та почати новий місяць.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* КРАСИВЕ РЕДАГУВАННЯ СТАВКИ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: isDarkMode ? '#cbd5e1' : '#475569' }}>Ставка (₴/год)</label>
            
            {isEditingRate ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <input 
                  type="number" 
                  value={tempRate} 
                  onChange={(e) => setTempRate(e.target.value)}
                  autoFocus
                  style={{ width: '70px', padding: '6px 10px', borderRadius: '6px', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, background: isDarkMode ? '#374151' : '#fff', color: isDarkMode ? '#fff' : '#000', outline: 'none' }}
                />
                <button 
                  onClick={() => {
                    const newRate = Number(tempRate);
                    if (!isNaN(newRate) && newRate > 0) {
                      // ПЕРЕВІРКА: Якщо сума дійсно змінилася, зберігаємо і показуємо тост
                      if (newRate !== schoolRate) {
                        setSchoolRate(newRate);
                        toast.success('Ставку оновлено!');
                      }
                      // В будь-якому випадку закриваємо поле вводу
                      setIsEditingRate(false);
                    } else {
                      toast.error('Введіть коректну суму');
                    }
                  }}
                  style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', display: 'flex' }}
                >
                  <FiCheck size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', padding: '5px 0' }}>
                {schoolRate} ₴
                <button 
                  onClick={() => { setTempRate(schoolRate); setIsEditingRate(true); }}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', transition: '0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                  title="Змінити ставку"
                >
                  <FiEdit2 size={16} />
                </button>
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: isDarkMode ? '#cbd5e1' : '#475569' }}>Накопичено</label>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981', padding: '6px 0' }}>
              {schoolBalance.toFixed(0)} ₴
            </div>
          </div>

          <button 
            onClick={() => {
              if(schoolBalance === 0) {
                toast.warning('⚠️ Баланс порожній! Спочатку відпрацюй шкільні зміни.');
                return;
              }
              requestConfirm(`Школа виплатила зарплату? Сума ${schoolBalance.toFixed(0)} ₴ буде додана до твоєї загальної статистики, а лічильник обнулиться.`, () => {
                const schoolTx = {
                  id: Date.now(),
                  studentId: 'school_salary',
                  studentName: '🏫 Шкільна Зарплата',
                  amount: schoolBalance,
                  date: new Date().toISOString().split('T')[0],
                  type: 'income'
                };
                
                onAddTransaction(schoolTx);
                setSchoolBalance(0);
                toast.success('🎉 Шкільну зарплату успішно зараховано!');
              });
            }}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #3b82f6', 
              backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', 
              color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end', height: 'fit-content',
              transition: '0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3b82f6'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
          >
            ✅ ЗП зараховано
          </button>
        </div>
      </div>
      {/* ========================================================= */}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* ФОРМА ДОДАВАННЯ ОПЛАТИ */}
        <div style={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', padding: '25px', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`, alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
            <FiPlus color="#10b981" /> Внести оплату
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Оберіть учня</label>
              <select 
                value={formData.studentId} 
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', background: isDarkMode ? '#374151' : '#f9fafb', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, color: isDarkMode ? 'white' : 'black' }}
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.balance} ₴)</option>)}
              </select>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Сума (₴)</label>
                <input 
                  type="number" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="напр. 500"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: isDarkMode ? '#374151' : '#f9fafb', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, color: isDarkMode ? 'white' : 'black' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '5px' }}>Дата</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', background: isDarkMode ? '#374151' : '#f9fafb', border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`, color: isDarkMode ? 'white' : 'black' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-submit" style={{ width: '100%', backgroundColor: '#10b981', marginTop: '10px' }}>
              Зарахувати на баланс
            </button>
          </form>
        </div>

        {/* СПИСОК ОСТАННІХ ТРАНЗАКЦІЙ З ПОШУКОМ */}
        <div style={{ backgroundColor: isDarkMode ? '#1f2937' : 'white', padding: '25px', borderRadius: '16px', border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}` }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '18px' }}>
              <FiList color="#3b82f6" /> Останні надходження
            </h3>
            
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Пошук за ім'ям..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  padding: '8px 12px 8px 32px', 
                  borderRadius: '8px', 
                  border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                  backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
                  color: isDarkMode ? 'white' : 'black',
                  outline: 'none',
                  width: '180px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                {transactions.length === 0 ? 'Оплат ще не було' : 'Оплат не знайдено 🔍'}
              </p>
            ) : (
              [...filteredTransactions].reverse().map(tx => (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: isDarkMode ? '#374151' : '#f9fafb', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ backgroundColor: '#d1fae5', color: '#10b981', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                      <FiDollarSign size={16} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{tx.studentName}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={10} /> {tx.date}
                      </p>
                    </div>
                  </div>
                  <strong style={{ color: '#10b981', fontSize: '15px' }}>+{tx.amount} ₴</strong>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default FinanceView;