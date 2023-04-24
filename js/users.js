const form = document.querySelector("#form");
const todoContainer = document.querySelector("#todo-container");

let date = new Date();
let time = date.getTime();
let counter = time;
let todos = [];

// проверяем зарегистрирован ли пользователь
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("user is signed in at users.html");
  } else {
    alert(
      "Ваш сеанс входа в систему истек или вы вышли из системы, войдите снова, чтобы продолжить"
    );
    location = "login.html";
  }
});
// выход из личного кабинета
function logout() {
  auth.signOut();
  //   сохранение все данные локально
  localStorage.removeItem("todos");
}
// сохранение введного текста в записи
function saveData(doc) {
  let todo = {
    id: doc.id,
    text: doc.data().text,
    completed: doc.data().completed,
  };
  todos.push(todo);
}
function renderData(id) {
  // принимает id добавленной задачи и ищет ее в массиве и сохраняет
  let todoObj = todos.find((todo) => todo.id === id);
  //создаем список
  let parentDiv = document.createElement("li");
  parentDiv.setAttribute("id", todoObj.id);
  // создаем параграф для добавления текстового содержимого
  let todoDiv = document.createElement("p");
  //   делаем срез текста, чтобы он не выходил за рамки формы
  todoDiv.textContent =
    todoObj.text.length <= 20 ? todoObj.text : todoObj.text.slice(0, 20);
  //   добавляем класс со стилями (см. css)
  todoObj.completed ? todoDiv.classList.add("completed") : todoDiv;

  //   удаление записи из базы
  let trashButton = document.createElement("button");
  trashButton.className = "far fa-trash-alt";
  trashButton.classList.add("delete");
  trashButton.classList.add("button");
  trashButton.classList.add("hover_button");
  // завершение задачи
  let completeButton = document.createElement("button");
  completeButton.className = "fa solid fa-check";
  completeButton.classList.add("finish");
  completeButton.classList.add("button");
  completeButton.classList.add("hover_button");

  let buttonDiv = document.createElement("div");
  buttonDiv.className = "button_div";
  buttonDiv.appendChild(trashButton);
  buttonDiv.appendChild(completeButton);

  //   добавляем параграф в список
  parentDiv.appendChild(todoDiv);
  //   добавляем кнопку
  parentDiv.appendChild(buttonDiv);
  // вносим все в контейнер
  todoContainer.appendChild(parentDiv);

  // слушатель клика при удалении записи
  trashButton.addEventListener("click", (e) => {
    let id = e.target.parentElement.parentElement.getAttribute("id");
    auth.onAuthStateChanged((user) => {
      if (user) db.collection(user.uid).doc(id).delete();
    });
  });

  // слушатель клика при нажатии на кнопку "завершить"
  completeButton.addEventListener("click", (e) => {
    let id = e.target.parentElement.parentElement.getAttribute("id");

    auth.onAuthStateChanged((user) => {
      let item = db.collection(`${user.uid}`).doc(id);
      item.get().then((doc) => {
        item.update({ completed: !doc.data().completed });
        todoDiv.classList.toggle("completed");
        todos.map((todo) =>
          todo.id === doc.id ? (todo.completed = !todo.completed) : todo
        );
      });
    });
  });
}
// присваиваем id для каждой записи в личном кабинете
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = form["todos"].value;
  let id = (counter += 1);
  form.reset();

  auth.onAuthStateChanged((user) => {
    if (user) {
      //   создаем новую коллекцию для записей
      db.collection(user.uid)
        .doc("_" + id)
        .set({
          id: "_" + id,
          text,
          completed: false,
        })
        .then(() => {
          console.log("todo added");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  });
});
// настройка фильтров
function filterHandler(status) {
  if (status === "completed")
    todos = JSON.parse(localStorage.getItem("todos")).filter(
      (todo) => todo.completed
    );
  else if (status === "open")
    todos = JSON.parse(localStorage.getItem("todos")).filter(
      (todo) => !todo.completed
    );
  else todos = JSON.parse(localStorage.getItem("todos"));
  // чтобы задачи появялись только у одного пользователя
  todoContainer.innerHTML = "";
  todos.forEach((todo) => renderData(todo.id));
}
// проверяет изменения в базе данных
auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection(user.uid).onSnapshot((snapshot) => {
      //   получаем статус изменений
      let changes = snapshot.docChanges();
      changes.forEach((change) => {
        if (change.type === "added") {
          saveData(change.doc);
          renderData(change.doc.id);
          // при удалении записи из базы - удаление записи в контейнере
        } else if (change.type === "removed") {
          let li = todoContainer.querySelector(`#${change.doc.id}`);
          todoContainer.removeChild(li);
          todos = todos.filter((todo) => todo.id !== change.doc.id);
        }
      });
      localStorage.setItem("todos", JSON.stringify(todos));
    });
  }
});
