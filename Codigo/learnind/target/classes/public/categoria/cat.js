// helper
function qs(sel){return document.querySelector(sel)}
function qsa(sel){return document.querySelectorAll(sel)}

const cards = qs('#cards');
const modal = qs('#modal');
const btnAdd = qs('#btn-add');
const modalTitle = qs('#modal-title');
const modalForm = qs('#modal-form');
const catIdInput = qs('#cat-id');
const catNomeInput = qs('#cat-nome');

async function loadCategories(){
  try{
    const res = await fetch('/categorias');
    if(!res.ok) throw new Error('Erro');
    const list = await res.json();
    render(list);
  }catch(e){
    cards.innerHTML = '<p>Erro ao carregar categorias.</p>';
  }
}

function render(list){
  cards.innerHTML = '';
  if(!list || list.length===0){
    cards.innerHTML = '<p>Nenhuma categoria cadastrada.</p>';
    return;
  }
  list.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'cat-card';
    div.innerHTML = `
      <h4>${escapeHtml(c.nome)}</h4>
      <div class="card-actions">
        <button class="btn purple small" data-id="${c.idCategoria}" data-name="${escapeHtml(c.nome)}" data-action="edit">Editar</button>
        <button class="btn danger small" data-id="${c.idCategoria}" data-action="delete">Deletar</button>
      </div>
    `;
    cards.appendChild(div);
  });
  // attach events
  qsa('.cat-card .btn').forEach(b=>{
    b.addEventListener('click', onCardAction);
  });
}

function onCardAction(e){
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if(action==='edit'){
    openEdit({id: id, nome: btn.dataset.name});
  } else if(action==='delete'){
    if(confirm('Deletar essa categoria?')) deleteCategory(id);
  }
}

function openAdd(){
  modalTitle.textContent = 'Adicionar Categoria';
  catIdInput.value = '';
  catNomeInput.value = '';
  showModal();
}

function openEdit(cat){
  modalTitle.textContent = 'Editar Categoria';
  catIdInput.value = cat.id;
  catNomeInput.value = cat.nome;
  showModal();
}

function showModal(){ modal.classList.remove('hidden'); }
function hideModal(){ modal.classList.add('hidden'); }

modalForm.addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const id = catIdInput.value;
  const nome = catNomeInput.value && catNomeInput.value.trim();
  if(!nome){ alert('Informe o nome'); return; }
  try{
    const params = new URLSearchParams();
    params.append('nome', nome);
    let url = '/categoria/add';
    if(id && id.length>0){ params.append('id', id); url = '/categoria/update'; }
    const res = await fetch(url, { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: params.toString() });
    if(!res.ok){ const txt = await res.text(); alert('Erro: '+txt); return; }
    hideModal();
    await loadCategories();
  }catch(e){ alert('Erro ao salvar'); }
});

qs('#modal-cancel').addEventListener('click', ()=>{ hideModal(); });
btnAdd.addEventListener('click', ()=> openAdd());

async function deleteCategory(id){
  try{
    const params = new URLSearchParams(); params.append('id', id);
    const res = await fetch('/categoria/delete', { method:'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: params.toString() });
    if(!res.ok){ const txt = await res.text(); alert('Erro: '+txt); return; }
    await loadCategories();
  }catch(e){ alert('Erro ao deletar'); }
}

function escapeHtml(str){ if(!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// init
loadCategories();

// set logo link depending on auth state (logged -> dashboard, else -> landing)
(async () => {
  try {
    const res = await fetch('/usuario/me', { credentials: 'same-origin' });
    const el = document.getElementById('logo-link');
    if (el) el.href = (res && res.ok) ? '/homePage/dashboard.html' : '/landPage/index.html';
  } catch (e) {
    const el = document.getElementById('logo-link');
    if (el) el.href = '/landPage/index.html';
  }
})();
