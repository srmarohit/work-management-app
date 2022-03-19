// async function validateToken(token){
//     const response = await axios.get("https://0z6ju.sse.codesandbox.io/verify/"+token );
//     if(response.data.status){
//         location.href="dashboard.html" ;
//         console.log(response.data)
//     }
// }

// if(localStorage.getItem("jobs-data")){
//    // console.log(localStorage.getItem("jobs-data"));
//     validateToken(JSON.parse(localStorage.getItem("jobs-data")).token);
// }

/** is user already LoggedIn ?  */

// localStorage.setItem("jobs-data", JSON.stringify({user : "rohit", token : "forbidden"}))

//  if(localStorage.getItem("jobs-data")){
//      console.log("user already logged in ..");
//       let data = JSON.parse(localStorage.getItem("jobs-data")) ;
//        if(data.token === "forbidden"){
//            console.log("token Correct")
//        }else{
//            console.log("token incorrect")
//        }
//  }else{
//      console.log("Not logged in.")
//  }

/** Validate Token  */

async function validateToken(token) {
  const response = await axios.get(
    "https://api-work-management.herokuapp.com/verifyuser?token=" + token
  );
  if (response.data.error) {
    return console.log("error : " + response.data.error);
  }

  console.log(response.data);

  if (response.data.role === "admin") {
    location.href = "admin.html";
    console.log("admin");
  } else {
    location.href = "dashboard.html";
  }
}

if (localStorage.getItem("jobs-data")) {
  const token = JSON.parse(localStorage.getItem("jobs-data")).token;
  validateToken(token);
} else {
  console.log("have not");
}

/** Login form Submit event  */

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  // console.log(document.getElementById("email").value)
  // console.log(document.getElementById("password").value)

  let credential = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
  };

  const response = await axios.post(
    "https://api-work-management.herokuapp.com/users/login",
    credential
  );

  if (response.data.error) {
    console.log("something went wrong : " + response.data.error);
  } else {
    console.log(response.data);
    localStorage.setItem(
      "jobs-data",
      JSON.stringify({ user: response.data.user, token: response.data.token })
    );
    if (response.data.role === "admin") {
      location.href = "admin.html";
    } else {
      location.href = "dashboard.html";
    }
  }
});
