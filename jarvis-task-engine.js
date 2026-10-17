import { auth, db, onAuthStateChanged, signOut } from "./firebase.js";
import {
  addDoc, collection, deleteDoc, doc, limit, onSnapshot, query,
  serverTimestamp, updateDoc, where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const $ = (id) => document.getElementById(id);
const validStatuses = ["queued", "in_progress", "completed", "failed"];
let stopTasks = null;
let tasks = [];
let currentUser = null;

function setError(message = "") { $("globalError").textContent = message; }
function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
function showMessage(message, isError = false) {
  $("formMessage").textContent = message;
  $("formMessage").className = isError ? "small error" : "small success";
}
function readableDate(value) {
  if (!value || typeof value.toDate !== "function") return "Just now";
  return value.toDate().toLocaleString();
}
function render() {
  $("countAll").textContent = String(tasks.length);
  $("countActive").textContent = String(tasks.filter(t => t.status === "in_progress").length);
  $("countDone").textContent = String(tasks.filter(t => t.status === "completed").length);
  const filter = $("filter").value;
  const visible = tasks.filter(t => filter === "all" || t.status === filter);
  const box = $("taskList");
  if (!visible.length) {
    box.innerHTML = '<div class="empty">No tasks here yet. Add your first task above.</div>';
    return;
  }
  box.innerHTML = visible.map(task => {
    const title = escapeHTML(task.title);
    const description = escapeHTML(task.description || "");
    const status = validStatuses.includes(task.status) ? task.status : "queued";
    const priority = ["low", "normal", "high"].includes(task.priority) ? task.priority : "normal";
    const nextOptions = validStatuses.filter(s => s !== status).map(s =>
      '<option value="' + s + '"' + (s === status ? " selected" : "") + ">" +
      ({queued:"Queued",in_progress:"In progress",completed:"Completed",failed:"Failed"}[s]) +
      "</option>").join("");
    return '<article class="task" data-task-id="' + escapeHTML(task.id) + '">' +
      '<div class="tasktop"><div><h3>' + title + '</h3>' +
      (description ? '<p class="muted small">' + description + '</p>' : "") +
      '<p class="muted small">Created: ' + escapeHTML(readableDate(task.createdAt)) + '</p></div>' +
      '<div><span class="pill ' + status + '">' + status.replace("_"," ") + '</span> ' +
      '<span class="pill">' + priority + '</span></div></div>' +
      '<div class="task-actions"><label class="small" for="status-' + escapeHTML(task.id) + '">Status</label>' +
      '<select class="field status-select" id="status-' + escapeHTML(task.id) + '" style="width:auto;min-width:145px;margin:0" aria-label="Task status">' +
      '<option value="queued"' + (status==="queued"?" selected":"") + '>Queued</option>' +
      '<option value="in_progress"' + (status==="in_progress"?" selected":"") + '>In progress</option>' +
      '<option value="completed"' + (status==="completed"?" selected":"") + '>Completed</option>' +
      '<option value="failed"' + (status==="failed"?" selected":"") + '>Failed</option></select>' +
      '<button class="btn delete-task" type="button">Delete</button></div></article>';
  }).join("");
}
async function createTask(event) {
  event.preventDefault();
  if (!currentUser) return showMessage("Sign in first.", true);
  const title = $("title").value.trim();
  const description = $("description").value.trim();
  const priority = $("priority").value;
  if (!title || title.length > 120) return showMessage("Enter a title up to 120 characters.", true);
  $("createTask").disabled = true;
  try {
    await addDoc(collection(db, "tasks"), {
      ownerUid: currentUser.uid,
      title,
      description,
      priority: ["low","normal","high"].includes(priority) ? priority : "normal",
      status: "queued",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      completedAt: null
    });
    $("taskForm").reset();
    showMessage("Task added.");
  } catch (error) {
    showMessage("Could not save task. Check Firebase setup and Firestore Rules.", true);
    setError(error?.message || String(error));
  } finally {
    $("createTask").disabled = false;
  }
}
async function handleTaskAction(event) {
  const card = event.target.closest("[data-task-id]");
  if (!card || !currentUser) return;
  const id = card.dataset.taskId;
  try {
    if (event.target.matches(".status-select")) {
      const status = event.target.value;
      if (!validStatuses.includes(status)) throw new Error("Invalid task status.");
      await updateDoc(doc(db, "tasks", id), {
        status,
        updatedAt: serverTimestamp(),
        completedAt: status === "completed" ? serverTimestamp() : null
      });
    } else if (event.target.matches(".delete-task")) {
      if (!confirm("Delete this task? This cannot be undone.")) return;
      await deleteDoc(doc(db, "tasks", id));
    }
  } catch (error) {
    setError("Task action failed: " + (error?.message || String(error)));
  }
}
$("taskForm").addEventListener("submit", createTask);
$("taskList").addEventListener("change", handleTaskAction);
$("taskList").addEventListener("click", handleTaskAction);
$("filter").addEventListener("change", render);
$("signOut").addEventListener("click", async () => {
  try { await signOut(auth); } catch (error) { setError(error?.message || String(error)); }
});
onAuthStateChanged(auth, user => {
  currentUser = user;
  setError("");
  $("signedOut").classList.toggle("hidden", Boolean(user));
  $("appArea").classList.toggle("hidden", !user);
  $("signOut").classList.toggle("hidden", !user);
  if (stopTasks) { stopTasks(); stopTasks = null; }
  tasks = [];
  if (!user) {
    $("connection").textContent = "Sign in required.";
    $("connection").className = "muted";
    return;
  }
  $("connection").textContent = "Signed in · connecting to Firestore…";
  $("connection").className = "muted";
  const tasksQuery = query(collection(db, "tasks"), where("ownerUid", "==", user.uid), limit(100));
  stopTasks = onSnapshot(tasksQuery, snapshot => {
    tasks = snapshot.docs.map(d => ({id:d.id, ...d.data()}));
    tasks.sort((a,b) => {
      const av = a.createdAt?.toMillis?.() || 0;
      const bv = b.createdAt?.toMillis?.() || 0;
      return bv-av;
    });
    $("connection").textContent = "Connected · tasks are syncing.";
    $("connection").className = "success";
    render();
  }, error => {
    $("connection").textContent = "Firestore connection needs attention.";
    $("connection").className = "error";
    setError(error?.message || String(error));
    $("taskList").innerHTML = '<div class="empty">Unable to load tasks. Check Firestore Rules and Firebase project setup.</div>';
  });
});
