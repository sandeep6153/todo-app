import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import TaskSearch from './task-search-component/TaskSearch';
import './Tasks.css'
import axios from 'axios';
import debounce from '@mui/utils/debounce';
import TaskItem from './task-list-component/TaskList';

export default function Tasks() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [taskList, setTaskList] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const selectedId = useRef();
    useEffect(() => {
      getFilteredList();
    }, [searchParams, taskList]);

    const setSelectedId = task => {
        selectedId.current = task;
    }
    const saveTask = async taskName => {
        if(taskName.length > 0) {
            try {
            await axios.post('https://functions-cust-fun-sandy.harperdbcloud.com/api/saveTask', {taskTitle: taskName, taskStatus: 'ACTIVE', operation: 'sql'});
            getTasks();
            
            } catch(ex) {
    
            }
        }
    }

    const updateTask = async taskName => {
        if(taskName.length > 0) {
            try {
            await axios.put('https://functions-cust-fun-sandy.harperdbcloud.com/api/saveTask', {taskTitle: taskName, operation: 'sql', id: selectedId.current.id, taskStatus: selectedId.current.taskStatus});
            getTasks();
            } catch(ex) {
    
            }
        }
    }

    const doneTask = async task => {
 
            try {
            await axios.put('https://functions-cust-fun-sandy.harperdbcloud.com/api/saveTask', {taskTitle: task.taskTitle, operation: 'sql', id: task.id, taskStatus: task.taskStatus});
            getTasks();
            } catch(ex) {
    
            }


    }

    const deleteTask = async task => {
        try {
            await axios.delete(`https://functions-cust-fun-sandy.harperdbcloud.com/api/deleteTask/${task.id}`);
            getTasks();
        } catch(ex) {

        }
    };

    const getFilteredList = () => {
        if(searchParams.get('filter')) {
        const list = [...taskList];
        setFilteredList(list.filter(item => item.taskStatus === searchParams.get('filter').toUpperCase()));
        } else {
            setFilteredList([...taskList]);
        }
    }

    useEffect(() => {
        getTasks();
    }, []);

    const getTasks = async () => {
        const res = await axios.get('https://functions-cust-fun-sandy.harperdbcloud.com/api/tasks');
        console.log(res);
        setTaskList(res.data)
    }

    const debounceSaveData = useCallback(debounce(saveTask, 500), []);
    const searchHandlder = async (taskName) => {
        debounceSaveData(taskName)
    }
 
  return (
    <div className="main">
      <TaskSearch searchHandlder={searchHandlder}/>
      <ul className="task-filters">
          <li>
              <a href="javascript:void(0)" onClick={()=> navigate('/')} className={!searchParams.get('filter') ? 'active' : ''}>View All</a>
          </li>
          <li>
              <a href="javascript:void(0)" onClick={()=> navigate('/?filter=active')} className={searchParams.get('filter') === 'active' ? 'active' : ''}>Active</a>
          </li>
          <li>
              <a href="javascript:void(0)" onClick={()=> navigate('/?filter=completed')} className={searchParams.get('filter') === 'completed' ? 'active' : ''}>Completed</a>
          </li>
      </ul>
      {
          filteredList.map(task => <TaskItem deleteTask={deleteTask} doneTask={doneTask} getSelectedId={setSelectedId} task={task} searchComponent={<TaskSearch searchHandlder={updateTask} defaultValue={task.taskTitle}/>}/>)
      }
    </div>
  );
}
