const btnAdicionar = document.getElementById('btn-adicionar')
const container = document.getElementById("conteiner-cartoes")

btnAdicionar.addEventListener('click', () => {
    
    let valor = 0
    
    const card = document.createElement('div')
    const displayValor = document.createElement ('span')
    const containerbtn = document.createElement ('div')
    const btnDiminuir = document.createElement ('button')
    const btnAumentar = document.createElement ('button')
   //Classe dos cartões
    card.className = 'cartao'
    //Funções dos botões
    btnDiminuir.textContent = "Decrease"
    btnDiminuir.classList.add("btn-d")
    btnAumentar.textContent = "Increase"
    btnAumentar.classList.add("btn-i")

    displayValor.className = "numero"
    displayValor.textContent = valor
    btnAdicionar.className = 'botoes-container'
    //Adiciona o escutador do evento clique do botão diminuir
    btnDiminuir.addEventListener("click", () => { 
        //Aqui é para subtrair o valor com -1
        valor--;

        displayValor.textContent = valor
    }) 
    //Adiciona o escutador do evento clique do botão adicionar
    btnAumentar.addEventListener("click", () => {
        //Aqui é para adicionar o valor com +1
        valor++;

        displayValor.textContent = valor
    })
    
    container.appendChild(card);

    card.appendChild(displayValor)

    card.appendChild(containerbtn)

    containerbtn.appendChild(btnDiminuir)

    containerbtn.appendChild(btnAumentar)
}) 




