const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", (e) => {
  //   предотвращаем обновление формы
  e.preventDefault();
  //   берем данные из формы
  const loginEmail = loginForm["email"].value;
  const loginPassword = loginForm["password"].value;
  // запрос на логин и пароль
  auth
    .signInWithEmailAndPassword(loginEmail, loginPassword)
    // при правильном вводе переводит в следующий html документ
    .then(() => (location = "users.html"))
    .catch((err) => console.log(err));
});
