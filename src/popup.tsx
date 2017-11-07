// Right now jquery is loaded as an external library, don't include it here
// import * as $ from "jquery";
import * as React from "react";
import * as ReactDOM from "react-dom";

import DefaultState from "./DefaultState";
import Message from "./Message";
import SettingId from "./SettingId";

const capitalize = (s: string): string => {
  try {
    return s[0].toUpperCase() + s.slice(1);
  } catch (e) {
    return s;
  }
};

//  UrlSettingsCollapse ------------------------------------------------ {{{

interface UrlSettingsCollapseProps {
  urlDark: boolean;
  urlHue: boolean;
  urlContrast: number;
  title: string;
  identifier: string;
  tooltipValue: string;
}

class UrlSettingsCollapse extends React.Component<
  UrlSettingsCollapseProps,
  {}
> {
  private tooltipHtmlId: string;
  private tooltipjQueryId: string;

  private setupTooltip() {
    $(this.tooltipjQueryId).tooltip({
      title: this.props.tooltipValue,
    });
  }

  public  componentWillMount() {
    this.tooltipHtmlId = this.props.identifier + "Tooltip";
    this.tooltipjQueryId = "#" + this.tooltipHtmlId;
  }

  public componentDidMount() {
    this.setupTooltip();
  }

  public render() {
    return (
      <div className="panel panel-default">
        <div
          className="panel-heading"
          role="tab"
          id={this.props.identifier + "Accordion"}
        >
          <h4 className="panel-title">
            <a
              role="button"
              data-toggle="collapse"
              data-parent="#accordion"
              href={"#" + this.props.identifier + "Collapse"}
              aria-expanded="true"
              aria-controls={this.props.identifier + "Collapse"}
              className="accordion-toggle collapsed"
            >
              {this.props.title}:
            </a>
          </h4>
        </div>
        <div
          id={this.props.identifier + "Collapse"}
          className="panel-collapse collapse"
          role="tabpanel"
          aria-labelledby={this.props.identifier + "Accordion"}
        >
          <div className="panel-body">
            <form className="form-horizontal" action="">
              <ToggleSwitch
                title="Dark Mode"
                group={this.props.identifier}
                field={SettingId.Field.Dark}
                isChecked={this.props.urlDark}
              />
              <ToggleSwitch
                title="Fix Colors"
                group={this.props.identifier}
                field={SettingId.Field.Hue}
                isChecked={this.props.urlHue}
              />
              <ToggleSlider
                identifier={this.props.identifier + SettingId.Field.Contrast}
                group={this.props.identifier}
                field={SettingId.Field.Contrast}
                title="Contrast"
                min={SettingId.Default.ContrastMin}
                max={SettingId.Default.ContrastMax}
                step={SettingId.Default.ContrastStep}
                current={this.props.urlContrast}
              />
              <ResetButton buttonText="Reset" group={this.props.identifier} />
              <div className="form-group">
                <div className="col-xs-12">
                  <a
                    href="#"
                    id={this.tooltipHtmlId}
                    style={{ float: "right" }}
                  >
                    ?
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

//  End UrlSettingsCollapse -------------------------------------------- }}}
//  GlobalSettingsCollapse --------------------------------------------- {{{

interface GlobalSettingsCollapseProps {
  globalDark: boolean;
  globalAutoDark: boolean;
  globalShowNotifications: boolean;
  globalLogAutoDark: boolean;
  globalHue: boolean;
  globalContrast: number;
  keyboardShortcut: string;
}

// tslint:disable:max-classes-per-file
class GlobalSettingsCollapse extends React.Component<
  GlobalSettingsCollapseProps,
  {}
> {
  public render() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading" role="tab" id="headingThree">
          <h4 className="panel-title">
            <a
              className="collapsed accordion-toggle"
              role="button"
              data-toggle="collapse"
              data-parent="#accordion"
              href="#collapseThree"
              aria-expanded="false"
              aria-controls="collapseThree"
            >
              Global Settings:
            </a>
          </h4>
        </div>
        <div
          id="collapseThree"
          className="panel-collapse collapse"
          role="tabpanel"
          aria-labelledby="headingThree"
        >
          <div className="panel-body">
            <form className="form-horizontal" action="">
              <ToggleSwitch
                title="Dark Mode"
                group={SettingId.Group.Global}
                field={SettingId.Field.Dark}
                isChecked={this.props.globalDark}
              />
              <ToggleSwitch
                title="Auto Dark"
                group={SettingId.Group.Global}
                field={SettingId.Field.AutoDark}
                isChecked={this.props.globalAutoDark}
              />
              <ToggleSwitch
                title="Log Auto Dark"
                group={SettingId.Group.Global}
                field={SettingId.Field.LogAutoDark}
                isChecked={this.props.globalLogAutoDark}
              />
              <ToggleSwitch
                title="Notifications"
                group={SettingId.Group.Global}
                field={SettingId.Field.ShowNotifications}
                isChecked={this.props.globalShowNotifications}
              />
              <ToggleSwitch
                title="Fix Colors"
                group={SettingId.Group.Global}
                field={SettingId.Field.Hue}
                isChecked={this.props.globalHue}
              />
              <div className="form-group">
                <label className="control-label col-xs-4">Shortcut:</label>
                <div
                  className="col-xs-8"
                  style={{ textAlign: "right", paddingRight: "11px" }}
                >
                  {this.props.keyboardShortcut}
                </div>
              </div>
              <ResetButton
                buttonText="Reset All Settings"
                group={SettingId.Group.Global}
              />
            </form>
          </div>
        </div>
      </div>
    );
  }
}

//  End GlobalSettingsCollapse ----------------------------------------- }}}
//  Settings ----------------------------------------------------------- {{{

interface SettingsState {
  data: any;
}

class Settings extends React.Component<{}, SettingsState> {
  constructor() {
    super();
    var defaultState = new DefaultState();
    this.state = {
      data: defaultState.pack(),
    };
    this.initListener();
  }

  // Add listener when component is initialized and send initial status message
  initListener() {
    Message.receive(
      Message.Sender.Background,
      Message.Receiver.Popup,
      Message.Intent.SendState,
      message => {
        this.setState({
          data: message.Data,
        });
      },
    );
    this.sendGetInitialState();
  }

  sendGetInitialState() {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.RequestState,
      null,
    );
  }

  render() {
    return (
      <div
        className="panel-group"
        id="accordion"
        role="tablist"
        aria-multiselectable="true"
      >
        <UrlSettingsCollapse
          title="Current Url Settings"
          identifier={SettingId.Group.CurrentUrl}
          urlDark={this.state.data.CurrentUrl.Dark}
          urlHue={this.state.data.CurrentUrl.Hue}
          urlContrast={this.state.data.CurrentUrl.Contrast}
          tooltipValue={
            "Settings that apply only to: " + this.state.data.CurrentUrl.Url
          }
        />

        <UrlSettingsCollapse
          title={capitalize(this.state.data.StemUrl.UrlStem) + " Settings"}
          identifier={SettingId.Group.StemUrl}
          urlDark={this.state.data.StemUrl.Dark}
          urlHue={this.state.data.StemUrl.Hue}
          urlContrast={this.state.data.StemUrl.Contrast}
          tooltipValue={
            "Toggle dark mode for all websites starting with " +
            this.state.data.StemUrl.UrlStem +
            "."
          }
        />

        <GlobalSettingsCollapse
          globalDark={this.state.data.Global.Dark}
          globalAutoDark={this.state.data.Global.AutoDark}
          globalLogAutoDark={this.state.data.Global.LogAutoDark}
          globalShowNotifications={this.state.data.Global.ShowNotifications}
          globalHue={this.state.data.Global.Hue}
          globalContrast={this.state.data.Global.Contrast}
          keyboardShortcut={this.state.data.Global.Shortcut}
        />
      </div>
    );
  }
}

//  End Settings ------------------------------------------------------- }}}
//  ToggleSwitch ------------------------------------------------------- {{{

interface ToggleSwitchProps {
  title: string;
  group: string;
  field: string;
  isChecked: boolean;
}

class ToggleSwitch extends React.Component<ToggleSwitchProps, {}> {
  identifier: string;
  bootstrapSliderId = "bootstrap-switch-id-";
  thisSwitch: any;

  // Add ref support
  refs: {
    [string: string]: any;
    switchContainer: any;
  };

  componentWillMount() {
    this.identifier = this.props.group + this.props.field + "Switch";
    this.bootstrapSliderId = this.bootstrapSliderId + this.identifier;
  }

  setupSwitch(group: string, field: string, value?: any) {
    var switchName = "#" + this.identifier;
    var switchContainer = $(this.refs.switchContainer);
    var switchInput = $("<input />").prop("type", "checkbox");
    switchContainer.replaceWith(switchInput);

    switchInput.bootstrapSwitch({
      size: "mini",
      onSwitchChange: () => {
        this.sendOnChangeMessage(group, field, value);
      },
      state: value,
    });

    this.thisSwitch = switchInput;
  }

  // Add anything that manipulates the dom, but do this once
  componentDidMount() {
    this.setupSwitch(this.props.group, this.props.field, this.props.isChecked);
  }

  // When props changes, update the slider and the value
  componentDidUpdate() {
    this.thisSwitch.bootstrapSwitch("state", this.props.isChecked, true);
  }

  sendOnChangeMessage(group: string, field: string, value?: any) {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ToggleField,
      {
        Group: this.props.group,
        Field: this.props.field,
      },
    );
  }

  render() {
    return (
      <div className="form-group">
        <label className="control-label col-xs-7">{this.props.title}:</label>
        <div className="col-xs-5" id={this.bootstrapSliderId}>
          <div ref="switchContainer" />
        </div>
      </div>
    );
  }
}

//  End ToggleSwitch --------------------------------------------------- }}}
//  ToggleSlider ------------------------------------------------------- {{{

interface ToggleSliderProps {
  identifier: string;
  group: string;
  field: string;
  title: string;
  min: number;
  max: number;
  step: number;
  current: number;
}

class ToggleSlider extends React.Component<ToggleSliderProps, {}> {
  jQueryId: string;
  jQueryValueId: string;
  htmlId: string;
  htmlValueId: string;
  slider: any;

  refs: {
    [string: string]: any;
    sliderContainer: any;
  };

  componentWillMount() {
    this.jQueryId = "#" + this.props.identifier + "Slider";
    this.jQueryValueId = "#" + this.props.identifier + "SliderValue";
    this.htmlId = this.props.identifier + "Slider";
    this.htmlValueId = this.props.identifier + "SliderValue";
  }

  // Add anything that manipulates the dom, but do this once
  componentDidMount() {
    var sliderContainer = $(this.refs.sliderContainer);
    var sliderInput = $("<input />").prop("type", "text");
    sliderContainer.replaceWith(sliderInput);

    sliderInput.slider({
      id: this.htmlId,
      min: this.props.min,
      max: this.props.max,
      step: this.props.step,
      value: this.props.current,
      range: false,
      selection: "none",
      precision: 0,
      tooltip: "hide",
    });
    this.slider = sliderInput;

    // Set the initial value
    $(this.jQueryValueId).html(this.props.current + "%:");

    $(this.jQueryId).dblclick(() => {
      $(this.jQueryValueId).html(SettingId.Default.Contrast + "%:");
      sliderInput.slider("setValue", 85);
      this.sendOnChangeMessage(SettingId.Default.Contrast);
    });

    sliderInput.on("slide", slideEvent => {
      // Change the value with jquery, feels more responsive
      $(this.jQueryValueId).html(slideEvent.value + "%:");
      this.sendOnChangeMessage(slideEvent.value);
    });
  }

  // When props changes, update the slider and the value
  componentDidUpdate() {
    this.slider.slider("setValue", this.props.current);
    $(this.jQueryValueId).html(this.props.current + "%:");
  }

  setLabelText(value: number) {
    $(this.jQueryValueId).html(value + "%:");
  }

  sendOnChangeMessage(newValue: any) {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ChangeField,
      {
        Group: this.props.group,
        Field: this.props.field,
        Value: parseInt(newValue),
      },
    );
  }

  public render() {
    return (
      <div className="form-group">
        <label
          className="control-label col-xs-6"
          style={{ paddingRight: "0px" }}
        >
          {this.props.title} <span id={this.htmlValueId} />
        </label>
        <div className="col-xs-6 sliderContainer">
          <div ref="sliderContainer" />
        </div>
      </div>
    );
  }
}

//  End ToggleSlider --------------------------------------------------- }}}
//  ResetButton -------------------------------------------------------- {{{

interface ResetButtonProps {
  buttonText: string;
  group: string;
}

class ResetButton extends React.Component<ResetButtonProps, {}> {
  private sendResetMessage() {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.ResetGroup,
      this.props.group,
    );
  }

  public render() {
    return (
      <div className="form-group">
        <div className="col-xs-12">
          <button
            type="button"
            className="btn btn-danger btn-small reset-button"
            onClick={this.sendResetMessage.bind(this)}
          >
            {this.props.buttonText}
          </button>
        </div>
      </div>
    );
  }
}

//  End ResetButton ---------------------------------------------------- }}}
//  Render ------------------------------------------------------------ {{{

ReactDOM.render(<Settings />, document.getElementById("reactContainer"));

//  End Render -------------------------------------------------------- }}}
