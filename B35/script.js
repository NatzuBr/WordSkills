const canvas = document.getElementById('meuCanvas');
const ctx = canvas.getContext('2d');

function desenharTriangulo(p1, p2, p3) {
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y); // Ponto 1 (topo)
  ctx.lineTo(p2.x, p2.y); // Linha até o Ponto 2 (esquerda)
  ctx.lineTo(p3.x, p3.y); // Linha até o Ponto 3 (direita)
  ctx.closePath();        // Volta sozinho para o Ponto 1
  ctx.fillStyle = '#000000';
  ctx.fill();             // Preenche de preto
}
// Função auxiliar para achar o ponto médio
function pontoMedio(pA, pB) {
  return {
    x: (pA.x + pB.x) / 2,
    y: (pA.y + pB.y) / 2
  };
}

// A função recursiva
function sierpinski(p1, p2, p3, nivel) {
  // PASSO 6: Caso-base (quando chega a zero, desenha e para)
  if (nivel === 0) {
    desenharTriangulo(p1, p2, p3);
    return;
  }

  // PASSO 7: Caso geral (calcula os pontos médios)
  const m12 = pontoMedio(p1, p2); // meio do lado esquerdo
  const m23 = pontoMedio(p2, p3); // meio da base
  const m31 = pontoMedio(p3, p1); // meio do lado direito

  // Chama a própria função para os 3 cantos (diminuindo o nível em 1)
  sierpinski(p1, m12, m31, nivel - 1); // Triângulo de cima
  sierpinski(m12, p2, m23, nivel - 1); // Triângulo da esquerda
  sierpinski(m31, m23, p3, nivel - 1); // Triângulo da direita
}
const btnDesenhar = document.getElementById('btnDesenhar');
const inputNiveis = document.getElementById('niveis');

function executar() {
  // Limpa o canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Lê e valida o valor
  let nivel = parseInt(inputNiveis.value, 10);
  if (isNaN(nivel) || nivel < 0) nivel = 0;
  if (nivel > 6) nivel = 6; // Trava de segurança para não congelar o navegador

  // Vértices do triângulo principal
  const topo = { x: 250, y: 45 };
  const esq  = { x: 30,  y: 426 };
  const dir  = { x: 470, y: 426 };

  // Dispara o desenho
  sierpinski(topo, esq, dir, nivel);
}

btnDesenhar.addEventListener('click', executar);

// Desenha o nível inicial ao carregar a página
executar();