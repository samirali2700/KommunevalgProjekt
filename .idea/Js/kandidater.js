
document.getElementById("partiNavn").innerHTML = sessionStorage.getItem("parti-navn")
document.getElementById("kandidatCount").innerHTML = sessionStorage.getItem("kandidat-count")
document.getElementById("addKandidatForm").addEventListener("submit", submitNewKandidat)
document.getElementById("back-btn").addEventListener("click", ()=>{window.location.href = "../index.html"})

let kandidatList
let partiObj

setKandidatTable()


// Fetch
async function fetchKandidater(){
    const url = "http://localhost:7777/fetchKandidater/"+sessionStorage.getItem("selected-parti")
    kandidatList = []
    await fetch(url).then(response => response.json())
        .then(data => {
            data.forEach(obj => {
                kandidatList.push(obj)
            })
        })
        .catch(error => console.warn("Failed To Fetch Kandidater: "+error))
}
async function fetchParti(){
    const url = "http://localhost:7777/fetchParti/"+sessionStorage.getItem('selected-parti')
    await fetch(url).then(response => response.json())
        .then(obj => partiObj = obj)
        .catch(error => console.warn("Failed To Fetch parti: "+error))
}

//  Layout
async function setKandidatTable(){
    await fetchKandidater()

    const tbody = document.getElementById("tableBody")

    while(tbody.childElementCount !== 0){
        tbody.firstElementChild.remove()
    }

    let row

    if(kandidatList.length !== 0){
        kandidatList.forEach(k => {
            row = tbody.insertRow()

            let cell1 = row.insertCell(0)
            cell1.id = k.kandidatId
            const input = document.createElement("input")
                input.setAttribute('type','text')
                input.className = "read-only"
                input.id = "kandidatName"

            input.value = k.firstName+" "+k.lastName
            cell1.appendChild(input)

            let cell2 = row.insertCell(1)
                cell2.className = "row-tools"
                cell2.id = k.kandidatId

            const editKandidatBtn = document.createElement("button")
                editKandidatBtn.innerHTML = "Rediger Kandidat"
                editKandidatBtn.id = "editKandidat"
            editKandidatBtn.addEventListener("click", editKandidat)
            const deleteKandidatBtn = document.createElement("button")
                deleteKandidatBtn.innerHTML = "Slet Kandidat"
            deleteKandidatBtn.addEventListener("click", deleteKandidat)


            cell2.appendChild(editKandidatBtn)
            cell2.appendChild(deleteKandidatBtn)

        })
    }
    else{
        row = tbody.insertRow()
        let cell1 = row.insertCell(0)
        cell1.colSpan = 2
        cell1.className = "empty-list"
        cell1.innerHTML = "Der er ingen gemte kandidater"
    }

    await fetchParti()

    //Update kandidat count every time table is looaded
    document.getElementById("kandidatCount").innerHTML = partiObj.kandidatCount
}


//  Functions
async function submitNewKandidat(event){
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const plainData = Object.fromEntries(formData.entries())

    const url = "http://localhost:7777/saveKandidat"
    await fetchParti()

    const kandidatObj = {
        firstName: plainData.firstName,
        lastName: plainData.lastName,
        parti:partiObj,
    }
    const Options = {
        method: "POST",
        headers:{
            "Content-type":"application/json"
        },
        body: JSON.stringify(kandidatObj)
    }

    await fetch(url, Options)
        .catch(error => console.warn("failed to save Kandidat"))

    triggerAddKandidat()
    setKandidatTable()
}
async function editKandidat(){

    const input = document.querySelectorAll("#kandidatName")

    for(let i = 0; i < input.length; i++){
        if(input[i].parentElement.id === this.parentElement.id){
            if(input[i].className === ''){
                this.innerHTML = "Rediger Kandidat"
                input[i].className = 'read-only'
                const firstName = input[i].value.split(' ')[0]
                let lastName = ''
                let size = input[i].value.split(' ').length
                for(let j = 1; j < size; j++){
                    lastName += input[i].value.split(' ')[j]+" "
                }

                const url = "http://localhost:7777/updateKandidat"
                const kandidatObj = {
                    kandidatId: this.parentElement.id,
                    firstName: firstName,
                    lastName: lastName,
                    parti:partiObj,

                }
                const Options ={
                    method:"POST",
                    headers:{
                        "Content-type":"application/json"
                    },
                    body:JSON.stringify(kandidatObj)
                }

                await fetch(url,Options)
                    .catch(error => console.warn("Failed to Save Change: "+error))
                setKandidatTable()
            }else {
                input[i].className = ''
                this.innerHTML = "Gem Ændringer"
            }
        }
    }
}
async function deleteKandidat(){

    const url = "http://localhost:7777/deleteKandidat/"+this.parentElement.id

    const ans =  confirm("Er du sikker på du vil slette Kandidat?")
    if(ans) {
        await fetch(url)
            .catch(error => console.warn("Failed To Delete Kandidat: " + error))
    }
    setKandidatTable()
}

//  Buttons defined
const addKandidat = document.getElementById("addKandidat")
addKandidat.addEventListener("click", triggerAddKandidat)

function triggerAddKandidat(){
    const addKandidateDiv = document.querySelector(".add-kandidat")
    const inputs = document.querySelectorAll("input")


    if(addKandidateDiv.hidden) {
        addKandidateDiv.hidden = false
    }
    else{
        addKandidateDiv.hidden = true
        const form = document.getElementById("addKandidatForm")
        const input = form.querySelectorAll("input")

        for(let i = 0; i < input.length; i++){
            input[i].value = ''
        }
    }


}


