const input = document.getElementById("task-input")
const select = document.getElementById("task-category")
const dateInput = document.getElementById("task-date")
const addBtn = document.getElementById("add-btn")
const list = document.getElementById("task-list")
const chips = document.getElementById("category-chips")
const sortAsc = document.getElementById("sort-asc")
const sortDesc = document.getElementById("sort-desc")
const sortDateAsc = document.getElementById("sort-date-asc")
const sortDateDesc = document.getElementById("sort-date-desc")

const store = {
  read(){ try{ return JSON.parse(localStorage.getItem("hero_tasks"))||[] }catch(e){ return [] } },
  write(data){ localStorage.setItem("hero_tasks", JSON.stringify(data)) },
  readPrefs(){ try{ return JSON.parse(localStorage.getItem("hero_prefs"))||{cat:"Todas",sort:"asc"} }catch(e){ return {cat:"Todas",sort:"asc"} } },
  writePrefs(p){ localStorage.setItem("hero_prefs", JSON.stringify(p)) }
}

let tasks = store.read()
let prefs = store.readPrefs()

function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36) }

function icon(name){
  if(name==="trash") return '<svg class="icon" viewBox="0 0 24 24"><path d="M9 3h6v2h5v2H4V5h5V3zm0 6h2v9H9V9zm4 0h2v9h-2V9z"/></svg>'
  if(name==="check") return '<svg class="icon" viewBox="0 0 24 24"><path d="M9 16.2 4.8 12 3.4 13.4 9 19l12-12-1.4-1.4z"/></svg>'
  if(name==="undo") return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.9 0 7 3.1 7 7 0 1.5-.5 2.9-1.2 4.1l2.1 2.1C20.9 18.6 22 16.4 22 14c0-5.5-4.5-10-10-10z"/></svg>'
  return ""
}

function badgeClass(cat){
  if(cat==="Trabalho Doméstico") return "badge domestico"
  if(cat==="Trabalho Formal") return "badge formal"
  if(cat==="Estudos") return "badge estudos"
  if(cat==="Hobbies") return "badge hobbies"
  return "badge"
}

function normalize(t){ return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase() }

function sortData(data, mode){
  if(mode==="asc"||mode==="desc"){
    return [...data].sort((a,b)=>{
      const A = normalize(a.text)
      const B = normalize(b.text)
      if(A<B) return mode==="asc"?-1:1
      if(A>B) return mode==="asc"?1:-1
      return 0
    })
  }
  if(mode==="date-asc"||mode==="date-desc"){
    return [...data].sort((a,b)=>{
      const A = a.date ? new Date(a.date).getTime() : 0
      const B = b.date ? new Date(b.date).getTime() : 0
      if(A<B) return mode==="date-asc"?-1:1
      if(A>B) return mode==="date-asc"?1:-1
      return 0
    })
  }
  return data
}

function render(){
  const data = tasks.filter(t=> prefs.cat==="Todas" ? true : t.category===prefs.cat)
  const sorted = sortData(data, prefs.sort)
  list.innerHTML = ""
  if(sorted.length===0){
    const li = document.createElement("li")
    li.className = "empty"
    li.textContent = "Nada por aqui, querida heroína. Adicione sua primeira tarefa."
    list.appendChild(li)
    return
  }
  sorted.forEach(t=>{
    const li = document.createElement("li")
    li.className = "task"
    const left = document.createElement("div")
    left.className = "meta"
    const name = document.createElement("span")
    name.className = "name"
    name.textContent = t.text
    const b = document.createElement("span")
    b.className = badgeClass(t.category)
    b.textContent = t.category
    left.appendChild(name)
    left.appendChild(b)
    if(t.date){
      const d = document.createElement("span")
      d.className = "date"
      d.textContent = "Prazo: " + t.date
      left.appendChild(d)
    }
    const actions = document.createElement("div")
    actions.className = "actions"
    const doneBtn = document.createElement("button")
    doneBtn.className = "icon-btn"
    doneBtn.innerHTML = t.done ? icon("undo") : icon("check")
    doneBtn.addEventListener("click",()=>toggleDone(t.id))
    const delBtn = document.createElement("button")
    delBtn.className = "icon-btn"
    delBtn.innerHTML = icon("trash")
    delBtn.addEventListener("click",()=>removeTask(t.id))
    actions.appendChild(doneBtn)
    actions.appendChild(delBtn)
    if(t.done){
      name.style.opacity = .55
      name.style.textDecoration = "line-through"
    }
    li.appendChild(left)
    li.appendChild(actions)
    list.appendChild(li)
  })
}

function addTask(){
  const text = input.value.trim()
  const category = select.value
  const date = dateInput.value
  if(!text) return
  const t = { id: uid(), text, category, date, done:false }
  tasks.push(t)
  store.write(tasks)
  input.value = ""
  dateInput.value = ""
  render()
}

function removeTask(id){
  tasks = tasks.filter(x=>x.id!==id)
  store.write(tasks)
  render()
}

function toggleDone(id){
  tasks = tasks.map(t=> t.id===id ? {...t, done: !t.done} : t)
  store.write(tasks)
  render()
}

addBtn.addEventListener("click", addTask)
input.addEventListener("keydown", e=>{ if(e.key==="Enter") addTask() })

sortAsc.addEventListener("click", ()=>{ prefs.sort="asc"; store.writePrefs(prefs); render() })
sortDesc.addEventListener("click", ()=>{ prefs.sort="desc"; store.writePrefs(prefs); render() })
sortDateAsc.addEventListener("click", ()=>{ prefs.sort="date-asc"; store.writePrefs(prefs); render() })
sortDateDesc.addEventListener("click", ()=>{ prefs.sort="date-desc"; store.writePrefs(prefs); render() })

chips.addEventListener("click", e=>{
  const btn = e.target.closest("button")
  if(!btn) return
  ;[...chips.children].forEach(c=>c.classList.remove("active"))
  btn.classList.add("active")
  prefs.cat = btn.dataset.cat
  store.writePrefs(prefs)
  render()
})

window.addEventListener("load", ()=>{
  const current = [...chips.children].find(c=>c.dataset.cat===prefs.cat) || chips.children[0]
  ;[...chips.children].forEach(c=>c.classList.remove("active"))
  current.classList.add("active")
  render()
})
