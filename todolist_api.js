//todolist_api.js

const apiURL = "https://681900f95a4b07b9d1d1a66a.mockapi.io/";

export const getTaskList = async () => {
    const response = await fetch(apiURL + "todolist");
    const data = await response.json();
    console.log(data);
    return data;
};

export const getTask = async (id) => {
    const response = await fetch(apiURL + "todolist/" + id);
    const data = await response.json();
    return data;
};

export const createTask = async (post) => {
    const response = await fetch(apiURL + "todolist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(post),
    });
    const data = await response.json();
    return data;
};



export const updateTask = async (id, post) => {
    const response = await fetch(apiURL + "todolist/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(post),
    });
    const data = await response.json();
    return data;
  };


export const deleteTask = async (id) => {
    const response = await fetch(apiURL + "todolist/" + id, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
};
