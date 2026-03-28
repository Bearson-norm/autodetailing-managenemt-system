import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

export type UserRole = 'consumer' | 'admin' | 'worker';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  phone?: string;
  language: 'id' | 'en';
}

export type TransactionStatus = 'received' | 'ordered' | 'finished';

export interface Transaction {
  id: string;
  orderNumber: string;
  consumerId: string;
  consumerName: string;
  status: TransactionStatus;
  date: string;
  name: string;
  address: string;
  location?: string;
  whatsapp: string;
  carBrand: string;
  carYear: string;
  carColor: string;
  selectedPackage: 'interior' | 'exterior' | 'complete';
  currentSeat: string;
  hasStain: boolean;
  workplaceAvailable: boolean;
  canopy: boolean;
  parking: boolean;
  waterElectricity: boolean;
  audioSystem: string;
  specialComplaints: string;
  createdAt: string;
}

export interface WorkOrderDoc {
  id: string;
  fileName: string;
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  transactionId: string;
  workerId: string;
  workerName: string;
  status: 'assigned' | 'finished';
  documentation: WorkOrderDoc[] | string[]; // Support both formats for compatibility
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isInitializing: boolean;
  users: User[];
  addWorker: (username: string, password: string, name: string, phone?: string) => Promise<void>;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'orderNumber' | 'createdAt'>) => Promise<string>;
  updateTransactionStatus: (id: string, status: TransactionStatus) => Promise<void>;
  workOrders: WorkOrder[];
  addWorkOrder: (transactionId: string, workerId: string) => Promise<string>;
  updateWorkOrder: (id: string, files: File[]) => Promise<void>;
  finishWorkOrder: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for existing session on mount, auto-login as consumer if no session
  useEffect(() => {
    const init = async () => {
      try {
        const response = await api.getCurrentUser();
        setCurrentUser(response.user);
      } catch {
        // No session - auto-login as consumer (default)
        try {
          const response = await api.login('consumer1', 'consumer123');
          setCurrentUser(response.user);
        } catch {
          setCurrentUser(null);
        }
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  // Refresh data when user changes
  useEffect(() => {
    if (currentUser) {
      refreshData();
    } else {
      setTransactions([]);
      setWorkOrders([]);
      setUsers([]);
    }
  }, [currentUser]);

  const refreshData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Fetch transactions and work orders in parallel
      const [transactionsRes, workOrdersRes] = await Promise.all([
        api.getTransactions(),
        api.getWorkOrders(),
      ]);

      setTransactions(transactionsRes.transactions);
      setWorkOrders(workOrdersRes.workOrders);

      // Fetch users if admin
      if (currentUser.role === 'admin') {
        const usersRes = await api.getWorkers();
        setUsers(usersRes.workers);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await api.login(username, password);
      setCurrentUser(response.user);
      return response.user;
    } catch (error: any) {
      console.error('Login failed:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setCurrentUser(null);
    }
  };

  const addWorker = async (username: string, password: string, name: string, phone?: string) => {
    try {
      await api.createWorker(username, password, name, phone);
      await refreshData();
    } catch (error) {
      console.error('Failed to add worker:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'orderNumber' | 'createdAt'>): Promise<string> => {
    try {
      // Remove fields that shouldn't be sent to API
      const { consumerId, consumerName, status, ...apiData } = transaction;
      
      const response = await api.createTransaction(apiData);
      await refreshData();
      return response.orderNumber;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      throw error;
    }
  };

  const updateTransactionStatus = async (id: string, status: TransactionStatus) => {
    try {
      await api.updateTransactionStatus(id, status);
      await refreshData();
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      throw error;
    }
  };

  const addWorkOrder = async (transactionId: string, workerId: string): Promise<string> => {
    try {
      const response = await api.createWorkOrder(transactionId, workerId);
      await refreshData();
      return response.workOrderNumber;
    } catch (error) {
      console.error('Failed to create work order:', error);
      throw error;
    }
  };

  const updateWorkOrder = async (id: string, files: File[]) => {
    try {
      await api.uploadWorkOrderDocuments(id, files);
      await refreshData();
    } catch (error) {
      console.error('Failed to update work order:', error);
      throw error;
    }
  };

  const finishWorkOrder = async (id: string) => {
    try {
      await api.finishWorkOrder(id);
      await refreshData();
    } catch (error) {
      console.error('Failed to finish work order:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isInitializing,
        users,
        addWorker,
        transactions,
        addTransaction,
        updateTransactionStatus,
        workOrders,
        addWorkOrder,
        updateWorkOrder,
        finishWorkOrder,
        login,
        logout,
        refreshData,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
