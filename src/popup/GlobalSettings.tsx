import * as React from "react";

import SettingId from "../SettingId";

import Switch from "./Switch";

interface GlobalSettingsProps {
  globalDark: boolean;
  globalAutoDark: boolean;
  globalShowNotifications: boolean;
  globalLogAutoDark: boolean;
  globalHue: boolean;
  globalContrast: number;
  keyboardShortcut: string;
}

// tslint:disable:max-line-length
class GlobalSettings extends React.Component<GlobalSettingsProps, {}> {
  public render() {
    return (
      <div>
        <Switch
          title="Dark Mode"
          group={SettingId.Group.Global}
          field={SettingId.Field.Dark}
          isChecked={this.props.globalDark}
          iconType="darkMode"
          tooltip="Toggle dark mode globally"
        />
        <Switch
          title="Fix Colors"
          group={SettingId.Group.Global}
          field={SettingId.Field.Hue}
          isChecked={this.props.globalHue}
          iconType="hue"
          tooltip="Invert the hue of all colors, attempting to make the page look 'normal'. Some rotated colors may seem off."
        />
        <Switch
          title="Auto Dark"
          group={SettingId.Group.Global}
          field={SettingId.Field.AutoDark}
          isChecked={this.props.globalAutoDark}
          iconType="autoDark"
          tooltip="Automatically check each site and turn off dark mode on sites with dark themes"
        />
        <Switch
          title="Log Auto Dark"
          group={SettingId.Group.Global}
          field={SettingId.Field.LogAutoDark}
          isChecked={this.props.globalLogAutoDark}
          iconType="log"
          tooltip="Log auto dark actions"
        />
        <Switch
          title="Notifications"
          group={SettingId.Group.Global}
          field={SettingId.Field.ShowNotifications}
          isChecked={this.props.globalShowNotifications}
          iconType="notifications"
          tooltip="Show notifications for auto dark actions"
        />
      </div>
    );
  }
}

export default GlobalSettings;
