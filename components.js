//stores the initial device and room list
if (window.localStorage.getItem('devices') == null){ window.localStorage.setItem('devices', "Refrigrator,AC, Garden lighting, Irrigation System")}
if (window.localStorage.getItem('rooms') == null){ window.localStorage.setItem('rooms', "MasterBed,Kitchen")}

//gets it from local storage
var deviceNames = window.localStorage.getItem('devices')
var roomNames = window.localStorage.getItem("rooms")
var devices_list = deviceNames.split(',')
var rooms_list =  roomNames.split(',');


//counting the number of schedule that added to the history
function add_setting_count(){
  for(let j = 0; j < devices_list.length; j++){
    if (window.localStorage.getItem(devices_list[j]) === null) {window.localStorage.setItem(devices_list[j], "0")}
  }
  for(let i = 0; i < rooms_list.length; i++){
    if ( window.localStorage.getItem(rooms_list[i]) == null) {window.localStorage.setItem(rooms_list[i], "0")}
  }
}

add_setting_count()


var device_settings = {}
var room_settings = {}

var current_device_name = '';
var current_room_name;
var current_temprature_value;
var current_sDate;
var current_sTime;
var current_eDate;
var current_eTime;

//variables for history page
var device_name;
var room_name;
var device_setting_list = [];
var room_setting_list = [];

//page header
class Header extends React.Component {
    render (){
        return(
            <div id="top">
                <div id="top-0">
                    <h1> Smartie </h1>
                    <p>The smartest way to manage all the devices in your home</p>
                </div>
            </div>
        );        
    }
}

//drop down menu for the navigation bar 
class Menu extends React.Component {
    constructor(props){
        super(props);
    }
    render() {
        return (
            <div id="menu-container">
                <div className="dropdown" >
                    <button className="dropbtn" onClick={() => {this.props.onPageChange("Home")}} >Home
                        <i className="fa fa-caret-down"></i>
                    </button>
                </div> 
                <div className="dropdown">
                    <button className="dropbtn" onClick={() => {this.props.onPageChange("Program")}}>Program
                        <i className="fa fa-caret-down"></i>
                    </button>
                </div> 
             
                <div className="dropdown">
                    <button className="dropbtn" onClick={() => {this.props.onPageChange("History")}}>History</button>
                </div> 
            
            </div>
        );
    }
}

//set the Homepage day and time
class HomeClock extends React.Component{
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
      }
    
    componentDidMount() {
        this.timerID = setInterval(
          () => this.tick(),
          1000
        );
      }
    
      componentWillUnmount() {
        clearInterval(this.timerID);
      }
    
      tick() {
        this.setState({
          date: new Date()
        });
      }
    
      formatDate() {
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          var dateString = this.state.date.toLocaleDateString();
          var day = days[this.state.date.getDay()];
          day = day + " " + dateString;
          return day;
      }
    
      render() {
        return (
          <div>
              <p class="home-clock">{this.state.date.toLocaleTimeString()}</p>
              <p class="home-date">{this.formatDate()}</p>
          </div>
        );
      }
}

// create Weather overcast component in homepage
class HomeWeather extends React.Component {
    constructor(props) {
      super(props);
      this.apiKey = '0a0f812e353be6b5282109f837de0186';
    }
    //call the default display weather
    componentDidMount() {
        this.getWeatherByLocation();
      }
    //display the current weather based on User's geolocation
    //using OpenWeatherMap API
      getWeatherByLocation() {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.apiKey}`;
    
            fetch(apiUrl)
              .then(response => response.json())
              .then(data => {
                const weatherDiv = document.getElementById('weather-section');
                const iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
                const temperatureF = ((data.main.temp - 273.15) * 9/5 + 32).toFixed(0); // Convert Kelvin to Fahrenheit
                //display weather information
                weatherDiv.innerHTML = `
                  
                  <p id ="locationName">${data.name}</p>
                  <p id ="hometemp" > ${temperatureF}°F  <img src="${iconUrl}" alt="Weather Icon" id="weatherImage"></p>
                  <p id="weahterStatus"> ${data.weather[0].main}</p>
                  
                `;
              })
              .catch(error => {
                const weatherDiv = document.getElementById('weather-section');
                weatherDiv.innerHTML = '<p>Failed to search for weather information.</p>';
              });
          });
        } else {
          console.log('Geolocation is not supported.');
        }
      }

    //get Weather after the user input a city name
    getWeather() {
      const location = document.getElementById('location').value;
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.apiKey}`;
  
      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
        
          const weatherDiv = document.getElementById('weather-section');
          const iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
          const temperatureF = ((data.main.temp - 273.15) * 9/5 + 32).toFixed(0); // Convert Kelvin to Fahrenheit
          weatherDiv.innerHTML = `
            <p id ="locationName">${data.name}</p>
            <p id ="hometemp" >\ ${temperatureF}°F  <img src="${iconUrl}" alt="Weather Icon" id="weatherImage"></p>
            <p id="weahterStatus"> ${data.weather[0].main}</p>
            
          `;
        })
        .catch(error => {
          const weatherDiv = document.getElementById('weather-section');
          weatherDiv.innerHTML = '<p>Failed to fetch weather information.</p>';
        });
    }
  
    render() {
      return (
        <div id='weather-block'>
            <div id="weather-section"></div>
          <input type="text" id="location" placeholder="Enter location..." />
          <button onClick={() => this.getWeather()}>Search</button>
  
        
         
        </div>
      );
    }
  }

  
class HistoryBar extends React.Component{
    constructor(props){
      super(props);
      this.state = {subPage: "device", room_btn: true, device_btn: true, current_device: "", current_room: ""}
    }

    handleChange = ({target}) => {
      this.setState({[target.id]: target.value});
    };

  //retruve device information from local storage 
  device_retrieve(target){
          device_setting_list = []
          var count = window.localStorage.getItem(target)
      //parsing information 
          if(parseInt(count) > 0){
                for(let i = 0; i < parseInt(count); i++){
                    var name = target + "-" + i.toString();
                    var setting_list = window.localStorage.getItem(name)
                    var array = [];
                    if(setting_list.includes(',')){
                      array = setting_list.split(',');
                    }else {
                      array.push(setting_list);
                    }
                    
                    device_setting_list.push(array)
                }
          }else{
              device_setting_list.push(["No", "setting",  "history", "to",  "display"])
          }

  }
//retrive room information from local storage
  room_retrieve(target){
          room_setting_list = []
          var count = window.localStorage.getItem(target)

          if(parseInt(count) > 0){
                for(let i = 0; i < parseInt(count); i++){
                    var name = target + "-" + i.toString();
                    var setting_list = window.localStorage.getItem(name)
                    var array = [];
                    if(setting_list.includes(',')){
                      array = setting_list.split(',');
                    }else {
                      array.push(setting_list);
                    }
                    
                    room_setting_list.push(array)
                }
          }else{
              room_setting_list.push(["No", "setting",  "history", "to",  "display"])
          }
    
  }

    update_d_name = (target) => { device_name = target;};
    update_r_name = (target) => { room_name = target;};

    render(){
      return (
        <div className="temp">
        <div className="tempratureBody">
            <div class="devicedropdown">
                  <button class="devicedropbtn" onClick={() => {this.setState({subPage: "device"})}}>Select Device</button>
                  <div class="device-dropdown-content" id="device-list">
                    {devices_list.map(device => <a key={device} name={device} value={this.state.current_device} onClick={() => {this.setState({subPage: "device"}); 
                    this.setState({device_btn: false}); this.setState({current_device: device}); this.update_d_name(device); this.device_retrieve(device)}}>{device}</a>)}
                  </div>
            </div>
            <div class="devicedropdown">
                  <button class="devicedropbtn" onClick={() => {this.setState({subPage: "room"})}}>Select Room</button>
                  <div class="device-dropdown-content" id="room_list">
                  {rooms_list.map(room => <a key={room} name={room} value={this.state.current_device} onClick={() => { this.setState({subPage: "room"}); 
                  this.setState({room_btn: false}); this.setState({current_room: room}); this.update_r_name(room); this.room_retrieve(room)}}>{room}</a>)}
                  </div>  
            </div>
        </div>
        <div id="tempcontainer">
          {
            (this.state.subPage == "device") ? 
            (
              <div id="devicecontainer">
                 
                    <div id="dateinput-1">

                              {
                                (this.state.current_device !== "") ? (<p id="devicename1" className="devicename1">{this.state.current_device}</p>):(<p className="devicename">Select Device</p>)
                              }

                                {
                                  (this.state.device_name !== "") ? (
                                    <div class="history_list">

                                      <table>
                                      <tr> 
                                            <th>Setting # </th> <th>Temprature </th> <th> Start date </th> <th> Start time </th> 
                                            <th> End date </th> <th> End time </th> <th>ON/OFF</th>
                                          </tr>
                                          {device_setting_list.map((items, index) => {
                                              return (
                                                <tr>
                                                  <td>{index}</td>
                                                  {items.map((subItems, sIndex) => {
                                                    return <td key={"li-" + sIndex}>  {subItems} </td>;
                                                  })}
                                                </tr>
                                              );
                                          })}
                                      </table>
                                         
                          
                                      </div>
                                  )
                                  :
                                  (
                                    <div class="history_list">  <p>Device need to be selected to see history</p> </div>
                                     
                                  )
                                }
                                
                    </div>
               
        </div>

            )
            :
            (
              <div id="roomcontainer">
                  <div id="dateinput-1">

                          {
                            (this.state.current_room !== "") ? (<p className="devicename1">{this.state.current_room}</p>):(<p className="devicename">Select Room</p>)
                          }
                      
                          {
                                  (this.state.room_name !== "") ? (
                                    <div class="history_list">
                                       
                                      <table>
                                      <tr> 
                                            <th>Setting # </th> <th>Temprature </th> <th> Start date </th> <th> Start time </th> 
                                            <th> End date </th> <th> End time </th><th>ON/OFF</th>
                                          </tr>
                                          {room_setting_list.map((items, index) => {
                                              return (
                                                <tr>
                                                  <td>{index}</td>
                                                  {items.map((subItems, sIndex) => {
                                                    return <td key={"li-" + sIndex}>  {subItems} </td>;
                                                  })}
                                                </tr>
                                              );
                                          })}
                                      </table>
                                         
                          
                                      </div>
                                  )
                                  :
                                  (
                                      <p>No history to show</p>
                                  )
                                }
             
                  </div>
          
          </div>
            )
          }
            </div>  
    </div>
      )
    }

}

class Temperature extends React.Component{
//set temperature component in program page
 
  constructor(props){
        super(props);
        this.state = { sDate:'', sTime: '', eDate: "",  eTime: "",  add_device: "", add_room: "",  current_device: "", current_room: "", subPage: "device",
                      room_btn: true, device_btn: true, d_temprature_value: 0, r_temprature_value: 0, r_sDate:'', r_sTime: '', r_eDate: "",  r_eTime: "", power: "on", tempFeature: false};
        }
    
  handleChange = ({target}) => {
      this.setState({ [target.id]: target.value });
  };
  
  add_device = ({target}) => { //adds device to devices_list array
    var a = prompt("Enter device: ")
    if(a !== "" &&  !devices_list.includes(a) && a !== null){
        this.setState({[target.id]: a });
        
        devices_list.push(a)
        var str;
      
        for (let i = 0; i < devices_list.length; i++){
            if (i == 0){
              str = devices_list[i]
            }else{
              str += "," + devices_list[i];
            } 
        } 
        window.localStorage.setItem('devices', str)
        add_setting_count()

      
    }else{
      alert("Can't put empty string")
    }
  
  }

  add_room = ({target}) => { //adds new rooms to rooms_list array
    var a = prompt("Enter room: ")
    if(a !== "" && !rooms_list.includes(a) && a !== null){
      this.setState({ [target.id]: a });
      rooms_list.push(a)
      var str;
      for (let i = 0; i < rooms_list.length; i++){
          if (i == 0){
            str = rooms_list[i]
          }else{
            str += "," + rooms_list[i];
          } 
      }
      window.localStorage.setItem('rooms', str)
      add_setting_count()
    
    }else{
      alert("Cant put empty string")
    }
  }
  validateSchedule(startD, endD, startT, endT){
    if(current_sDate == "" && current_sTime == "" && current_eDate == "" && current_eTime == "" && current_temprature_value !== ""){
      return true;
    }
    else if(startD < endD){
      return true;
    } else if( startD == endD){
      if(startT < endT){
        return true;
      } else{
        return false
      }
    } else{
      return false;
    }
  }
  save_d_setting =()=>{ //saves device setting

      current_sDate = document.getElementById('sDate').value
      current_sTime = document.getElementById('sTime').value
      current_eDate = document.getElementById('eDate').value
      current_eTime = document.getElementById('eTime').value
      
      if(this.state.tempFeature == false){
        current_temprature_value = "No feature";
      } else{
        current_temprature_value = document.getElementById('d_temprature_value').value
      }
      var str;
      var isValid = this.validateSchedule(current_sDate, current_eDate, current_sTime, current_eTime);
      if(isValid){
      if(current_temprature_value !== "" && this.state.power == 'on'){
        str = current_temprature_value ;     
        var index = parseInt(window.localStorage.getItem(current_device_name))
        var new_index = index + 1
        window.localStorage.setItem(current_device_name, new_index.toString())
        var name = current_device_name + "-" + index.toString()
        window.localStorage.setItem(name, str)
        alert("Setting succeded!")
      }else{
        alert("Make sure The temprature field is entered with device's power on")
      }
    } 
    else{
      alert("End/Start date is invalid")
    }
   
  }

  schedule_d_setting =()=>{ //schedule device setting
    current_sDate = document.getElementById('sDate').value
    current_sTime = document.getElementById('sTime').value
    current_eDate = document.getElementById('eDate').value
    current_eTime = document.getElementById('eTime').value
    
    if(this.state.tempFeature == false){
      current_temprature_value = "No feature";
    } else{
      current_temprature_value = document.getElementById('d_temprature_value').value
    }
    var str;
    var isValid = this.validateSchedule(current_sDate, current_eDate, current_sTime, current_eTime);
    if(isValid){
    if(current_sDate !== "" && current_sTime !== "" && current_eDate !== "" && current_eTime !== "" && current_temprature_value !== ""){
      str = current_temprature_value + "," + current_sDate + "," + current_sTime + "," +  current_eDate + "," +  current_eTime + "," + this.state.power ;   
      var index = parseInt(window.localStorage.getItem(current_device_name))
      var new_index = index + 1
      window.localStorage.setItem(current_device_name, new_index.toString())
      var name = current_device_name + "-" + index.toString()
      window.localStorage.setItem(name, str)
      alert("Scheduling succeded!")
    }else{
      
      alert("Make sure all the fields are entered")
    }
  }
  else{
    alert("Start/End date is invalid")
  }
  }

  clear_d_input(){
    document.getElementById('sDate').value = ""
    document.getElementById('sTime').value = ""
    document.getElementById('eDate').value = ""
    document.getElementById('eTime').value = ""
  }

save_r_setting =()=>{ //saves room setting
  current_sDate = document.getElementById('r_sDate').value
  current_sTime = document.getElementById('r_sTime').value
  current_eDate = document.getElementById('r_eDate').value
  current_eTime = document.getElementById('r_eTime').value
  current_temprature_value = document.getElementById('r_temprature_value').value
  var str;
  var isValid = this.validateSchedule(current_sDate, current_eDate, current_sTime, current_eTime);
  if(isValid){
  if(current_temprature_value !== "" &&this.state.power=='on'){
    str = current_temprature_value ;   
    var index = parseInt(window.localStorage.getItem(current_room_name))
    var new_index = index + 1
    window.localStorage.setItem(current_room_name, new_index.toString())
    var name = current_room_name + "-" + index.toString()
    window.localStorage.setItem(name, str)
    alert("Setting succeded!")
  }else{
    alert("Make sure The temprature field is entered with the room's AC system on")
  }
}
else{
  alert("Start/End date is invalid")
  }

}

schedule_r_setting =()=>{ //save room schedule
    current_sDate = document.getElementById('r_sDate').value
    current_sTime = document.getElementById('r_sTime').value
    current_eDate = document.getElementById('r_eDate').value
    current_eTime = document.getElementById('r_eTime').value
    current_temprature_value = document.getElementById('r_temprature_value').value
    var str;
    var isValid = this.validateSchedule(current_sDate, current_eDate, current_sTime, current_eTime);
    if(isValid){
    if(current_sDate !== "" && current_sTime !== "" && current_eDate !== "" && current_eTime !== "" && current_temprature_value !== ""){
      str = current_temprature_value + "," + current_sDate + "," + current_sTime + "," +  current_eDate + "," +  current_eTime + "," + this.state.power;   
      var index = parseInt(window.localStorage.getItem(current_room_name))
      var new_index = index + 1
      window.localStorage.setItem(current_room_name, new_index.toString())
      var name = current_room_name + "-" + index.toString()
      window.localStorage.setItem(name, str)
      alert("Scheduling succeded!")
    }else{
      
      alert("Make sure all the fields are entered")
    }
  }
  else{
    alert("Start/End date is invalid")
  }
}
// power action perform when then power button click
  togglePower=()=>{
   
    console.log("initial "+ this.state.power)
    if (this.state.power == 'on'){
      this.setState({power:'off'})
      
      
    } else if (this.state.power == 'off'){
     
      this.setState({power:'on'})
     
      
    }
   
  }
//checkbox to define if a device has temperature feature
    handleCheckboxClick=()=>{
      if(this.state.tempFeature == false){
        this.setState({tempFeature:true})
      } else{
        this.setState({tempFeature:false})
      }
    }
 update_d_name = (target) => { current_device_name = target;};
 update_r_name = (target) => {current_room_name = target;};
  

  render(){
    /* if Select Device is click, all properties is set to device's properties*/
       return(
        <div className="temp">
            <div className="tempratureBody">
                <div class="devicedropdown">
                      <button class="devicedropbtn" onClick={() => {this.setState({subPage: "device"}); this.setState({tempFeature:false})}}>Select Device</button>
                      <div class="device-dropdown-content" id="device-list">
                        {devices_list.map(device => <a key={device} name={device} value={this.state.current_device} onClick={() => {this.setState({subPage: "device"}); 
                        this.setState({device_btn: false}); this.setState({current_device: device}); this.update_d_name(device)}}>{device}</a>)}
                      </div>
                </div>
                <div class="devicedropdown">
                      <button class="devicedropbtn" onClick={() => {this.setState({subPage: "room"});this.setState({tempFeature:false})}}>Select Room</button>
                      <div class="device-dropdown-content" id="room_list">
                      {rooms_list.map(room => <a key={room} name={room} value={this.state.current_device} onClick={() => { this.setState({subPage: "room"}); 
                      this.setState({room_btn: false}); this.setState({current_room: room}); this.update_r_name(room)}}>{room}</a>)}
                      </div>  
                </div>
            </div>
            <div id="tempcontainer">
              {
                (this.state.subPage == "device") ? 
                (
                  <div id="devicecontainer">
                          <button id="add_device" className="add_device_btn" value={this.state.add_device} onClick={this.add_device}>ADD Device</button>

                          {
                                (this.state.current_device !== "") ? (<p className="devicename1">{this.state.current_device}</p>):(<p className="devicename">Select Device</p>)
                              }
                          <div class="check_box">
                            <div>
                              <p class="progtitle" style={{textAlign: 'center'}}> SET TEMPERATURE </p>
                            
                              <div class="tempFrame"> 
                                        <div class="check-label">
                                          <label>
                                          { this.state.current_device + " has temperature Feature"} 
                                          <input class="feature_check" type="checkbox" name="myCheckbox"  onClick = {this.handleCheckboxClick} />
                                          </label>
                                        </div>
                                     
                                   
                              {
                                      
                                      (this.state.tempFeature == true)?
                                        (<div>
                                  
                                          <label for="d_temprature_value" > Temprature </label>
                                          <input class="temp_input" type="number" id="d_temprature_value" name="temprature" value={this.state.d_temprature_value} onChange={this.handleChange}
                                            min="0" max="150"/>
                                          <span class="degreeS"> &deg;F</span>
                                          </div>
                                      ) : ("")}
                              </div>
                            </div>  
                          </div>
                            <div id="dateinput">

                                
                            <p class="progtitle"> SET SCHEDULE </p>
                            <div class="scheFrame">  
                                <div>
                                
                                    <label for="sDate">Start date</label>
                                    <input  id="sDate" type="date" name="sDate" value={this.state.sDate} onChange={this.handleChange}/>
                                    <label for="eDate">End date</label>
                                    <input  id="eDate" type="date" name="eDate" value={this.state.eDate} onChange={this.handleChange}/>
                                </div>

                                <div className="set_time">
                                    <label for="sTime">Start time</label>
                                    <input  id="sTime" type="time" name="sTime" value={this.state.sTime} onChange={this.handleChange}/>
                                    <label for="eTime">End time</label>
                                    <input  id="eTime" type="time" name="eTime" value={this.state.eTime} onChange={this.handleChange}/>
                              
                                </div>

                               
                                </div>  
                                <div class="on_switch" >
                                  <label class="switch"><span>{(this.state.power == "on")? 'ON':'OFF'}</span><input type="checkbox" onClick={this.togglePower} /><span class="slider round"></span></label>
                                </div>
                          
                                <div className="end-btn">

                                  <button id="set_device" value="set_device" disabled={this.state.device_btn} onClick={this.save_d_setting}>Set</button>
                                  <button id="schedule_device" value="schedule_device" disabled={this.state.device_btn} onClick={this.schedule_d_setting}>Schedule</button>
                                  <button id="clr_input" value="clr_input" disabled={this.state.device_btn} onClick={this.clear_d_input} >Clear</button>
                                  
                                  
                                </div>
                            
                        </div>       
                   
            </div>

                )
                :
                (
                  /* if Select Room is click, all properties is set to room's properties*/
                  <div id="roomcontainer">
                  <button id="add_room" className="add_device_btn" value={this.state.add_room} onClick={this.add_room}>ADD Room</button>
                  
        
                      

                              {
                                (this.state.current_room !== "") ? (<p className="devicename1">{this.state.current_room}</p>):(<p className="devicename">Select Room</p>)
                              }
                          <div class="check_box">
                            <div>
                              <p class="progtitle" style={{textAlign: 'center'}}> SET TEMPERATURE </p>
                            
                              <div class="tempFrame"> 
                              <div class="room-temp">
                              <label for="r_temprature_value" > Temprature </label>
                              <input class="temp_input" type="number" id="r_temprature_value" name="temprature" value={this.state.r_temprature_value} onChange={this.handleChange}
                                min="0" max="150"/>
                              <span class="degreeS"> &deg;F</span>
                              </div>
                              </div>
                            </div>  
                          </div>
                            <div id="dateinput">

                                
                            <p class="progtitle"> SET SCHEDULE </p>
                            <div class="scheFrame">  
                                <div>
                                
                                    <label for="r_sDate">Start date</label>
                                    <input  id="r_sDate" type="date" name="sDate" value={this.state.r_sDate} onChange={this.handleChange}/>
                                    <label for="r_eDate">End date</label>
                                    <input  id="r_eDate" type="date" name="eDate" value={this.state.r_eDate} onChange={this.handleChange}/>
                                </div>

                                <div className="set_time">
                                    <label for="r_sTime">Start time</label>
                                    <input  id="r_sTime" type="time" name="sTime" value={this.state.r_sTime} onChange={this.handleChange}/>
                                    <label for="r_eTime">End time</label>
                                    <input  id="r_eTime" type="time" name="eTime" value={this.state.r_eTime} onChange={this.handleChange}/>
                              
                                </div>

                               
                                </div>  
                                <div class="on_switch" >
                                  <label class="switch"><span>{(this.state.power == "on")? 'ON':'OFF'}</span><input type="checkbox" onClick={this.togglePower} /><span class="slider round"></span></label>
                                </div>
                          
                                <div className="end-btn">

                                  <button id="set_device" value="set_device" disabled={this.state.room_btn} onClick={this.save_r_setting}>Set</button>
                                  <button id="schedule_device" value="schedule_device" disabled={this.state.room_btn} onClick={this.schedule_r_setting}>Schedule</button>
                                 
                                  
                                  
                                </div>
                            
                        </div>
              
              </div>
                )
              }
                </div>  
        </div>
       );
    }
}
