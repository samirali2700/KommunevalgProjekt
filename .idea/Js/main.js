let partiList
(async function(){
    await fetchPartier()
    setPartiTable()
}())


//  Fetch
async function fetchPartier(){
    partiList = []
    const url = "http://localhost:7777/fetchPartier"
    await fetch(url).then(response => response.json())
        .then(data => {
            data.forEach(obj => {
                partiList.push(obj)
            })
        })
        .catch(error => console.warn("Failed To Fetch partier: "+error))
}

//  Layout
async function setPartiTable() {

    const tbody = document.getElementById("tableBody")

    //Emptying table body if not empty
    while(tbody.childElementCount !== 0){
        tbody.firstElementChild.remove()
    }

    let row

    // if no parti exist, one cell is defined and spaned over all cell2
    // with empty notification
    if (partiList.length === 0) {
        row = tbody.insertRow()
        row.className ="empty-list"
        let cell1 = row.insertCell(0)
        cell1.colSpan = 4
        cell1.innerHTML = "Der er Ingen gemte partier"

    } else {

        partiList.forEach(p => {
            row = tbody.insertRow()
            row.id = p.partiId

            let cell1 = row.insertCell(0)
            let cell2 = row.insertCell(1)
            let cell3 = row.insertCell(2)
            let cell4 = row.insertCell(3)

            cell1.innerHTML = p.parti
            cell2.innerHTML = p.kandidatCount
            cell3.innerHTML = p.procent+" %"

            cell4.id = p.partiId
            cell4.className = "row-tools"

            const seeKandidatBtn = document.createElement("button")
            seeKandidatBtn.addEventListener("click", () => {

                //data is insert in session storage, to help with accessibility
                sessionStorage.setItem('selected-parti',p.partiId)
                sessionStorage.setItem('parti-navn',p.parti)
                sessionStorage.setItem('kandidat-count',p.kandidatCount)
                window.location.href = "Html/Kandidater.html"
            })
            const deletePartiBtn = document.createElement("button")
                deletePartiBtn.addEventListener("click",  deleteParti)

            seeKandidatBtn.innerHTML = "Se Kandidater"
            deletePartiBtn.innerHTML = "Slet Parti"


            cell4.appendChild(seeKandidatBtn)
            cell4.appendChild(deletePartiBtn)

        })
    }
}
function registerVotes(){
    const registerTable = document.getElementById("registerVotesTable")
    const tbody = document.getElementById("registerVotesTbody")


    //the Container is hidden, and is made visible when button is clicked
    if(registerTable.className === 'hidden'){
        registerTable.className = "visible"

        let row

        partiList.forEach(p => {
            row = tbody.insertRow()

            let cell1 = row.insertCell(0)
            let cell2 = row.insertCell(1)

            const parti = document.createElement("input")
            parti.setAttribute('type','text')
            parti.setAttribute('name','parti')
            parti.value = p.parti
            parti.readOnly = true
            cell1.appendChild(parti)

            const antalStemmer = document.createElement("input")
            antalStemmer.setAttribute('type','number')
            antalStemmer.setAttribute('name','stemmer')
            antalStemmer.required = true
            cell2.appendChild(antalStemmer)
        })

        const submitForm = document.getElementById("submitVotes")
        submitForm.addEventListener("click",submitVotes)

    }
    else{
        //table body is emptied and made hidden
        while(tbody.childElementCount !== 0){
            tbody.firstElementChild.remove()
        }
        registerTable.className = "hidden"
    }
}

//  Functions
async function deleteParti(){
    const url = "http://localhost:7777/deleteParti/"+this.parentElement.id
    const answ = confirm("Er du sikker på du vil slette Parti")

    if(answ) {
        await fetch(url)
            .catch(error => console.warn("Failed To Delete Parti: " + error))
        await fetchPartier()
        setPartiTable()
    }

}

// Button defined
const addParti = document.getElementById("addParti")
addParti.addEventListener("submit", submitNewParti)

const registerVotesBtn = document.getElementById("registerVotesBtn")
registerVotesBtn.addEventListener("click",registerVotes)

async function submitNewParti(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)
    const plainData = Object.fromEntries(formData.entries())

    const url = "http://localhost:7777/saveParti"

    const partiObj = {
        parti: plainData.parti,
        kandidatCount: 0,
        procent: 0
    }

    const Options = {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(partiObj)
    }

    await fetch(url,Options)
        .catch(error => console.log("Failed To save parti; "+error))
    this.firstElementChild.value = ''
    await fetchPartier()
    setPartiTable()
}
async function submitVotes(){
    const submitForm = document.getElementById("registerVotesForm")
    const inputs = submitForm.querySelectorAll("input")

    const votes = new Map()
    let votesTotal = 0
    for(let i = 0; i < inputs.length; i+=2){
        let votesnum = parseInt(inputs[i+1].value)
        votes.set(inputs[i].value,inputs[i+1].value)
        votesTotal += votesnum

    }

    const url = "http://localhost:7777/saveParti"
    for (const p of partiList) {

        let procent = ((parseInt(votes.get(p.parti)) / votesTotal) * 100).toFixed(2)

        let pObj = {
            partiId: p.partiId,
            parti: p.parti,
            procent: procent
        }

        let Options = {
            method:"POST",
            headers:{
                "Content-type":"application/json"
            },
            body: JSON.stringify(pObj)
        }

        await fetch(url,Options)
            .catch(error => console.warn("Failed To Update Parti; "+error))

    }
    window.location.reload()
}


//  Sort functions
let filterFlag = false
const filter = document.getElementById("filter")
filter.addEventListener("click", filterParti )
function filterParti(){

    if(filterFlag === false){
        filterFlag = true;
    }
    else {
        filterFlag = false;
    }
    partiList.sort(comparePartiName)
    setTimeout(()=>{setPartiTable()},100)
}
function comparePartiName(a,b){
    let aShort = a.parti
    let bShort = b.parti

    if(filterFlag) {
        if (aShort < bShort) {
            return -1
        } else if (aShort > bShort) {
            return 1
        }
        return 0
    }
    else{
        if (aShort < bShort) {
            return 1
        } else if (aShort > bShort) {
            return -1
        }
        return 0
    }
}