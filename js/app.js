const signupForm = document.querySelector("#signup-form");

signupForm.addEventListener("submit", (e) => {
  //   предотвращаем обновление формы
  e.preventDefault();
  const email = signupForm["email"].value;
  const password = signupForm["password"].value;
  // создаем нового пользователя auth=firebase.auth() прописано в index.html
  auth
    .createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      //   db = firebase.firestore() прописано в index.html
      return db
        .collection("users")
        .doc(cred.user.uid)
        .set({
          email,
          password,
        })
        .then(() => {
          console.log("success");
          signupForm.reset();
          //   переход на нужный html документ
          location = "login.html";
        })
        .catch((err) => {
          console.log(err.message);
        });
    })
    .catch((err) => {
      console.log(err.message);
    });
});
