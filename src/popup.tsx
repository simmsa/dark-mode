//  Typings ---------------------------------------------------------------- {{{

/// <reference path="../typings/tsd.d.ts" />

//  End Typings ------------------------------------------------------------ }}}

function capitalize(s: string): string{
    return s[0].toUpperCase() + s.slice(1);
}

// function setKeyboardShortcut(){
//     chrome.commands.getAll(function(commands){
//         $("#keyboard-shortcut").append(commands[1]["shortcut"]);
//     });
// }

interface UrlSettingsCollapseProps{
    urlDark: boolean;
    urlHue: boolean;
    urlContrast: number;
    title: string;
    identifier: string;
    tooltipValue: string;
}

class UrlSettingsCollapse extends React.Component<UrlSettingsCollapseProps, {}>{

    tooltipHtmlId: string;
    tooltipjQueryId: string;

    componentWillMount(){
        this.tooltipHtmlId = this.props.identifier + "Tooltip";
        this.tooltipjQueryId = "#" + this.tooltipHtmlId;
    }

    componentDidMount(){
        this.setupTooltip();
    }

    setupTooltip(){
        $(this.tooltipjQueryId).tooltip({
            title: this.props.tooltipValue
        });
    }

    render(){
        return (
           <div className="panel panel-default">
             <div className="panel-heading" role="tab" id={this.props.identifier + "Accordion"} >
               <h4 className="panel-title">
                 <a role="button" data-toggle="collapse" data-parent="#accordion" href={"#" + this.props.identifier + "Collapse"} aria-expanded="true" aria-controls={this.props.identifier + "Collapse"} className="accordion-toggle collapsed">
                     {this.props.title}:
                 </a>
               </h4>
             </div>
             <div id={this.props.identifier + "Collapse"} className="panel-collapse collapse" role="tabpanel" aria-labelledby={this.props.identifier  + "Accordion" }>
               <div className="panel-body">
                 <form className="form-horizontal" action="">
                   <ToggleSwitch
                       title="Dark Mode"
                       identifier={this.props.identifier + "DarkMode"}
                       isChecked={this.props.urlDark}
                   />
                   <ToggleSwitch
                       title="Fix Colors"
                       identifier={this.props.identifier + "HueRotate"}
                       isChecked={this.props.urlHue}
                   />
                   <ToggleSlider
                        identifier={this.props.identifier + "Contrast"}
                        title="Contrast"
                        min={50}
                        max={150}
                        current={85}
                   />
                   <div className="form-group">
                     <div className="col-xs-12">
                       <button type="button" className="btn btn-danger btn-small reset-button">Reset</button>
                     </div>
                   </div>
                   <div className="form-group">
                     <div className="col-xs-12">
                        <a href="#" id={this.tooltipHtmlId} style={{float: "right"}}>?</a>
                     </div>
                   </div>
                 </form>
               </div>
             </div>
           </div>
         )
     }
 }

 interface GlobalSettingsCollapseProps{
     globalDark: boolean;
     globalAutoDark: boolean;
     globalHue: boolean;
     globalContrast: number;
     keyboardShortcut: string;
 }

 class GlobalSettingsCollapse extends React.Component<GlobalSettingsCollapseProps, {}>{

     render(){
         return (
           <div className="panel panel-default">
             <div className="panel-heading" role="tab" id="headingThree">
               <h4 className="panel-title">
                 <a className="collapsed accordion-toggle" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
                   Global Settings:
                 </a>
               </h4>
             </div>
             <div id="collapseThree" className="panel-collapse collapse" role="tabpanel" aria-labelledby="headingThree">
               <div className="panel-body">
               <form className="form-horizontal" action="">
                <ToggleSwitch
                    title="Dark Mode"
                    identifier="globalDark"
                    isChecked={this.props.globalDark}
                />
                <ToggleSwitch
                    title="Auto Dark"
                    identifier="globalAutoDark"
                    isChecked={this.props.globalAutoDark}
                />
                <ToggleSwitch
                    title="Fix Colors"
                    identifier="globalHue"
                    isChecked={this.props.globalHue}
                />
                <div className="form-group">
                    <label className="control-label col-xs-7">Shortcut:</label>
                    <div className="col-xs-5">{this.props.keyboardShortcut}</div>
                </div>
                 </form>
               </div>
             </div>
           </div>
        )
    }

}

interface SettingsState {
    // Url Strings
    urlFull: string;
    urlStem: string;

    keyboardShortcut: string;

    // Current Url Settings
    currentUrlDark: boolean;
    currentUrlHue: boolean;
    currentUrlContrast: number;

    // Stem Url Settings
    stemUrlDark: boolean;
    stemUrlHue: boolean;
    stemUrlContrast: number;

    // Global Dark Mode Settings
    globalDark: boolean;
    globalAutoDark: boolean;
    globalHue: boolean;
    globalContrast: number;
    globalKeyboardShortcut: string;
}

class Settings extends React.Component<{}, SettingsState>{
    constructor(){
        super();
        this.state = {
            urlFull: "test",
            urlStem: "test",
            keyboardShortcut: "test",
            currentUrlDark: true,
            currentUrlHue: true,
            currentUrlContrast: 100,
            stemUrlDark: true,
            stemUrlHue: true,
            stemUrlContrast: 100,
            globalDark: true,
            globalAutoDark: true,
            globalHue: true,
            globalContrast: 100,
            globalKeyboardShortcut: "test"
        }
    }

    // Add listener when component is initialized and send initial status message
    componentDidMount(){
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if(typeof(message) === "object"){
                if(message.name === "dark-mode-status"){
                    console.log("Setting state in listener");
                    /* this.setState({
                        // TODO: Standardize these value names
                        currentUrlDark: message["dark-mode"],
                        stemUrlDark: message["dark-mode-stem"]
                    }); */
                }
            }
        });
        this.sendGetInitialState();
    }

    sendGetInitialState(){
        chrome.runtime.sendMessage("request-dark-mode-status");
    }

    render(){
        return (
            <div className="panel-group" id="accordion" role="tablist" aria-multiselectable="true">

            <UrlSettingsCollapse
                title="Current Url Settings"
                identifier="currentUrl"
                urlDark={this.state.currentUrlDark}
                urlHue={this.state.currentUrlHue}
                urlContrast={this.state.currentUrlContrast}
                tooltipValue={"Settings that apply only to: " + this.state.urlFull}
            />

            <UrlSettingsCollapse
                title={capitalize(this.state.urlStem) + " Settings"}
                identifier="stemUrl"
                urlDark={this.state.stemUrlDark}
                urlHue={this.state.stemUrlHue}
                urlContrast={this.state.stemUrlContrast}
                tooltipValue={"Toggle dark mode for all websites starting with " + this.state.urlStem + "."}
            />

            <GlobalSettingsCollapse
                globalDark={this.state.globalDark}
                globalAutoDark={this.state.globalAutoDark}
                globalHue={this.state.globalHue}
                globalContrast={this.state.globalContrast}
                keyboardShortcut={this.state.keyboardShortcut}
            />

            </div>
       )
    }
}

interface ToggleSwitchProps {
    title: string;
    identifier: string;
    isChecked: boolean;
}

class ToggleSwitch extends React.Component<ToggleSwitchProps, {}>{

    setupSwitch(){
        var switchName = "#" + this.props.identifier + "Switch";
        console.log("Activate switch with name: " + switchName);
        $(switchName).bootstrapSwitch();
    }

    componentDidMount(){
        this.setupSwitch();
    }

    render(){
        return (
            <div className="form-group">
             <label className="control-label col-xs-7">{this.props.title}:</label>
             <div className="col-xs-5">
               <input type="checkbox" data-size="mini" name={this.props.identifier + "Switch"} id={this.props.identifier + "Switch"} checked={this.props.isChecked} onChange={this.sendOnChangeMessage} />
             </div>
            </div>
        )
    }

    sendOnChangeMessage(){
        chrome.runtime.sendMessage(this.props.identifier + "Change");
    }
}

interface ToggleSliderProps {
    identifier: string;
    title: string;
    min: number;
    max: number;
    current: number;
}

class ToggleSlider extends React.Component<ToggleSliderProps, {}>{

    jQueryId: string;
    jQueryValueId: string;
    htmlId: string;
    htmlValueId: string;

    componentWillMount(){
        this.jQueryId = "#" + this.props.identifier + "Slider";
        this.jQueryValueId = "#" + this.props.identifier + "SliderValue";
        this.htmlId = this.props.identifier + "Slider";
        this.htmlValueId = this.props.identifier + "SliderValue";
    }

    componentDidMount(){
        $(this.jQueryId).slider({
            tooltip: "hide"
        });
    }

    sendOnChangeMessage(event){
        var slideValue = event.target.value;
        chrome.runtime.sendMessage("");
    }

    render(){
        return(
           <div className="form-group">
             <label className="control-label col-xs-6" style={{paddingRight: "0px"}} >{this.props.title} <span id={this.htmlValueId}></span>{this.props.current}%:</label>
             <div className="col-xs-6 sliderContainer">
                 <input type="text" id={this.htmlId} data-slider-min={this.props.min} data-slider-max={this.props.max} data-slider-value={this.props.current} data-slider-step="1" onChange={this.sendOnChangeMessage} />
             </div>
           </div>
        )
    }
}

ReactDOM.render(
        <Settings />,
        document.getElementById("reactContainer")
);
