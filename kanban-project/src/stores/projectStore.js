import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from './authStore';

export const useProjectStore = defineStore('project', () => {
  const projects = ref([]);
  const currentProject = ref(null);
  const tasks = ref([]);
  const loading = ref(false);
  const error = ref(null);
  
  let unsubscribeProjects = null;
  let unsubscribeTasks = null;

  // Charger les projets de l'utilisateur en temps réel
  const loadProjects = () => {
    const authStore = useAuthStore();
    if (!authStore.user) return;

    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', authStore.user.uid),
        orderBy('createdAt', 'desc')
      );

      unsubscribeProjects = onSnapshot(q, (snapshot) => {
        projects.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        loading.value = false;
      }, (err) => {
        error.value = 'Erreur lors du chargement des projets';
        loading.value = false;
        console.error(err);
      });
    } catch (err) {
      error.value = 'Erreur lors du chargement des projets';
      loading.value = false;
      console.error(err);
    }
  };

  // Créer un nouveau projet
  const createProject = async (projectData) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('Non authentifié');

    try {
      error.value = null;
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId: authStore.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      error.value = 'Erreur lors de la création du projet';
      console.error(err);
      throw err;
    }
  };

  // Mettre à jour un projet
  const updateProject = async (projectId, projectData) => {
    try {
      error.value = null;
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...projectData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour du projet';
      console.error(err);
      throw err;
    }
  };

  // Supprimer un projet
  const deleteProject = async (projectId) => {
    try {
      error.value = null;
      // Supprimer d'abord toutes les tâches du projet
      const tasksSnapshot = await getDocs(collection(db, 'projects', projectId, 'tasks'));
      const deletePromises = tasksSnapshot.docs.map(taskDoc => deleteDoc(taskDoc.ref));
      await Promise.all(deletePromises);
      
      // Puis supprimer le projet
      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      error.value = 'Erreur lors de la suppression du projet';
      console.error(err);
      throw err;
    }
  };

  // Charger un projet spécifique
  const loadProject = async (projectId) => {
    try {
      error.value = null;
      loading.value = true;
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        currentProject.value = {
          id: projectSnap.id,
          ...projectSnap.data()
        };
      } else {
        throw new Error('Projet non trouvé');
      }
      
      loading.value = false;
    } catch (err) {
      error.value = 'Erreur lors du chargement du projet';
      loading.value = false;
      console.error(err);
      throw err;
    }
  };

  // Charger les tâches d'un projet en temps réel
  const loadTasks = (projectId) => {
    if (!projectId) return;

    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'projects', projectId, 'tasks'),
        orderBy('createdAt', 'desc')
      );

      unsubscribeTasks = onSnapshot(q, (snapshot) => {
        tasks.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        loading.value = false;
      }, (err) => {
        error.value = 'Erreur lors du chargement des tâches';
        loading.value = false;
        console.error(err);
      });
    } catch (err) {
      error.value = 'Erreur lors du chargement des tâches';
      loading.value = false;
      console.error(err);
    }
  };

  // Créer une nouvelle tâche
  const createTask = async (projectId, taskData) => {
    try {
      error.value = null;
      const docRef = await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        ...taskData,
        status: taskData.status || 'todo',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      error.value = 'Erreur lors de la création de la tâche';
      console.error(err);
      throw err;
    }
  };

  // Mettre à jour une tâche
  const updateTask = async (projectId, taskId, taskData) => {
    try {
      error.value = null;
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      error.value = 'Erreur lors de la mise à jour de la tâche';
      console.error(err);
      throw err;
    }
  };

  // Supprimer une tâche
  const deleteTask = async (projectId, taskId) => {
    try {
      error.value = null;
      await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
    } catch (err) {
      error.value = 'Erreur lors de la suppression de la tâche';
      console.error(err);
      throw err;
    }
  };

  // Nettoyer les listeners
  const cleanup = () => {
    if (unsubscribeProjects) unsubscribeProjects();
    if (unsubscribeTasks) unsubscribeTasks();
    projects.value = [];
    tasks.value = [];
    currentProject.value = null;
  };

  // Getters
  const getTasksByStatus = (status) => {
    return tasks.value.filter(task => task.status === status);
  };

  return {
    // State
    projects,
    currentProject,
    tasks,
    loading,
    error,

    // Actions
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    loadProject,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    cleanup,

    // Getters
    getTasksByStatus
  };
});