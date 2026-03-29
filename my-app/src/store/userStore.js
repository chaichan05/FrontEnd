import { create } from 'zustand';

export const useUserStore = create((set) => ({
    // Data state
    data: [],
    departments: [],
    
    // Search and pagination
    searchTerm: "",
    currentPage: 1,
    
    // Modal states
    selectedUser: null,
    isOpen: false,
    
    isEditOpen: false,
    editingUser: null,
    formData: {},
    
    isCreateOpen: false,
    newUserData: {},
    isAddressOpen: false,
    
    // Actions
    setData: (data) => set({ data }),
    setDepartments: (departments) => set({ departments }),
    setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
    setCurrentPage: (currentPage) => set({ currentPage }),
    
    // Modal actions
    setSelectedUser: (selectedUser) => set({ selectedUser }),
    setIsOpen: (isOpen) => set({ isOpen }),
    
    setIsEditOpen: (isEditOpen) => set({ isEditOpen }),
    setEditingUser: (editingUser) => set({ editingUser }),
    setFormData: (formData) => set({ formData }),
    updateFormData: (updates) => set((state) => ({ 
        formData: { ...state.formData, ...updates } 
    })),
    
    setIsCreateOpen: (isCreateOpen) => set({ isCreateOpen }),
    setNewUserData: (newUserData) => set({ newUserData }),
    updateNewUserData: (updates) => set((state) => ({
        newUserData: { ...state.newUserData, ...updates }
    })),
    setIsAddressOpen: (isAddressOpen) => set({ isAddressOpen }),
    
    // Helper actions
    resetCreateForm: () => set({
        isCreateOpen: false,
        newUserData: {},
        isAddressOpen: false
    }),
    
    resetEditForm: () => set({
        isEditOpen: false,
        editingUser: null,
        formData: {}
    }),
    
    addUserToData: (newUser) => set((state) => ({
        data: [...state.data, newUser].sort((a, b) => a.id - b.id)
    })),
    
    updateUserInData: (userId, updates) => set((state) => ({
        data: state.data.map(u => u.id === userId ? { ...u, ...updates } : u)
    })),
    
    removeUserFromData: (userId) => set((state) => ({
        data: state.data.filter(u => u.id !== userId)
    }))
}));
