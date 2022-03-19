/** Validate Token */

async function validateToken(token) {
  const response = await axios.get(
    "http://localhost:8080/verifyuser?token=" + token
  );
  if (response.data.error) {
    return console.log("error : " + response.data.error);
  }

  console.log(response.data);

  if (response.data.role === "admin") {
    console.log("admin");
  } else {
    location.href = "dashboard.html";
  }
}

if (localStorage.getItem("jobs-data")) {
  const token = JSON.parse(localStorage.getItem("jobs-data")).token;
  validateToken(token);
} else {
  location.href = "login.html";
}

/** logout activity */
document.getElementById("logout").addEventListener("click", (e) => {
  localStorage.removeItem("jobs-data");
  location.href = "login.html";
});

/** get users list */

async function getUsers() {
  const response = await axios.post(
    "http://localhost:8080/admin/users?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );
  if (response.data.error) {
    console.log("Error : " + response.data.error);
  } else {
    //console.log(response.data)
    document.getElementById("users").classList.remove("d-none");
    displayUsers(response.data);
  }
}

/** display users in table */

function displayUsers(users) {
  if (!users.length) {
    console.log("Error to display users into table");
    return;
  }

  // first clear the users stale body
  document.getElementById("users-body").innerHTML = "";

  users.forEach(async (user) => {
    /** check status of user */

    const response = await axios.get(
      "http://localhost:8080/user/" +
        user._id.toString() +
        "/pendingjob?token=" +
        JSON.parse(localStorage.getItem("jobs-data")).token
    );

    /** add simuntaneously to users-body */
    document.getElementById("users-body").innerHTML += `
          <tr>
            <td>${user.fname} ${user.lname}</td>
            <td>${user.email}</td>
            <td>${response.data.length ? "online" : "offline"}</td>
            <td><button class="btn btn-md btn-primary" onclick="assignJob('${user._id.toString()}')">Assign Job</button></td>
            <td><button class="btn btn-md btn-success" onclick="userReport('${user._id.toString()}')">View Report</button></td>
            <td><button class="btn btn-md btn-danger" onclick="alert('Sorry, We can not give the permission to delete users over here...')">Remove User</button></td>
          </tr>
        `;
  });

  function removeUser(id) {
    alert("Sorry, We can not give the permission to delete users over here...");
  }

  // /** testing */
  // users.forEach(function(user) {
  //     /** check status of user */
  //   // let status = "offline" ;
  //    axios.post("http://localhost:8080/user/currentjob/"+user._id.toString()).then(response => {
  //     document.getElementById("users-body").innerHTML += `
  //     <tr>
  //       <td>${user.fname} ${user.lname}</td>
  //       <td>${user.email}</td>
  //       <td>${response.data.status}</td>
  //       <td><button onclick="assignJob('${user._id.toString()}')">Assign Job</button></td>
  //       <td><button onclick="userReport('${user._id.toString()}')">View Report</button></td>
  //       <td><button onclick="removeUser('${user._id.toString()}')">Remove User</button></td>
  //     </tr>
  //   ` ;
  //   console.log("run")
  //    }).catch(e => console.log("error "+e));
  //   //  console.log(response.data)
  //    // status = response.data.status ;

  //     /** add row to rows */

  // });
}

/** Assign a new Job */
async function assignJob(id) {
  const response = await axios.get(
    "http://localhost:8080/user/" +
      id +
      "/pendingjob?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );
  if (response.data.error) {
    console.log(response.data.error);
    document.getElementById("assign-job").classList.remove("d-none");
    document.getElementById("user_id").value = id;
    return;
  }

  if (response.data && response.data.length) {
    alert("Another Job is already in process..");
  } else {
    console.log(response.data);
    document.getElementById("assign-job").classList.remove("d-none");
    document.getElementById("user_id").value = id;
  }
}

/** get Jobs of user */
async function userReport(id) {
  const response = await axios.post(
    "http://localhost:8080/user/" +
      id +
      "/jobs?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );
  if (response.data.error) {
    return alert(response.data.error);
  }

  displayJobs(response.data);
}

/** Display Jobs */
function displayJobs(jobs) {
  if (!jobs.length) {
    console.log("Error to display jobs into table");
    alert("Error to display jobs into table");
    document.getElementById("jobs-body").innerHTML = "";
    return;
  }

  document.getElementById("jobs").classList.remove("d-none");

  let rows = "";

  jobs.forEach((job) => {
    const {
      _id,
      createdAt,
      customer_name,
      price,
      estimated_time,
      details,
      documents,
      completed,
    } = job;

    /** check the documents available or not */
    let doc = documents ? "download" : "Not Available";
    /** add row to rows */
    //     function calcWorkingHours(entry, exit){
    //         let ent_time = entry.split(':');
    //         let ext_time = exit.split(':');
    //         let time_diff ;

    //         if( (ext_time[1] - ent_time[1]) < 0){
    //               time_diff = `${ext_time[0] - ent_time[0] - 1} : ${60 + (ext_time[1] - ent_time[1])}` ;
    //              console.log(time_diff);
    //          }else{
    //               time_diff = `${ext_time[0] - ent_time[0] } : ${ext_time[1] - ent_time[1]}` ;
    //              console.log(time_diff);
    //          }

    //          return time_diff ;
    //     }

    //     // find breks hour
    //     function calcBreaks(breakson, breaksover){
    //         let breaks_on = breakson.split(':');
    //         let breks_over = breaksover.split(':');
    //         let breaks_hours ;

    //         if( (breks_over[1] - breaks_on[1]) < 0){
    //           breaks_hours = `${breks_over[0] - breaks_on[0] - 1} : ${60 + (breks_over[1] - breaks_on[1])}` ;
    //              console.log(breaks_hours);
    //         }else{
    //           breaks_hours = `${breks_over[0] - breaks_on[0] } : ${breks_over[1] - breaks_on[1]}` ;
    //          console.log(breaks_hours);
    //         }

    //       return breaks_hours ;
    //    }

    rows += `
          <tr>
            <td>${createdAt}</td>
            <td>${customer_name}</td>
            <td>${details}</td>
            <td>${estimated_time}</td>
            <td>${price}</td>
            <td>${completed ? "Done" : "Pending"}</td>
            <td><a class="btn btn-md btn-warning" href="http://localhost:8080/jobs/getdocument/${_id.toString()}">${doc}</a></td>
            <td><button class="btn btn-md btn-secondary" onclick="workReport('${_id.toString()}')">Work</button></td>
            <td><button class="btn btn-md btn-primary" onclick="editReport('${_id.toString()}', '${customer_name}', '${details}', '${estimated_time}', '${price}', '${completed}')">Edit</button></td>
            <td><button class="btn btn-md btn-info" onclick="uploadReport('${job._id.toString()}')">Upload</button></td>
            <td><button class="btn btn-md btn-danger" onclick="deleteReport('${job._id.toString()}')">Delete</button></td>
          </tr>
        `;
  });

  document.getElementById("jobs-body").innerHTML = rows;
}

/** Work Report */
async function workReport(job_id) {
  if (!job_id) {
    return alert("Don't have any job_id !");
  }

  const response = await axios.get(
    "http://localhost:8080/jobs/" +
      job_id +
      "/works?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );

  if (response.data.error) {
    return alert(response.data.error);
  }

  document.getElementById("works").classList.remove("d-none");

  // createdAt date, start, breaks on/off, end, break intrvl, total time, Notes , button--> edit , delete
  const works = response.data;

  let rows = ``;

  works.forEach((work) => {
    const { _id, createdAt, start, end, breaks, notes } = work;
    rows += `
        <tr>
        <td>${createdAt}</td>
        <td>${start || "-"}</td>
        <td>${breaks[0] || "-"} ${breaks[1] || "-"}</td>
        <td>${end || "-"}</td>
        <td>${
          start && end
            ? netWorkingHours(
                calcBreaks(breaks[0], breaks[1]),
                calcWorkingHours(start, end)
              )
            : "-"
        }</td>
        <td>${notes || "-"}</td>
        <td><button class="btn btn-md btn-success" onclick="editWork('${_id.toString()}','${start}','${
      breaks[0] || "-"
    }','${breaks[1] || "-"}','${end || "-"}','${notes || "-"}')">Edit</button>
        <button class="btn btn-md btn-danger" onclick="delWork('${_id.toString()}')">Delete</button></td>
      </tr>
        `;
  });

  document.getElementById("works-body").innerHTML = rows;
}

// calc breaks interval

// find breks hour
function calcBreaks(breakson, breaksover) {
  if ((!breakson, !breaksover)) {
    return "00:00";
  }

  let breaks_on = breakson.split(":");
  let breks_over = breaksover.split(":");
  let breaks_hours;

  if (breks_over[1] - breaks_on[1] < 0) {
    breaks_hours = `${breks_over[0] - breaks_on[0] - 1} : ${
      60 + (breks_over[1] - breaks_on[1])
    }`;
    console.log(breaks_hours);
  } else {
    breaks_hours = `${breks_over[0] - breaks_on[0]} : ${
      breks_over[1] - breaks_on[1]
    }`;
    console.log(breaks_hours);
  }

  return breaks_hours;
}

// calc total gross working hours
function calcWorkingHours(entry, exit) {
  let ent_time = entry.split(":");
  let ext_time = exit.split(":");
  let time_diff;

  if (ext_time[1] - ent_time[1] < 0) {
    time_diff = `${ext_time[0] - ent_time[0] - 1} : ${
      60 + (ext_time[1] - ent_time[1])
    }`;
    console.log(time_diff);
  } else {
    time_diff = `${ext_time[0] - ent_time[0]} : ${ext_time[1] - ent_time[1]}`;
    console.log(time_diff);
  }

  return time_diff;
}

// Total Net working hours
function netWorkingHours(breaks_diff, time_diff) {
  let break_time = breaks_diff.split(":");
  let work_time = time_diff.split(":");
  let net_work;

  if (work_time[1] - break_time[1] < 0) {
    net_work = `${work_time[0] - break_time[0] - 1} : ${
      60 + (work_time[1] - break_time[1])
    }`;
    console.log(net_work);
  } else {
    net_work = `${work_time[0] - break_time[0]} : ${
      work_time[1] - break_time[1]
    }`;
    console.log(net_work);
  }

  return net_work;
}

// Edit Work
function editWork(work_id, start, breakson, breaksover, end, notes) {
  console.log(arguments);
  // display edit work form for job //
  document.getElementById("edit-work").classList.remove("d-none");
  document.getElementById("work_id").value = work_id;
  document.getElementById("start").value = start;
  document.getElementById("breakson").value = breakson;
  document.getElementById("breaksover").value = breaksover;
  document.getElementById("end").value = end;
  document.getElementById("notes").value = notes;
  alert(" Internal Maintaince is in progress...");
}

// Delete Work
async function delWork(work_id) {
  if (!work_id) {
    return alert("please pass a valid work_id");
  }

  const response = await axios.delete(
    "http://localhost:8080/works/" +
      work_id +
      "?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );

  if (response.data.error) {
    return alert("something went wrong..");
  }

  alert("work deleted successfuly..");
  return location.reload();
}

/** Edit Report */
function editReport(
  job_id,
  customer_name,
  details,
  estimated_time,
  price,
  completed
) {
  console.log(job_id);
  // display edit form for job //
  document.getElementById("edit-job").classList.remove("d-none");
  document.getElementById("job_id").value = job_id;

  document.querySelector("#edit_customer_name").value = customer_name;
  document.querySelector("#edit_price").value = price;
  document.querySelector("#edit_estimated_time").value = estimated_time;
  document.querySelector("#edit_details").value = details;
  document.querySelector("#edit_completed").checked =
    completed == "done" ? true : false;
  // create completed radio button
}

/** Upload Report */
function uploadReport(id) {
  // display edit form for job //
  document.getElementById("upload-documents").classList.remove("d-none");
  // console.log(JSON.parse(job).id)
  document.getElementById("upload-id").value = id;
}

/** delete report */
async function deleteReport(id) {
  if (!id) {
    return alert("please pass the job_id to delete");
  }

  const response = await axios.delete(
    "http://localhost:8080/jobs/" +
      id +
      "?token=" +
      JSON.parse(localStorage.getItem("jobs-data")).token
  );
  if (response.data.error) {
    return alert("something went wrong..");
  }

  alert("successfully deleted");
  return location.reload();
}

document.getElementById("users-btn").addEventListener("click", () => {
  getUsers();
});

/** UI class */
class UI {
  static showNotification(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className} mt-3`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const form = document.querySelector("#user-form");
    container.insertBefore(div, form);

    // remove not in 3 seconds
    setTimeout(() => document.querySelector(".alert").remove(), 3000);
  }

  // clear fields method
  static clearFileds(...fields) {
    fields.length &&
      fields.forEach(
        (field) => (document.querySelector(`#${field}`).value = "")
      );
  }
}

document.getElementById("edit-job-form") &&
  document
    .getElementById("edit-job-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const customer_name = document.querySelector("#edit_customer_name").value;
      const price = document.querySelector("#edit_price").value;
      const estimated_time = document.querySelector("#edit_estimated_time")
        .value;
      const details = document.querySelector("#edit_details").value;
      const job_id = document.getElementById("job_id").value;
      const completed = document.getElementById("edit_completed").checked
        ? true
        : false;
      console.log("works");

      console.log(
        completed,
        job_id,
        details,
        estimated_time,
        price,
        customer_name
      );

      // Validate
      if (details === "" || customer_name === "" || price === "") {
        UI.showNotification("All fields are required!", "danger");
      } else {
        const response = await axios.put(
          "http://localhost:8080/jobs/" +
            job_id +
            "/edit?token=" +
            JSON.parse(localStorage.getItem("jobs-data")).token,
          {
            customer_name,
            price,
            estimated_time,
            details,
            completed,
          }
        );

        console.log(response.data);
        if (response.data.error) {
          console.log(response.data.error);
        } else {
          alert("job updated");
          UI.showNotification("Your Job is Successfully Updated !", "success");
          UI.clearFileds(
            "edit_customer_name",
            "edit_price",
            "edit_estimated_time",
            "edit_details",
            "job_id"
          );
        }

        //  hide edit form for job //
        document.getElementById("edit-job").classList.add("d-none");
        document.getElementById("jobs").classList.add("d-none");
      }
    });

document.getElementById("assign-job-form") &&
  document
    .getElementById("assign-job-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const customer_name = document.querySelector("#customer_name").value;
      const price = document.querySelector("#price").value;
      const estimated_time = document.querySelector("#estimated_time").value;
      const details = document.querySelector("#details").value;
      const user_id = document.getElementById("user_id").value;

      console.log("job assign processing..");

      // Validate
      if (
        details === "" ||
        price === "" ||
        estimated_time === "" ||
        customer_name === ""
      ) {
        UI.showNotification("All fields are required!", "danger");
        console.log("if exec");
      } else {
        const response = await axios.post(
          "http://localhost:8080/user/" +
            user_id +
            "/assignjob?token=" +
            JSON.parse(localStorage.getItem("jobs-data")).token,
          {
            customer_name,
            price,
            estimated_time,
            details,
          }
        );
        //console.log("else exec");

        console.log(response.data);
        if (response.data.error) {
          console.log(response.data.error);
          document.getElementById("assign-job").classList.add("d-none");
        } else {
          console.log("job Assigned");
          UI.showNotification("Your Job is Successfully Assigned !", "success");
          UI.clearFileds(
            "customer_name",
            "estimated_time",
            "price",
            "user_id",
            "details"
          );

          //  userReport(user_id);

          //  hide edit form for job //
          document.getElementById("assign-job").classList.add("d-none");
        }
      }
    });

/** Edit Work form submission */
document
  .getElementById("edit-work-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const start = document.querySelector("#start").value;
    const end = document.querySelector("#end").value;
    const breakson = document.querySelector("#breakson").value;
    const breaksover = document.querySelector("#breaksover").value;
    const breaks = [breakson, breaksover];
    const notes = document.querySelector("#notes").value;
    const work_id = document.getElementById("work_id").value;

    if (!work_id) {
      document.getElementById("edit-work").classList.add("d-none");
      return alert("Work ID is not found");
    }

    const response = await axios.put(
      "http://localhost:8080/works/" +
        work_id +
        "/edit?token=" +
        JSON.parse(localStorage.getItem("jobs-data")).token,
      {
        start,
        end,
        breaks,
        notes,
      }
    );

    if (response.data.error) {
      alert("something went wrong ..");
      console.log("something went wrong");
    } else {
      alert("work update successfully");
    }

    document.getElementById("edit-work").classList.add("d-none");
  });

/** Admin.html specific task */

document.getElementById("close-assign-job-form") &&
  document
    .getElementById("close-assign-job-form")
    .addEventListener("click", (e) => {
      document.getElementById("assign-job").classList.add("d-none");
    });

document.getElementById("close-edit-job-form") &&
  document
    .getElementById("close-edit-job-form")
    .addEventListener("click", () => {
      document.getElementById("edit-job").classList.add("d-none");
    });

document
  .getElementById("close-edit-work-form")
  .addEventListener("click", () => {
    document.getElementById("edit-work").classList.add("d-none");
  });

document.getElementById("close-upload-form").addEventListener("click", () => {
  document.getElementById("upload-documents").classList.add("d-none");
});
