// ========================================================
// 1. SELEÇÃO DE ELEMENTOS DO DOM
// ========================================================
const inputFotos = document.getElementById('imageInput');
const dropzone = document.getElementById('dropzone');
const listaImagens = document.getElementById('lista-imagens');
const btnAmostras = document.getElementById('btnAmostras');
const btnAbrirComandos = document.getElementById('btnAbrirComandos');
const btnIniciarSlideshow = document.getElementById('btnIniciarSlideshow');

// Elementos da Barra de Comandos (Atividade 9)
const commandBarOverlay = document.getElementById('commandBarOverlay');
const commandInput = document.getElementById('commandInput');
const commandList = document.getElementById('commandList');

// Elementos do Reprodutor de Slideshow (Atividade 10)
const slideshowContainer = document.getElementById('slideshowContainer');
const slideStage = document.getElementById('slideStage');
const slideContent = document.getElementById('slideContent');
const slideImage = document.getElementById('slideImage');
const slideCaption = document.getElementById('slideCaption');
const playerCounter = document.getElementById('playerCounter');
const playerMode = document.getElementById('playerMode');
const btnFullscreen = document.getElementById('btnFullscreen');
const btnSairSlideshow = document.getElementById('btnSairSlideshow');

// ========================================================
// 2. ESTADO CENTRAL DA APLICAÇÃO (Passo 1 do Guia)
// ========================================================
let listaFotos = []; // Guarda: [{ url, legenda }, ...]
let itemArrastadoIndex = null;

// Variáveis de estado do reprodutor
let indiceFotoAtual = 0;
let modoAtual = 'manual'; // 'manual', 'auto' ou 'random'
let temaAtual = 'theme-a'; // 'theme-a' ou 'theme-b'
let temporizadorSlideshow = null; // Instância única do setInterval
let slideshowAtivo = false;

// Variáveis de estado da barra de comandos
let comandosFiltrados = [];
let indiceSelecionado = 0;
let elementoFocoAnterior = null;

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
// 4. RENDERIZAÇÃO E REORDENAÇÃO DA GALERIA (Atividades 7 e 8)
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
// 5. MOTOR DO REPRODUTOR DE SLIDESHOW (Passos 3, 4, 8, 9 e 12)
// ========================================================

/**
 * Exibe a foto atual no palco e aplica o reflow da animação
 */
function exibirSlide(indice) {
  if (listaFotos.length === 0) return;

  indiceFotoAtual = indice;
  const foto = listaFotos[indiceFotoAtual];

  slideImage.src = foto.url;
  slideImage.alt = foto.legenda;
  slideCaption.textContent = foto.legenda;

  playerCounter.textContent = `Slide ${indiceFotoAtual + 1} de ${listaFotos.length}`;

  // Força o reinício da animação CSS no Tema B
  slideContent.classList.remove('slide-animar');
  void slideContent.offsetWidth; // Força reflow no navegador
  slideContent.classList.add('slide-animar');
}

/**
 * Avança a apresentação respeitando os modos de reprodução
 */
function avancarSlide() {
  if (listaFotos.length === 0) return;

  if (modoAtual === 'random') {
    // Sorteia uma nova foto sem repetir a atual
    if (listaFotos.length === 1) {
      exibirSlide(0);
      return;
    }
    let novoIndice;
    do {
      novoIndice = Math.floor(Math.random() * listaFotos.length);
    } while (novoIndice === indiceFotoAtual);
    exibirSlide(novoIndice);
  } else {
    // Modo manual e automático
    if (indiceFotoAtual < listaFotos.length - 1) {
      exibirSlide(indiceFotoAtual + 1);
    } else {
      if (modoAtual === 'auto') {
        exibirSlide(0); // Volta ao início no modo automático
      }
    }
  }
}

/**
 * Recua o slide atual
 */
function voltarSlide() {
  if (listaFotos.length === 0) return;

  if (indiceFotoAtual > 0) {
    exibirSlide(indiceFotoAtual - 1);
  }
}

/**
 * Cancela e renova temporizadores sem concorrência
 */
function atualizarTemporizadorModo() {
  if (temporizadorSlideshow) {
    clearInterval(temporizadorSlideshow);
    temporizadorSlideshow = null;
  }

  if (modoAtual === 'auto' || modoAtual === 'random') {
    temporizadorSlideshow = setInterval(() => {
      if (slideshowAtivo) {
        avancarSlide();
      }
    }, 3500);
  }
}

/**
 * Altera o modo de reprodução
 */
function definirModo(novoModo) {
  modoAtual = novoModo;
  if (playerMode) {
    const legendas = {
      manual: 'Modo: Manual (Setas ← / →)',
      auto: 'Modo: Automático (Avança sozinho)',
      random: 'Modo: Aleatório (Sem repetição)'
    };
    playerMode.textContent = legendas[novoModo] || novoModo;
  }
  atualizarTemporizadorModo();
  console.log(`Modo alterado: ${novoModo}`);
}

/**
 * Altera o tema visual no elemento principal
 */
function definirTema(novoTema) {
  temaAtual = novoTema;
  slideStage.className = `slide-stage ${novoTema}`;
  if (slideshowAtivo) {
    exibirSlide(indiceFotoAtual);
  }
  console.log(`Tema alterado: ${novoTema}`);
}

/**
 * Inicia a exibição dos slides
 */
function iniciarSlideshow() {
  if (listaFotos.length === 0) {
    alert('Adicione ou carregue fotos antes de iniciar a apresentação!');
    return;
  }

  slideshowAtivo = true;
  slideshowContainer.classList.remove('hidden');
  exibirSlide(0);
  atualizarTemporizadorModo();
}

/**
 * Encerra a exibição dos slides
 */
function fecharSlideshow() {
  slideshowAtivo = false;
  slideshowContainer.classList.add('hidden');
  if (temporizadorSlideshow) {
    clearInterval(temporizadorSlideshow);
    temporizadorSlideshow = null;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
}

/**
 * Alterna modo de tela cheia
 */
function alternarTelaCheia() {
  if (!document.fullscreenElement) {
    slideshowContainer.requestFullscreen().catch(err => {
      console.warn(`Erro no modo de tela cheia: ${err.message}`);
    });
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

btnIniciarSlideshow.addEventListener('click', iniciarSlideshow);
btnSairSlideshow.addEventListener('click', fecharSlideshow);
btnFullscreen.addEventListener('click', alternarTelaCheia);

// ========================================================
// 6. LIGAÇÃO COM A BARRA DE COMANDOS (Passo 11)
// ========================================================
const comandosDisponiveis = [
  { id: 'mode-manual', texto: 'Change to manual mode', acao: () => definirModo('manual') },
  { id: 'mode-auto', texto: 'Change to auto-playing mode', acao: () => definirModo('auto') },
  { id: 'mode-random', texto: 'Change to random mode', acao: () => definirModo('random') },
  { id: 'theme-a', texto: 'Switch to theme A', acao: () => definirTema('theme-a') },
  { id: 'theme-b', texto: 'Switch to theme B', acao: () => definirTema('theme-b') },
  { id: 'theme-c', texto: 'Switch to theme C', acao: () => definirTema('theme-a') },
  { id: 'theme-d', texto: 'Switch to theme D', acao: () => definirTema('theme-b') },
  { id: 'theme-e', texto: 'Switch to theme E', acao: () => definirTema('theme-a') },
  { id: 'theme-f', texto: 'Switch to theme F', acao: () => definirTema('theme-b') }
];

comandosFiltrados = [...comandosDisponiveis];

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
  elementoFocoAnterior = document.activeElement;
  commandBarOverlay.classList.remove('hidden');
  commandInput.value = '';
  indiceSelecionado = 0;
  renderizarComandos(comandosDisponiveis);
  commandInput.focus();
}

function fecharBarraComandos() {
  commandBarOverlay.classList.add('hidden');
  if (elementoFocoAnterior) {
    elementoFocoAnterior.focus();
  }
}

btnAbrirComandos.addEventListener('click', abrirBarraComandos);

commandBarOverlay.addEventListener('click', (e) => {
  if (e.target === commandBarOverlay) {
    fecharBarraComandos();
  }
});

commandInput.addEventListener('input', (e) => {
  const termo = e.target.value.toLowerCase().trim();
  const filtrados = comandosDisponiveis.filter(cmd =>
    cmd.texto.toLowerCase().includes(termo)
  );
  indiceSelecionado = 0;
  renderizarComandos(filtrados);
});

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

// ========================================================
// 7. TECLADO GLOBAL: NAVEGAÇÃO DO SLIDESHOW E ATALHOS
// ========================================================
window.addEventListener('keydown', (e) => {
  const barraAberta = !commandBarOverlay.classList.contains('hidden');

  // Fechar com Escape
  if (e.key === 'Escape') {
    if (barraAberta) {
      e.preventDefault();
      fecharBarraComandos();
      return;
    }
    if (slideshowAtivo) {
      fecharSlideshow();
      return;
    }
  }

  // Atalho Ctrl+K ou Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (barraAberta) fecharBarraComandos();
    else abrirBarraComandos();
    return;
  }

  // Atalho '/'
  if (!barraAberta && e.key === '/') {
    const tagAtiva = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    if (tagAtiva === 'input' || tagAtiva === 'textarea') return;
    e.preventDefault();
    abrirBarraComandos();
    return;
  }

  // Setas de direção durante a exibição de slides
  if (slideshowAtivo && !barraAberta) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      avancarSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      voltarSlide();
    }
  }
});
