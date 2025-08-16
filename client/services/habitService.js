import { API_BASE_URL } from './api';

class HabitService {
    // Crear un nuevo hábito
    static async createHabit(habitData, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(habitData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating habit:', error);
            throw error;
        }
    }

    // Obtener hábitos de un usuario
    static async getUserHabits(userId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting user habits:', error);
            throw error;
        }
    }

    // Actualizar un hábito
    static async updateHabit(habitId, habitData, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(habitData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating habit:', error);
            throw error;
        }
    }

    // Eliminar un hábito
    static async deleteHabit(habitId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/${habitId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting habit:', error);
            throw error;
        }
    }

    // Marcar hábito como completado
    static async markHabitCompleted(habitId, token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/${habitId}/complete`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking habit completed:', error);
            throw error;
        }
    }

    // Obtener categorías disponibles
    static async getCategories(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/categories`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting categories:', error);
            throw error;
        }
    }

    // Obtener frecuencias disponibles
    static async getFrequencies(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/frequencies`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting frequencies:', error);
            throw error;
        }
    }

    // Obtener metas disponibles
    static async getMetas(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/habits/metas`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error getting metas:', error);
            throw error;
        }
    }
}

export default HabitService;
