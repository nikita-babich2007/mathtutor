// src/hooks/useTutorData.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export function useTutorData() {
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('tutor-students-base')) || []);
  const [lessons, setLessons] = useState(() => JSON.parse(localStorage.getItem('tutor-schedule')) || []);
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('tutor-transactions')) || []);
  const [archive, setArchive] = useState(() => JSON.parse(localStorage.getItem('tutor-archive')) || []);
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('tutor-dark-mode')) || false);
  const [todos, setTodos] = useState(() => JSON.parse(localStorage.getItem('tutor-todos')) || []);
  
  const [materials, setMaterials] = useState(() => JSON.parse(localStorage.getItem('tutor-materials')) || []);
  const [folders, setFolders] = useState(() => JSON.parse(localStorage.getItem('tutor-folders')) || [
    { id: 'initial_1', name: 'Інструменти', parentId: null },
    { id: 'initial_2', name: 'Підручники', parentId: null }
  ]);

  useEffect(() => {
    const storageData = { 
      'tutor-students-base': students, 
      'tutor-schedule': lessons, 
      'tutor-transactions': transactions, 
      'tutor-archive': archive, 
      'tutor-dark-mode': isDarkMode, 
      'tutor-todos': todos, 
      'tutor-materials': materials,
      'tutor-folders': folders
    };
    Object.entries(storageData).forEach(([key, val]) => localStorage.setItem(key, JSON.stringify(val)));
  }, [students, lessons, transactions, archive, isDarkMode, todos, materials, folders]);

  const updateStudentBalance = (studentId, amount) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, balance: (s.balance || 0) + amount } : s));
  };

  const togglePaymentStatus = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const isNowPaid = lesson.paymentStatus !== 'paid';
    updateStudentBalance(lesson.student.id, isNowPaid ? lesson.student.price : -lesson.student.price);
    setLessons(lessons.map(l => l.id === lessonId ? { ...l, paymentStatus: isNowPaid ? 'paid' : 'debt' } : l));
    toast.success(isNowPaid ? '💰 Оплату зараховано!' : '↩️ Оплату скасовано');
  };

  const toggleCompletedStatus = (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId);
    const isNowCompleted = !lesson.isCompleted;
    updateStudentBalance(lesson.student.id, isNowCompleted ? -lesson.student.price : lesson.student.price);
    setLessons(lessons.map(l => l.id === lessonId ? { ...l, isCompleted: isNowCompleted } : l));
    if (isNowCompleted) {
      setArchive([{ ...lesson, archiveDate: new Date().toISOString().split('T')[0], isCompleted: true }, ...archive]);
      toast.info('✅ Урок проведено і додано в журнал');
    }
  };

  return {
    students, setStudents, lessons, setLessons,
    transactions, setTransactions, archive, setArchive,
    isDarkMode, setIsDarkMode, todos, setTodos,
    materials, setMaterials, folders, setFolders,
    updateStudentBalance, togglePaymentStatus, toggleCompletedStatus
  };
}