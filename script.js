let currency_ticker;
let isTableCreated=false;

function get_currencies(){
    document.querySelector('#loadingSvg').style.display = 'block';

    let url = 'https://accessgate-test.netlify.app/.netlify/functions/symbols';
    fetch(url) 
    .then(response => response.text())
    .then(result => {
        result = JSON.parse(result);
        show_symbol_options(result);
        console.log(result);
    })
}

get_currencies();

function open_ticker(symbol){
    document.querySelector('#loadingSvg').style.display = 'block';

    if(currency_ticker){
        currency_ticker.close();
    }

    //initialize websocket
    const url = 'wss://api.crosstower.com/api/2/ws';
    currency_ticker = new WebSocket(url)
    currency_ticker.onopen = () => {
        console.log('Websocket is open');
        currency_ticker.send(JSON.stringify({
            "method": "subscribeTicker",
            "params": {
              "symbol": symbol
            },
            "id": 123
          }));
    }

    currency_ticker.onmessage = (e) => {
        let message = JSON.parse(e.data);
        if(!message.result){
            document.querySelector('#loadingSvg').style.display = 'none';
            if(!isTableCreated){
                create_ticker_table(message.params);
                isTableCreated = true;
                console.log('first');
            }else{
                console.log('Second: yes', message.params.symbol);
                update_table_data(message.params);
            }
        }else{
            console.log("Ticker Started");
        }
    }
    
    currency_ticker.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
        currency_ticker.close();
    }

    currency_ticker.onclose = function () {
        console.log('websocket is closed');
    };
}

window.onbeforeunload = function() {
    if(currency_ticker){
        currency_ticker.close();
    }
};

function create_ticker_table(data){


  let table = document.querySelector('#dataTable');
  document.querySelector('#dataTable').innerHTML = '<thead>' +
'<tr>'+
'<th><h1>data</h1></th>'+
'<th><h1>value</h1></th>'+
'</tr>'+
'</thead>' +
'<tbody id="tbody">'+
'</tbody>';

    let tr, td1, td2, node1, node2;
    for (var key in data) {
        tr = document.createElement('tr');   
        td1 = document.createElement('td');
        td2 = document.createElement('td');
        
        node1 = document.createTextNode(key);

        node2 = document.createTextNode(data[key]);
        td2.id = key;
        
        td1.appendChild(node1);
        td2.appendChild(node2);
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        
        table.appendChild(tr);
    }
  
}

let ifColored=false;
function change_color(element){
    if(!ifColored){
        ifColored = true;
        let tempColor;
        tempColor = element.className;
        element.className += " exp";
        sleep(60).then(() => {
            element.className = tempColor;
            ifColored = false;
        })
    }
}


function update_table_data(data){
    
    for (key in data) {
        if(document.querySelector('#' + key).innerHTML != data[key]){
            change_color(document.querySelector('#' + key));
            document.querySelector('#' + key).innerHTML = data[key];
        }
    }   
}


function show_symbol_options(data){
    let btn, text, symbol = document.querySelector('#symbolBox');
    let selectedSymbol;

    for (var key in data) {
        btn = document.createElement('BUTTON');
        btn.className = "option";
        btn.setAttribute("onclick", 'open_ticker("'+ data[key] +'")');

        text = document.createTextNode(data[key]);
        btn.appendChild(text);

        if(data[key] == "ETHBTC"){
            btn.className += " active";
            selectedSymbol == "ETHBTC";
        }
        btn.id = (key);
        
        symbol.appendChild(btn);
    }

    open_ticker("ETHBTC");
}



var header = document.getElementById("symbolBox");
var options = header.getElementsByClassName("option");
for (var i = 0; i < options.length; i++) {
    options[i].addEventListener("click", function() {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
        isTableCreated = false;
    });
}


/**
 * delay execution of statement for some milliseconds
 * @param {number} milliseconds 
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}