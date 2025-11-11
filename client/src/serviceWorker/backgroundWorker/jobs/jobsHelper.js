import { getUserData } from "../users/usersHelper.js";

// const API_BASE =
//   location.hostname === "localhost"
//     ? "http://localhost:8080/api"
//     : "https://jobtracker-backend-299028719782.australia-southeast1.run.app/api";


const API_BASE =  "https://jobtracker-backend-299028719782.australia-southeast1.run.app/api" //"http://localhost:8080/api";
//const API_BASE =  "http://localhost:8080/api";

export async function addJob(jobsData) {
  try {
    const userData = await getUserData();

    if (!userData?.token) {
      console.warn("❌ No auth token found — user might not be logged in");
      return { error: "Not authenticated" };
    }

    console.log("✅ Yes token exist, sending job to backend...");
    console.log("📦 Job payload:", jobsData);

    // Send job data to backend
    const response = await fetch(`${API_BASE}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify(jobsData),
    });

    // Parse response safely
    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend responded with error:", data);
      return { error: data.message || "Failed to add job" };
    }

    console.log("✅ Job successfully saved:", data);
    return data;
  } catch (err) {
    console.error("❌ Error adding job:", err);
    return { error: err.message };
  }
}


export async function fetchAllJobs() {
  try {
    const userData = await getUserData();

    if (!userData?.token) {
      console.warn("❌ No auth token found — user might not be logged in");
      return { error: "Not authenticated" };
    }

    console.log("🔍 Fetching all jobs for user:", userData.email);

    const response = await fetch(`${API_BASE}/jobs`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userData.token}`, // ✅ Correct header format
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Backend responded with error:", data);
      return { error: data.error || "Failed to fetch jobs" };
    }

    console.log("✅ Successfully fetched jobs:", data);
    return data; // backend should return an array or { jobs: [...] }
  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    return { error: err.message };
  }
}


// Single generic updater used by both helpers
async function updateJob({ id, updates }) {
  try {
    const userData = await getUserData();
    if (!userData?.token) {
      console.warn("❌ No auth token found — user might not be logged in");
      return { error: "Not authenticated" };
    }
    if (!id) {
      console.error("❌ Missing job ID for update");
      return { error: "Missing job ID" };
    }

    // Remove undefined fields so we only send what we intend to update
    const payload = Object.fromEntries(
      Object.entries(updates || {}).filter(([, v]) => v !== undefined)
    );

    console.log("🔧 PUT", `${API_BASE}/jobs/${id}`, payload);

    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      console.error("❌ Backend returned non-JSON:", text);
      return { error: "Backend returned invalid JSON" };
    }

    if (!res.ok) {
      console.error("❌ Backend error:", json);
      return { error: json.error || "Failed to update job" };
    }

    console.log("✅ Update OK:", json);
    return json;
  } catch (err) {
    console.error("❌ Error updating job:", err);
    return { error: err.message };
  }
}

export async function updateJobStatus({ id, newStatus, updatedDate }) {
  return updateJob({
    id,
    updates: {
      status: newStatus,
      ...(updatedDate ? { date: updatedDate } : {}),
    },
  });
}

export async function updateJobNotes({ id, notes, updatedDate }) {
  return updateJob({
    id,
    updates: {
      notes,
      ...(updatedDate ? { date: updatedDate } : {}),
    },
  });
}


export async function getAllJobsStatus(){
  try {
    const userData = await getUserData();

    if (!userData?.token) {
      console.warn("No auth token found — user might not be logged in");
      return { error: "Not authenticated" };
    }

    console.log("🔍 Fetching all jobs for Status:");

    const response = await fetch(`${API_BASE}/jobs/status`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userData.token}`, 
      },
    });

    const data = await response.json();
    console.log("From status all --------",data)

    if (!response.ok) {
      console.error("Backend responded with error:", data);
      return { error: data.error || "Failed to fetch jobs" };
    }

    console.log("Successfully fetched jobs staus:", data);
    return data; // backend should return an array or { jobs: [...] }
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return { error: err.message };
  }
}