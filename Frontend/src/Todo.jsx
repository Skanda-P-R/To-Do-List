import React, {useState, useEffect} from "react";

function Todo(){
    const [task,addTask] = useState([]);
    const [text,setText] = useState("");
    const [index,setIndex] = useState(0);

    useEffect(() => {
        async function fetchTasks() {
            try {
                const res = await fetch("http://localhost:5000/get");
                const data = await res.json();
                addTask(data);
                setIndex(data.length);
            } catch (error) {
                console.error("Error loading tasks:", error);
            }
        }

        fetchTasks();
    }, []);

    function updateText(e){
        setText(t => e.target.value);
    }

     async function insertTask(){
        const currentText = text;
        const currentIndex = index;
        addTask(t => [...t, text]);
        setIndex(i => i + 1);
        setText(t => "");
        try{
            const res = await fetch('http://localhost:5000/add',{
                method: 'POST',
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({
                    text: currentText,
                    index: currentIndex,
                }),
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function deleteTask(index) {
        addTask(t => t.filter((_, i) => i !== index));
        setIndex(i => i - 1);

        await fetch("http://localhost:5000/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ index: index }),
        });
    }

    async function upTask(index) {
        if (index > 0) {
            addTask(t => {
                const newList = [...t];
                [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
                return newList;
            });

            await fetch("http://localhost:5000/move-up", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index: index }),
            });
        }
    }

    async function downTask(index) {
        if (index < task.length - 1) {
            addTask(t => {
                const newList = [...t];
                [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
                return newList;
            });

            await fetch("http://localhost:5000/move-down", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ index: index }),
            });
        }
    }

    return(
        <>
            <div className="container">
                <h2 className="todo-heading">To-Do List</h2>
                <div className="task-add-container">
                    <span style={{fontSize:"1.25em"}}>Enter Task: <input type="text" className="task-text" value={text} onChange={updateText}/></span>
                    <button className="add-task-btn" onClick={insertTask}>Add</button>
                </div>
                <div className="tasks-container">
                    {task.map((t,index) =>  <div key={index} className="tasks">
                                                <span className="task-output">{t} </span>
                                                <button className="task-btn task-delete" onClick={() => deleteTask(index)}>Delete</button>
                                                <button className="task-btn task-moveup" onClick={() => upTask(index)}>☝</button>
                                                <button className="task-btn task-movedown" onClick={() => downTask(index)}>👇</button>
                                            </div>
                                                    )}
                </div>
            </div>
        </>
    );
}

export default Todo