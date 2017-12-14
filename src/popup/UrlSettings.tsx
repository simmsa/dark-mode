import * as React from "react";

import SettingId from "../SettingId";

import ResetButton from "./ResetButton";
import Slider from "./Slider";
import Switch from "./Switch";

interface UrlSettingsProps {
  urlDark: boolean;
  urlHue: boolean;
  urlContrast: number;
  title: string;
  identifier: string;
  tooltipValue: string;
}

// tslint:disable:max-line-length
class UrlSettings extends React.Component<UrlSettingsProps, {}> {
  public render() {
    return (
      <div>
        <Switch
          title="Dark Mode"
          tooltip="Invert the colors of the current web page."
          group={this.props.identifier}
          field={SettingId.Field.Dark}
          isChecked={this.props.urlDark}
          iconType="darkMode"
        />
        <Switch
          title="Fix Colors"
          tooltip="Invert the hue of all colors, attempting to make the page look 'normal'. Some rotated colors may seem off."
          group={this.props.identifier}
          field={SettingId.Field.Hue}
          isChecked={this.props.urlHue}
          isDisabled={!this.props.urlDark}
          iconType="hue"
        />
        <Slider
          field={SettingId.Field.Contrast}
          tooltip="Adjust the difference between dark and light colors"
          iconType="contrast"
          group={this.props.identifier}
          label="Contrast"
          min={SettingId.Default.ContrastMin}
          max={SettingId.Default.ContrastMax}
          value={this.props.urlContrast}
          isDisabled={!this.props.urlDark}
        />
        <ResetButton group={this.props.identifier} />
      </div>
    );
  }
}

export default UrlSettings;
