const btnAdicionar = document.getElementById('btn-adicionar')
const container = document.getElementById("container-cartoes")

btnAdicionar.addEventListener('click', () => {
    let valor = 0
    const card = document.createElement('div')
    const displayValor = document.createElement ('span')
    const containerbtn = document.createElement ('div')
    const btnDiminuir = document.createElement ('button')
    const btnAumentar = document.createElement ('button')
    card.className = 'card'
    btnDiminuir.textContent = "Decrease"
    btnDiminuir.classList.add("btn-acao")
    btnAumentar.textContent = "Increase"
    btnAumentar.classList.add("btn-acao")
    displayValor.className = "numero"
    displayValor.textContent = valor
    btnAdicionar.className = 'botoes-container'
    



}) 




