/** Validate Token */
if (localStorage.getItem("jobs-data")) {
  const token = JSON.parse(localStorage.getItem("jobs-data")).token;
  displayJobs(token);
} else {
  location.href = "login.html";
}

/** logout activity */
document.getElementById("logout").addEventListener("click", (e) => {
  localStorage.removeItem("jobs-data");
  location.href = "login.html";
});

/** display current  */
async function getCurrentWork(token) {
  // get pending Job
  const response = await axios.get(
    "http://localhost:8080/works/currentwork?token=" + token
  );
  console.log(response.data);

  if (response.data.error) {
    console.log(response);
    return alert("error " + response.data.error);
  }

  const { job, work } = response.data;
  //console.log(work);

  const { _id, customer_name, estimated_time, price, details } = job;

  const pending_job_div = `
     <h1>Customer : ${customer_name}</h1>
     <h3>Details : ${details}</h3>
     <h3>Price : ${price}</h3>
     <h3> Estimate Time : ${estimated_time}</h3>
   `;

  document.querySelector(".job-details").innerHTML = pending_job_div;

  // pending-job-work

  const response_of_works = await axios.get(
    "http://localhost:8080/jobs/" + _id + "/works?token=" + token
  );

  if (response_of_works.data.error) {
    console.log(response_of_works.data);
    //return alert("err : 47 " + response.data.error);
  } else {
    document.getElementById("current-works-table").classList.remove("d-none");

    // createdAt date, start, breaks on/off, end, break intrvl, total time, Notes , button--> edit , delete
    const works = response_of_works.data;

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
     </tr>
       `;
    });

    document.getElementById("current-works-body").innerHTML = rows;
  }

  // create or update work of current day.
  if (!work) {
    let create_work_btn = `<button class="btn btn-success start-btn" onclick="createWork('${_id}','${token}')" >Clock In</button>`;
    document.querySelector(".work-action").innerHTML = create_work_btn;
    return;
  }

  // break_on
  if (!work.breaks.length && !work.end) {
    let breaks_on = `${new Date().getHours()} : ${new Date().getMinutes()}`;

    let end = `${new Date().getHours()} : ${new Date().getMinutes()}`;

    document.querySelector(".work-action").innerHTML = `
      <button class="btn btn-info break-on-btn" onclick="updateWork('${work._id}','${token}','${breaks_on}')" >Break On</button>
      <button class="btn btn-danger end-btn" onclick="updateWork('${work._id}','${token}', '00:00', '00:00', '${end}')" >Clock out</button>
      `;
    return;
  }

  // break_over
  if (work.breaks.length && work.breaks.length < 2 && !work.end) {
    let breaks_over = `${new Date().getHours()} : ${new Date().getMinutes()}`;

    let end = `${new Date().getHours()} : ${new Date().getMinutes()}`;

    document.querySelector(".work-action").innerHTML = `
   <button class="btn btn-warning break-over-btn" onclick="updateWork('${work._id}','${token}','${work.breaks[0]}','${breaks_over}')" >Break Over</button>
   <button class="btn btn-danger end-btn" onclick="updateWork('${work._id}','${token}', '${work.breaks[0]}','${breaks_over}', '${end}')" >Clock out</button>
   `;
    return;
  }

  // end
  if (!work.hasOwnProperty("end")) {
    let end = `${new Date().getHours()} : ${new Date().getMinutes()}`;

    document.querySelector(".work-action").innerHTML = `
 <button class="btn btn-danger end-btn" onclick="updateWork('${work._id}','${token}','${work.breaks[0]}','${work.breaks[1]}', '${end}')" >Clock out</button>
 `;
  }
}

getCurrentWork(JSON.parse(localStorage.getItem("jobs-data")).token);

// create Work
async function createWork(job_id, token) {
  if (!job_id) {
    return alert("something went wrong..");
  }

  const response = await axios.post(
    "http://localhost:8080/works/creatework?token=" + token,
    {
      job_id,
      start: ` ${new Date().getHours()} : ${new Date().getMinutes()}`,
    }
  );

  if (response.data.error) {
    return alert(response.data.error);
  }

  document.querySelector(".work-action").innerHTML = "";

  getCurrentWork(token);
  location.reload();
}

// update Work
async function updateWork(work_id, token, ...works) {
  let body = {};
  if (!work_id) {
    return alert("something went wrong..");
  }

  console.log(works);
  if (works.length === 1) {
    body = {
      breaks: [`${new Date().getHours()} : ${new Date().getMinutes()}`],
    };
  } else if (works.length === 2) {
    body = {
      breaks: [
        works[0],
        `${new Date().getHours()} : ${new Date().getMinutes()}`,
      ],
    };
  } else if (works.length === 3) {
    body = {
      breaks: [works[0], works[1]],
      end: `${new Date().getHours()} : ${new Date().getMinutes()}`,
    };
  }

  console.log(body);

  const response = await axios.put(
    "http://localhost:8080/works/" + work_id + "/edit?token=" + token,
    {
      ...body,
    }
  );

  if (response.data.error) {
    return alert(response.data.error);
  }

  document.querySelector(".work-action").innerHTML = "";

  getCurrentWork(token);

  location.reload();
}

/** UI class */
class UI {
  static showNotification(message, className) {
    const div = document.createElement("div");
    div.className = `alert alert-${className}`;
    div.appendChild(document.createTextNode(message));
    const container = document.querySelector(".container");
    const form = document.querySelector("#user-form");
    container.insertBefore(div, form);

    // remove not in 3 seconds
    setTimeout(() => document.querySelector(".alert").remove(), 3000);
  }

  // clear fields method
  static clearFileds() {
    document.querySelector("#start").value = "";
    document.querySelector("#end").value = "";
    document.querySelector("#details").value = "";
    document.querySelector("#notes").value = "";
  }
}

async function deleteJob(id) {
  const response = await axios.delete("http://localhost:8080/jobs/" + id);

  if (response.data.error) {
    console.log("unable to delete job");
  } else {
    console.log("deleted job");
  }

  displayJobs(JSON.parse(localStorage.getItem("jobs-data")).token);
}

async function displayJobs(token) {
  const res = await axios.post(
    "http://localhost:8080/user/jobs?token=" + token
  );
  if (res.data.error) {
    console.log(res.data.error);
  } else {
    console.log(res.data);
    document.getElementById("jobs").classList.remove("d-none");
    let rows = "";
    res.data.forEach((job) => {
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
      let doc = documents ? "download" : "Not Available";

      rows += `
            <tr>
              <td>${createdAt}</td>
              <td>${customer_name}</td>
              <td>${details}</td>
              <td>${estimated_time}</td>
              <td>${price}</td>
              <td>${completed ? "Done" : "Pending"}</td>
              <td><a class="btn btn-info" href="http://localhost:8080/jobs/getdocument/${_id.toString()}">${doc}</a></td>
              <td><button class="btn btn-md btn-success" onclick="workReport('${_id.toString()}')">Work</button></td>
              <td><button class="btn btn-md btn-info"  onclick="uploadReport('${job._id.toString()}')">Upload</button></td>
            </tr>
          `;
    });

    document.getElementById("jobs-body").innerHTML = rows;
  }
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

  //console.log(response.data);

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
      </tr>
        `;
    /**
         * 
         * <td><button onclick="editWork('${_id.toString()}','${start}','${breaks[0] || '-'}','${breaks[1] || '-'}','${end || '-'}','${notes || '-'}')">Edit</button>
        <button onclick="delWork('${_id.toString()}')">Delete</button></td>
         */
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

/// ========= End Work Report ==============///

/** Upload Report */
function uploadReport(id) {
  // display edit form for job //
  document.getElementById("upload-documents").classList.remove("d-none");
  // console.log(JSON.parse(job).id)
  document.getElementById("upload-id").value = id;
}

/** close section event */
document.getElementById("close-upload-form").addEventListener("click", () => {
  document.getElementById("upload-documents").classList.add("d-none");
});
