

/** signup submit event */

document.getElementById("signup-form").addEventListener("submit", async (e)=>{
    e.preventDefault();
    console.log(document.getElementById("fname").value)
    console.log(document.getElementById("lname").value)
    console.log(document.getElementById("email").value)
    console.log(document.getElementById("password").value)

    let newUser = {
        email : document.getElementById("email").value ,
        fname : document.getElementById("fname").value ,
        lname : document.getElementById("lname").value ,
        password : document.getElementById("password").value 
    } ;

   const response = await axios.post("http://localhost:8080/users/adduser", newUser);

   if(response.data.error){
       console.log("something went wrong : "+ response.data.error)
   }else{
       console.log(response.data);
       location.href="login.html";
   }
})
