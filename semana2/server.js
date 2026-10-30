import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORTA = 3000;

// Entrega os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Função que lê a pasta física de forma segura
async function listarDiretorio(caminhoSubpasta = '') {
  const raizSegura = path.resolve(__dirname, 'content-pages');
  const caminhoAlvo = path.resolve(raizSegura, caminhoSubpasta);

  // Bloqueio de segurança contra ../
  if (!caminhoAlvo.startsWith(raizSegura)) {
    const erroSeguranca = new Error('Acesso Proibido');
    erroSeguranca.code = 'FORBIDDEN';
    throw erroSeguranca;
  }

  // Lê a pasta física identificando se cada item é arquivo ou diretório
  const itens = await fs.readdir(caminhoAlvo, { withFileTypes: true });

  const subpastas = [];
  const arquivos = [];

  for (const item of itens) {
    if (item.isDirectory()) {
      // Ignora a pasta images conforme a regra da atividade
      if (item.name !== 'images') {
        subpastas.push(item.name);
      }
    } else if (item.isFile()) {
      // Aceita apenas .html e .txt
      const extensao = path.extname(item.name).toLowerCase();
      if (extensao === '.html' || extensao === '.txt') {
        arquivos.push(item.name);
      }
    }
  }

  return { subpastas, arquivos };
}

async function lerArquivoComFrontMatter(caminhoRelativo) {
  const raizSegura = path.resolve(__dirname, 'content-pages');
  const caminhoArquivo = path.resolve(raizSegura, caminhoRelativo);

  // Segurança contra ../
  if (!caminhoArquivo.startsWith(raizSegura)) {
    const erro = new Error('Acesso Proibido');
    erro.code = 'FORBIDDEN';
    throw erro;
  }

  // Lê o texto do ficheiro
  const conteudoCompleto = await fs.readFile(caminhoArquivo, 'utf-8');

  // Valores padrão se não houver front-matter
  let metadados = {
    title: '',
    tags: [],
    draft: false
  };
  let corpo = conteudoCompleto;

  // Verifica se o ficheiro começa com ---
  if (conteudoCompleto.startsWith('---')) {
    const partes = conteudoCompleto.split('---');
    
    if (partes.length >= 3) {
      const linhasFicha = partes[1].trim().split('\n');
      corpo = partes.slice(2).join('---').trim();

      for (const linha of linhasFicha) {
        const [chave, ...resto] = linha.split(':');
        if (chave && resto.length > 0) {
          const nomeChave = chave.trim();
          const valor = resto.join(':').trim();

          if (nomeChave === 'title') {
            metadados.title = valor;
          } else if (nomeChave === 'tags') {
            metadados.tags = valor.split(',').map(t => t.trim()).filter(Boolean);
          } else if (nomeChave === 'draft') {
            metadados.draft = (valor === 'true');
          }
        }
      }
    }
  }

  return { metadados, corpo };
}

// 1. Rota raiz
app.get('/', (req, res) => {
  res.send('Página Inicial - Servidor Ativo');
});

// 2. Rota para listar a raiz de content-pages
app.get('/heritages', async (req, res) => {
  try {
    const dados = await listarDiretorio('');
    res.json({
      caminho: '/',
      subpastas: dados.subpastas,
      arquivos: dados.arquivos
    });
  } catch (erro) {
    res.status(500).send('Erro ao ler a pasta raiz');
  }
});

// 3. Rota dinâmica multinível para listar subpastas (/heritages/sub-1, etc.)
app.get('/heritages/*splat', async (req, res) => {
  try {
    const splat = req.params.splat;
    const caminho = Array.isArray(splat) ? splat.join('/') : (splat || '');

    const dados = await listarDiretorio(caminho);

    res.json({
      caminho: caminho,
      subpastas: dados.subpastas,
      arquivos: dados.arquivos
    });
  } catch (erro) {
    if (erro.code === 'ENOENT') {
      // Pasta não existe no computador -> 404
      res.status(404).send('Erro 404: Pasta não encontrada');
    } else if (erro.code === 'FORBIDDEN') {
      // Tentativa de invasão com ../ -> 403
      res.status(403).send('Erro 403: Acesso Proibido');
    } else {
      res.status(500).send('Erro interno do servidor');
    }
  }
});

// 4. Rota 404 final para qualquer outro endereço inexistente
app.use((req, res) => {
  res.status(404).send('Erro 404: Rota não encontrada!');
});

// 5. Inicia o servidor
app.listen(PORTA, () => {
  console.log(`Servidor ativo em http://localhost:${PORTA}`);
});