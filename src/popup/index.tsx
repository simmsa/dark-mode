import * as React from "react";
import * as ReactDOM from "react-dom";

import cyan from "material-ui/colors/cyan";
import { createMuiTheme, MuiThemeProvider } from "material-ui/styles";

import DefaultState from "../DefaultState";
import Message from "../Message";
import SettingId from "../SettingId";

import * as utils from "../utils";

import Collapse from "./Collapse";
import Footer from "./Footer";
import GlobalSettings from "./GlobalSettings";
import RowWithLink from "./RowWithLink";
import UrlSettings from "./UrlSettings";

const themeType: "light" | "dark" = "dark";

export const muiTheme = createMuiTheme({
  palette: {
    primary: cyan,
    type: themeType,
  },
  typography: {
    htmlFontSize: 9,
  },
  zIndex: {
    layer: 5000,
    popover: 20000,
  },
});

interface SettingsState {
  data: any;
}

class Settings extends React.Component<{}, SettingsState> {
  constructor() {
    super();
    const defaultState = new DefaultState();
    this.state = {
      data: defaultState.pack(),
    };
    this.initListener();
  }

  // Add listener when component is initialized and send initial status message
  private initListener() {
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

  private sendGetInitialState() {
    Message.send(
      Message.Sender.Popup,
      Message.Receiver.Background,
      Message.Intent.RequestState,
      null,
    );
  }

  public render() {
    return (
      <MuiThemeProvider theme={muiTheme}>
        <Collapse text="Current Url" isOpen={true} iconType="here">
          <UrlSettings
            title="Current Url Settings"
            identifier={SettingId.Group.CurrentUrl}
            urlDark={this.state.data.CurrentUrl.Dark}
            urlHue={this.state.data.CurrentUrl.Hue}
            urlContrast={this.state.data.CurrentUrl.Contrast}
            tooltipValue={
              "Settings that apply only to: " + this.state.data.CurrentUrl.Url
            }
          />
        </Collapse>
        <Collapse
          text={`${utils.capitalize(
            utils.truncate(this.state.data.StemUrl.UrlStem),
          )}`}
          iconType="settings"
        >
          <UrlSettings
            title={
              utils.capitalize(this.state.data.StemUrl.UrlStem) + " Settings"
            }
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
        </Collapse>
        <Collapse text="Global Settings" iconType="global">
          <GlobalSettings
            globalDark={this.state.data.Global.Dark}
            globalAutoDark={this.state.data.Global.AutoDark}
            globalLogAutoDark={this.state.data.Global.LogAutoDark}
            globalShowNotifications={this.state.data.Global.ShowNotifications}
            globalHue={this.state.data.Global.Hue}
            globalContrast={this.state.data.Global.Contrast}
            keyboardShortcut={this.state.data.Global.Shortcut}
          />
        </Collapse>
        <RowWithLink
          text="Questions? "
          linkText="View the wiki!"
          link="https://github.com/simmsa/dark-mode/wiki"
          iconType="help"
        />
        <RowWithLink
          text="Problems? "
          linkText="File an issue!"
          link={`https://github.com/simmsa/dark-mode/issues/new?body=v${chrome.runtime.getManifest()
            .version}`}
          iconType="bug"
        />
        <Footer />
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById("reactContainer"));
