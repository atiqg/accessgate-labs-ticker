//WEBSOCKET VARIABLE
let currency_ticker;
//BOOLEAN: IS TABLE ALREADY DRAWN ON SCREEN
let isTableCreated=false;

//START POINT OF SCRIPT WHEN PAGE LOAD
//FETCH ALL AVAILABLE EXCHANGE TYPE ON THE API
get_currencies();

/**
 * FUNCTION TO FETCH ALL AVAILABLE CRYPTO EXCHANGE TYPES
 * (THIS FUNCTION WAS CREATED BECAUSE CORS POLICY BLOCK REQUEST
 * AND HERE WE ARE USING PROXY SERVER, netlify!! )
 */
function get_currencies(){
    document.querySelector('#loadingSvg').style.display = 'block'; 
    
    let url = 'https://accessgate-test.netlify.app/.netlify/functions/symbols';
    fetch(url) 
    .then(response => response.text())
    .then(result => {
        result = JSON.parse(result);//parse result
        show_symbol_options(result);//show all available exchange types
        console.log(result);
    })
}



/**
 * FUNCTION TO START TICKER WEBSOCKET AND SHOW DATA TO USER
 * STEP 1: CHECK IF WEBSOCKET WAS OPENED FOR ANOTHER TYPE
 * STEP 2: IF SO THEN CLOSE IT AND START A NEW ONE
 * STEP 3: ONCE WE RECEIVE 2nd TICK THEN CREATE DATA TABLE
 * STEP 4: FROM THE THIRD TICK USE UPDATE DATA FUNCTION
 * STEP 5: IF ERROR OR WINDOW DOWN THEN CLOSE WEBSOCKET
 * @param {STRING } symbol PARTICULAR EXCHANGE TYPE STRING
 */
function open_ticker(symbol){
    document.querySelector('#loadingSvg').style.display = 'block';

    //check if web socket is already connected if so, close it
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
            //close loading animation
            document.querySelector('#loadingSvg').style.display = 'none';
            
            if(!isTableCreated){//if table is not created yet then create it
                create_ticker_table(message.params);
                isTableCreated = true;
                console.log('Data Table Created');
            }else{
                //if table is crated then update data
                console.log('Update Data: ', message.params.symbol);
                update_table_data(message.params);
            }
        }else{
            console.log("Ticker Started");
        }
    }
    
    //on error
    currency_ticker.onerror = (error) => {
        console.log(`WebSocket error: ${error}`);
        currency_ticker.close();
    }

    //on close
    currency_ticker.onclose = function () {
        console.log('websocket is closed');
    };
}

//IF USER CLOSE OR REFRESH WINDOW THEN DISCONNECT WEBSOCKET
window.onbeforeunload = function() {
    if(currency_ticker){
        currency_ticker.close();
    }
};


/**
 * FUNCTION TO CREATE DATA TABLE FOR THE FIRST TIME
 * THIS FUNCTION CREATE TABLE DYNAMICALLY AND ASSIGN
 * EACH ENTRY AN id OF DATA TYPE WHICH CAN BE USED
 * LATER TO UPDATE DATA
 * STEP 1: REMOVE ANY PREVIOUS DATA TABLE
 * STEP 2: CREATE TABLE COMPONENTS
 * STEP 3: ADD DATA TO COMPONENTS
 * STEP 4: ADD id TO COMPONENTS
 * STEP 5: APPEND COMPONENTS TO TABLE
 * @param {object} data EXCHANGE PRICE DATA 
 */
function create_ticker_table(data){

  //remove any previously drawn table
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
        
        //add data to components
        node1 = document.createTextNode(key);
        node2 = document.createTextNode(data[key]);
        //add same data as id of component
        td2.id = key;//this id will be used to update data later 
        
        //append components
        td1.appendChild(node1);
        td2.appendChild(node2);
        
        tr.appendChild(td1);
        tr.appendChild(td2);
        
        table.appendChild(tr);
    }
  
}



/**
 * FUNCTION TO DYNAMICALLY UPDATE EACH ROW DATA
 * DATA KEY WAS ASSIGNED AS ID OF THE ROW SO,
 * WE CAN USE IT TO UPDATE
 * @param {object} data NEW TICK DATA
 */
function update_table_data(data){
    for (key in data) {
        document.querySelector('#' + key).innerHTML = data[key];
    }   
}


/**
 * FUNCTION TO SHOW ALL THE EXCHANGE PRICE TYPES
 * STEP 1: CREATE A NEW BUTTON AND ASSIGN ONCLICK FUNCTION
 * STEP 2: PASS RESPECTIVE DATA KEY IN THE ONCLICK FUNCTION
 * STEP 3: IF "ETHBTC" IS FOUND THEN MAKE IT DEFAULT
 * STEP 4: APPEND BUTTON TO HTML PAGE
 * STEP 5: OPEN SOCKET FOR "ETHBTC" FOR DEFAULT DATA
 * @param {object} data EXCHANGE TYPES
 */
function show_symbol_options(data){
    let btn, text, symbol = document.querySelector('#symbolBox');

    for (var key in data) {
        btn = document.createElement('BUTTON');//create a new button
        btn.className = "option";//add options class to button
        //add open websocket function with respective key value
        btn.setAttribute("onclick", 'open_ticker("'+ data[key] +'")');

        text = document.createTextNode(data[key]);//innerHtml text
        btn.appendChild(text);

        //set default button
        if(data[key] == "ETHBTC"){
            btn.className += " active";
        }
        btn.id = (key);
        //append button
        symbol.appendChild(btn);
    }

    //open default websocket
    open_ticker("ETHBTC");
}


//GET EXCHANGE TYPES BOX
var header = document.getElementById("symbolBox");
//GET OPTION CALL ELEMENT
var options = header.getElementsByClassName("option");
//LOOP OVER ALL THE OPTIONS AVAILABLE
for (var i = 0; i < options.length; i++) {
    options[i].addEventListener("click", function() {//IF ANY ONE OPTION IS CLICKED
        var current = document.getElementsByClassName("active");
        console.log(JSON.stringify(current));
        //REMOVE ACTIVE CLASS FORM PREVIOUS ELEMENT
        current[0].className = current[0].className.replace(" active", "");

        this.className += " active";//ADD ACTIVE CLASS TO CLICKED ELEMENT
        isTableCreated = false;//CREATE NEW DATA TABLE
    });
}


/**
 * delay execution of statement for some milliseconds
 * @param {number} milliseconds 
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}