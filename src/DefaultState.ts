import SettingId from "./SettingId";

export default class DefaultState {
  // Url Strings
  public urlFull = "about:blank";
  public urlStem = "about:blank";

  // Current Url Settings
  public currentUrlDark = SettingId.Default.Dark;
  public currentUrlHue = SettingId.Default.Hue;
  public currentUrlContrast = SettingId.Default.Contrast;

  // Stem Url Settings
  public stemUrlDark = SettingId.Default.Dark;
  public stemUrlHue = SettingId.Default.Hue;
  public stemUrlContrast = SettingId.Default.Contrast;

  // Global Dark Mode Settings
  public globalDark = SettingId.Default.Dark;
  public globalAutoDark = SettingId.Default.AutoDark;
  public globalLogAutoDark = SettingId.Default.LogAutoDark;
  public globalShowNotifications = SettingId.Default.ShowNotifications;
  public globalHue = SettingId.Default.Hue;
  public globalContrast = SettingId.Default.Contrast;
  public globalKeyboardShortcut = "init";

  public pack(): any {
    const result = {};

    // Current Url
    result[SettingId.Group.CurrentUrl] = {};
    result[SettingId.Group.CurrentUrl][SettingId.Field.Url] = this.urlFull;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Dark
    ] = this.currentUrlDark;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Hue
    ] = this.currentUrlHue;
    result[SettingId.Group.CurrentUrl][
      SettingId.Field.Contrast
    ] = this.currentUrlContrast;

    // Stem Url
    result[SettingId.Group.StemUrl] = {};
    result[SettingId.Group.StemUrl][SettingId.Field.UrlStem] = this.urlStem;
    result[SettingId.Group.StemUrl][SettingId.Field.Dark] = this.stemUrlDark;
    result[SettingId.Group.StemUrl][SettingId.Field.Hue] = this.stemUrlHue;
    result[SettingId.Group.StemUrl][
      SettingId.Field.Contrast
    ] = this.stemUrlContrast;

    // Global
    result[SettingId.Group.Global] = {};
    result[SettingId.Group.Global][SettingId.Field.Dark] = this.globalDark;
    result[SettingId.Group.Global][
      SettingId.Field.AutoDark
    ] = this.globalAutoDark;
    result[SettingId.Group.Global][
      SettingId.Field.LogAutoDark
    ] = this.globalLogAutoDark;
    result[SettingId.Group.Global][
      SettingId.Field.ShowNotifications
    ] = this.globalShowNotifications;
    result[SettingId.Group.Global][SettingId.Field.Hue] = this.globalHue;
    result[SettingId.Group.Global][
      SettingId.Field.Contrast
    ] = this.globalContrast;
    result[SettingId.Group.Global][
      SettingId.Field.Shortcut
    ] = this.globalKeyboardShortcut;

    return result;
  }
}
