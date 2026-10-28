// ========================================================
// 1. SELEÇÃO DE ELEMENTOS DO DOM
// ========================================================
const inputFotos = document.getElementById('imageInput');
const dropzone = document.getElementById('dropzone');
const listaImagens = document.getElementById('lista-imagens');
const btnAmostras = document.getElementById('btnAmostras');
const btnAbrirComandos = document.getElementById('btnAbrirComandos');

// Elementos da Barra de Comandos (Atividade 9)
const commandBarOverlay = document.getElementById('commandBarOverlay');
const commandInput = document.getElementById('commandInput');
const commandList = document.getElementById('commandList');

// ========================================================
// 2. DADOS DO PROJETO
// ========================================================
let listaFotos = []; // Array central: { url, legenda }
let itemArrastadoIndex = null;

// Lista de comandos como dados (Passo 1 da Atividade 9: 3 modos + 6 temas)
const comandosDisponiveis = [
  { id: 'mode-manual', texto: 'Change to manual mode', acao: () => console.log('Modo manual ativado') },
  { id: 'mode-auto', texto: 'Change to auto-playing mode', acao: () => console.log('Modo auto ativado') },
  { id: 'mode-random', texto: 'Change to random mode', acao: () => console.log('Modo aleatório ativado') },
  { id: 'theme-a', texto: 'Switch to theme A', acao: () => console.log('Tema A ativado') },
  { id: 'theme-b', texto: 'Switch to theme B', acao: () => console.log('Tema B ativado') },
  { id: 'theme-c', texto: 'Switch to theme C', acao: () => console.log('Tema C ativado') },
  { id: 'theme-d', texto: 'Switch to theme D', acao: () => console.log('Tema D ativado') },
  { id: 'theme-e', texto: 'Switch to theme E', acao: () => console.log('Tema E ativado') },
  { id: 'theme-f', texto: 'Switch to theme F', acao: () => console.log('Tema F ativado') }
];

let comandosFiltrados = [...comandosDisponiveis];
let indiceSelecionado = 0;
let elementoFocoAnterior = null; // Para restaurar o foco ao fechar (Passo 11)

// ========================================================
// 3. FORMATAÇÃO DE LEGENDA (Atividade 7)
// ========================================================
function formatarLegenda(nomeArquivo) {
  const ultimoPonto = nomeArquivo.lastIndexOf('.');
  const semExtensao = ultimoPonto !== -1 ? nomeArquivo.slice(0, ultimoPonto) : nomeArquivo;
  const comEspacos = semExtensao.replace(/[-_]/g, ' ');

  return comEspacos
    .split(' ')
    .filter(palavra => palavra.length > 0)
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase())
    .join(' ');
}

// ========================================================
// 4. RENDERIZAÇÃO E REORDENAÇÃO DAS FOTOS (Atividades 7 e 8)
// ========================================================
function renderizarLista() {
  listaImagens.innerHTML = '';

  listaFotos.forEach((foto, index) => {
    const item = document.createElement('li');
    const img = document.createElement('img');
    const legenda = document.createElement('span');

    img.src = foto.url;
    img.alt = foto.legenda;
    legenda.textContent = foto.legenda;

    item.draggable = true;
    item.dataset.index = index;

    item.addEventListener('dragstart', (e) => {
      itemArrastadoIndex = index;
      e.dataTransfer.effectAllowed = 'move';
      setTimeout(() => item.classList.add('arrastando'), 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('arrastando');
      document.querySelectorAll('#lista-imagens li').forEach(el => {
        el.classList.remove('inserir-antes', 'inserir-depois');
      });
      itemArrastadoIndex = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';

      if (itemArrastadoIndex === null || itemArrastadoIndex === index) return;

      const rect = item.getBoundingClientRect();
      const meioHorizontal = rect.left + rect.width / 2;

      item.classList.remove('inserir-antes', 'inserir-depois');
      if (e.clientX < meioHorizontal) {
        item.classList.add('inserir-antes');
      } else {
        item.classList.add('inserir-depois');
      }
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('inserir-antes', 'inserir-depois');
    });

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('inserir-antes', 'inserir-depois');

      if (itemArrastadoIndex === null || itemArrastadoIndex === index) return;

      const rect = item.getBoundingClientRect();
      const meioHorizontal = rect.left + rect.width / 2;
      const soltouAntes = e.clientX < meioHorizontal;

      const [itemMovido] = listaFotos.splice(itemArrastadoIndex, 1);

      let indiceDestino = index;
      if (itemArrastadoIndex < index) {
        indiceDestino = soltouAntes ? index - 1 : index;
      } else {
        indiceDestino = soltouAntes ? index : index + 1;
      }

      indiceDestino = Math.max(0, Math.min(indiceDestino, listaFotos.length));
      listaFotos.splice(indiceDestino, 0, itemMovido);
      renderizarLista();
    });

    item.appendChild(img);
    item.appendChild(legenda);
    listaImagens.appendChild(item);
  });
}

function processarArquivos(listaArquivos) {
  for (const arquivo of listaArquivos) {
    if (!arquivo.type.startsWith('image/')) continue;

    const urlFoto = URL.createObjectURL(arquivo);
    const legendaFormatada = formatarLegenda(arquivo.name);

    listaFotos.push({
      url: urlFoto,
      legenda: legendaFormatada
    });
  }
  renderizarLista();
}

inputFotos.addEventListener('change', (e) => {
  if (e.target.files && e.target.files.length > 0) {
    processarArquivos(e.target.files);
  }
});

dropzone.addEventListener('dragover', (e) => e.preventDefault());
dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropzone.classList.add('ativa');
});
dropzone.addEventListener('dragleave', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ativa');
});
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('ativa');
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    processarArquivos(e.dataTransfer.files);
  }
});

btnAmostras.addEventListener('click', () => {
  const fotosAmostra = ['hello.jpg', 'hello world.jpg', 'a-sample-photo.jpg'];
  fotosAmostra.forEach((caminho) => {
    const nome = caminho.split('/').pop();
    listaFotos.push({
      url: caminho,
      legenda: formatarLegenda(nome)
    });
  });
  renderizarLista();
});

// ========================================================
// 5. BARRA DE COMANDOS (Atividade 9)
// ========================================================

/**
 * Desenha a lista de comandos e atualiza o estado visual
 */
function renderizarComandos(lista) {
  commandList.innerHTML = '';
  comandosFiltrados = lista;

  if (lista.length === 0) {
    const liVazio = document.createElement('li');
    liVazio.textContent = 'Nenhum comando encontrado';
    liVazio.style.color = '#a0aec0';
    liVazio.style.cursor = 'default';
    commandList.appendChild(liVazio);
    return;
  }

  if (indiceSelecionado >= lista.length) {
    indiceSelecionado = 0;
  }

  lista.forEach((comando, idx) => {
    const li = document.createElement('li');
    li.textContent = comando.texto;
    li.setAttribute('role', 'option');

    // Destaque visual da opção selecionada (Passo 7)
    if (idx === indiceSelecionado) {
      li.classList.add('selecionado');
      li.setAttribute('aria-selected', 'true');
      li.scrollIntoView({ block: 'nearest' });
    } else {
      li.setAttribute('aria-selected', 'false');
    }

    li.addEventListener('mouseenter', () => {
      indiceSelecionado = idx;
      atualizarDestaqueVisual();
    });

    li.addEventListener('click', () => {
      executarComandoAtual();
    });

    commandList.appendChild(li);
  });
}

function atualizarDestaqueVisual() {
  const itens = commandList.querySelectorAll('li[role="option"]');
  itens.forEach((li, idx) => {
    if (idx === indiceSelecionado) {
      li.classList.add('selecionado');
      li.setAttribute('aria-selected', 'true');
      li.scrollIntoView({ block: 'nearest' });
    } else {
      li.classList.remove('selecionado');
      li.setAttribute('aria-selected', 'false');
    }
  });
}

function executarComandoAtual() {
  if (comandosFiltrados.length > 0 && comandosFiltrados[indiceSelecionado]) {
    comandosFiltrados[indiceSelecionado].acao();
    fecharBarraComandos();
  }
}

function abrirBarraComandos() {
  elementoFocoAnterior = document.activeElement; // Salva para restaurar foco (Passo 11)
  commandBarOverlay.classList.remove('hidden');
  commandInput.value = '';
  indiceSelecionado = 0;
  renderizarComandos(comandosDisponiveis); // Mostra os 9 comandos ao abrir (Passo 6)
  commandInput.focus();
}

function fecharBarraComandos() {
  commandBarOverlay.classList.add('hidden');
  if (elementoFocoAnterior) {
    elementoFocoAnterior.focus(); // Restaura foco original (Passo 11)
  }
}

// Botão na tela para abrir também por clique
if (btnAbrirComandos) {
  btnAbrirComandos.addEventListener('click', abrirBarraComandos);
}

// Fechar ao clicar no fundo escuro fora da caixa
commandBarOverlay.addEventListener('click', (e) => {
  if (e.target === commandBarOverlay) {
    fecharBarraComandos();
  }
});

// Filtro em tempo real ao digitar (Passo 9)
commandInput.addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase().trim();
  const filtrados = comandosDisponiveis.filter(cmd =>
    cmd.texto.toLowerCase().includes(termo)
  );
  indiceSelecionado = 0;
  renderizarComandos(filtrados);
});

// Navegação por teclado: setas ↑ / ↓ e Enter (Passos 7 e 10)
commandInput.addEventListener('keydown', (e) => {
  if (comandosFiltrados.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    indiceSelecionado = (indiceSelecionado + 1) % comandosFiltrados.length;
    atualizarDestaqueVisual();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    indiceSelecionado = (indiceSelecionado - 1 + comandosFiltrados.length) % comandosFiltrados.length;
    atualizarDestaqueVisual();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executarComandoAtual();
  }
});

// Atalhos globais no teclado: Ctrl+K, / e Esc (Passos 4, 5 e 10)
window.addEventListener('keydown', (e) => {
  const barraAberta = !commandBarOverlay.classList.contains('hidden');

  // Esc fecha sem executar (Passo 10)
  if (barraAberta && e.key === 'Escape') {
    e.preventDefault();
    fecharBarraComandos();
    return;
  }

  // Ctrl+K ou Cmd+K abre/fecha impedindo o atalho do navegador (Passo 4)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (barraAberta) {
      fecharBarraComandos();
    } else {
      abrirBarraComandos();
    }
    return;
  }

  // Tecla '/' abre quando a barra está fechada (Passo 5)
  if (!barraAberta && e.key === '/') {
    const tagAtiva = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tagAtiva === 'input' || tagAtiva === 'textarea') {
      return; // Permite digitar a barra se o usuário já estiver escrevendo em outro campo
    }
    e.preventDefault(); // Impede a barra de aparecer digitada no input
    abrirBarraComandos();
  }
});