import {defineStore} from 'pinia';
import {ref} from 'vue';
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
  //load each user project
  const loadProjects = () => {
    const authStore = useAuthStore();
    if (!authStore.user) {
      error.value = 'Utilisateur non authentifié';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const q = query(
        collection(db, 'projects'),
        where('userId', '==', authStore.user.uid)
      );

      unsubscribeProjects = onSnapshot(q, (snapshot) => {
        projects.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        //Sort by date
        projects.value.sort((a, b) => {
          const dateA = a.createdAt?.toMillis() || 0;
          const dateB = b.createdAt?.toMillis() || 0;
          return dateB - dateA;
        });
        
        loading.value = false;
        error.value = null;
      }, (err) => {
        console.error('Erreur Firestore:', err);
        error.value = 'Erreur lors du chargement des projets: ' + err.message;
        loading.value = false;
      });
    } catch (err) {
      console.error('Erreur:', err);
      error.value = 'Erreur lors du chargement des projets: ' + err.message;
      loading.value = false;
    }
  };
  //createProject
  const createProject = async (projectData) => {
    const authStore = useAuthStore();
    if (!authStore.user) throw new Error('Non authentifié');

    try {
      error.value = null;
      const docRef = await addDoc(collection(db, 'projects'), {
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#6366f1',
        userId: authStore.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Erreur création projet:', err);
      error.value = 'Erreur lors de la création du projet: ' + err.message;
      throw err;
    }
  };
  //updateProject
  const updateProject = async (projectId, projectData) => {
    try {
      error.value = null;
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        name: projectData.name,
        description: projectData.description || '',
        color: projectData.color || '#6366f1',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Erreur mise à jour projet:', err);
      error.value = 'Erreur lors de la mise à jour du projet: ' + err.message;
      throw err;
    }
  };
  //deleteProject
  const deleteProject = async (projectId) => {
    try {
      error.value = null;   
      //delete project task
      const tasksRef = collection(db, 'projects', projectId, 'tasks');
      const tasksSnapshot = await getDocs(tasksRef);
      
      const deletePromises = tasksSnapshot.docs.map(taskDoc => 
        deleteDoc(doc(db, 'projects', projectId, 'tasks', taskDoc.id))
      );
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'projects', projectId));
    } catch (err) {
      console.error('Erreur suppression projet:', err);
      error.value = 'Erreur lors de la suppression du projet: ' + err.message;
      throw err;
    }
  };
  //loadSpecificProject
  const loadProject = async (projectId) => {
    try {
      error.value = null;
      loading.value = true;
      
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()){
        currentProject.value = {
          id: projectSnap.id,
          ...projectSnap.data()
        };
      } else {
        throw new Error('Projet non trouvé');
      }
      
      loading.value = false;
    } catch (err) {
      console.error('Erreur chargement projet:', err);
      error.value = 'Erreur lors du chargement du projet: ' + err.message;
      loading.value = false;
      throw err;
    }
  };

  const loadTasks = (projectId) =>{
    if (!projectId) {
      error.value = 'ID de projet manquant';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const tasksRef = collection(db, 'projects', projectId, 'tasks');

      unsubscribeTasks = onSnapshot(tasksRef, (snapshot) => {
        tasks.value = snapshot.docs.map(doc =>({
          id: doc.id,
          ...doc.data()
        }));  
        //sort by creation date
        tasks.value.sort((a, b) => {
          const dateA = a.createdAt?.toMillis() || 0;
          const dateB = b.createdAt?.toMillis() || 0;
          return dateB - dateA;
        });
        
        loading.value = false;
        error.value = null;
      }, (err) => {
        console.error('Erreur chargement tâches:', err);
        error.value = 'Erreur lors du chargement des tâches: ' + err.message;
        loading.value = false;
      });
    } catch (err){
      console.error('Erreur:', err);
      error.value = 'Erreur lors du chargement des tâches: ' + err.message;
      loading.value = false;
    }
  };

  //createNew Task
  const createTask = async (projectId, taskData) => {
    try{
      error.value = null;
      const docRef = await addDoc(collection(db, 'projects', projectId, 'tasks'), {
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'todo',
        deadline: taskData.deadline || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error('Erreur création tâche:', err);
      error.value = 'Erreur lors de la création de la tâche: ' + err.message;
      throw err;
    }
  };
  //UpdateTask
  const updateTask = async (projectId, taskId, taskData) => {
    try {
      error.value = null;
      const taskRef = doc(db, 'projects', projectId, 'tasks', taskId);
      
      const updateData ={
        updatedAt: serverTimestamp()
      };
      
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.deadline !== undefined) updateData.deadline = taskData.deadline;
      
      await updateDoc(taskRef, updateData);
    } catch (err){
      console.error('Erreur mise à jour tâche:', err);
      error.value = 'Erreur lors de la mise à jour de la tâche: ' + err.message;
      throw err;
    }
  };

  //DeleteTask
  const deleteTask = async (projectId, taskId) => {
    try{
      error.value = null;
      await deleteDoc(doc(db, 'projects', projectId, 'tasks', taskId));
    } catch (err){
      console.error('Erreur suppression tâche:', err);
      error.value = 'Erreur lors de la suppression de la tâche: ' + err.message;
      throw err;
    }
  };

  const cleanup = () => {
    if (unsubscribeProjects){
      unsubscribeProjects();
      unsubscribeProjects = null;
    }
    if (unsubscribeTasks){
      unsubscribeTasks();
      unsubscribeTasks = null;
    }
    projects.value = [];
    tasks.value = [];
    currentProject.value = null;
  };
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