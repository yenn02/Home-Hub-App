class App extends React.Component {
    constructor(props){
        super(props);

        this.handlePageChange = this.handlePageChange.bind(this);
        this.state = { page:'Home' };
    }
    handlePageChange(page){
        this.setState({page: page});
    }
    render (){
        
        if(this.state.page === 'Home'){
            return(
                <div>
                    <Header/>
                    <Menu page ={this.state.page} onPageChange={this.handlePageChange}/>
                
                    <div id="remove">
                        <HomeWeather/>
                        <HomeClock/>

                        <button id ="program_button" class="homeButton" onClick={() => {this.setState({page:'Program'})}}>
                            <img src="./assets/program_icon.png" id="buttonIcon" />
                            Program
                        </button>

                        <button id = "history_button" class="homeButton" onClick={() => {this.setState({page:'History'})}}>
                            <img src="./assets/history_icon.png" id="buttonIcon" />
                                History
                        </button>

                    </div> 
                </div>
            
            );        
        } else if(this.state.page === 'History'){
            return(
                <div width="100%">
                    <Header/>
                    <Menu page ={this.state.page} onPageChange={this.handlePageChange}/>
                    <HistoryBar/>
                </div>
            );    
        } else if(this.state.page === 'Program'){
            return(
                <div>
                    <Header/>
                    <Menu page ={this.state.page} onPageChange={this.handlePageChange}/>
                    <Temperature/>
                </div>
            );    
        }
    }
}

const root = ReactDOM.createRoot(document.getElementById("root-container"))
root.render(<App />);
