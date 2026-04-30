// ============================================
// Employees Firestore CRUD
// ============================================

import { db } from './config';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { Employee } from '@/types/employee';

const EMPLOYEES_COLLECTION = 'employees';

export async function getEmployeesByTenant(tenantId: string): Promise<Employee[]> {
  const q = query(
    collection(db, EMPLOYEES_COLLECTION),
    where('tenantId', '==', tenantId),
    orderBy('fullName', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
    } as Employee;
  });
}

export async function addEmployee(
  employeeData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
    ...employeeData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateEmployee(
  employeeId: string,
  updates: Partial<Employee>
): Promise<void> {
  const empRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
  await updateDoc(empRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

export async function removeEmployee(employeeId: string): Promise<void> {
  await deleteDoc(doc(db, EMPLOYEES_COLLECTION, employeeId));
}
