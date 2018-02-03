/*
 *  ____             _      __  __           _
 * |  _ \  __ _ _ __| | __ |  \/  | ___   __| | ___
 * | | | |/ _` | '__| |/ / | |\/| |/ _ \ / _` |/ _ \
 * | |_| | (_| | |  |   <  | |  | | (_) | (_| |  __/
 * |____/ \__,_|_|  |_|\_\ |_|  |_|\___/ \__,_|\___|
 *
 * Copyright (c) 2015-present, Andrew Simms
 * Author: Andrew Simms <simms.andrew@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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

// From reactjs.org
// tslint:disable:max-line-length
const fontStack: string = `-apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`;

export const muiTheme = createMuiTheme({
  fontFamily: fontStack,
  palette: {
    primary: cyan,
    type: themeType,
  },
  typography: {
    fontFamily: fontStack,
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
        <div style={{ fontFamily: fontStack }}>
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
            link="https://github.com/simmsa/dark-mode#usage"
            iconType="help"
          />
          <RowWithLink
            text="Problems? "
            linkText="File an issue!"
            link={`https://github.com/simmsa/dark-mode/issues/new?body=v${
              chrome.runtime.getManifest().version
            }`}
            iconType="bug"
          />
          <Footer />
        </div>
      </MuiThemeProvider>
    );
  }
}

ReactDOM.render(<Settings />, document.getElementById("reactContainer"));
