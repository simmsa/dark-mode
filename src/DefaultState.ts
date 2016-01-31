/// <reference path="SettingId.ts" />

class DefaultState {
    // Url Strings
    urlFull = "about:blank";
    urlStem = "about:blank";

    // Current Url Settings
    currentUrlDark = SettingId.Default.Dark;
    currentUrlHue = SettingId.Default.Hue;
    currentUrlContrast = SettingId.Default.Contrast;

    // Stem Url Settings
    stemUrlDark = SettingId.Default.Dark;
    stemUrlHue = SettingId.Default.Hue;
    stemUrlContrast = SettingId.Default.Contrast;

    // Global Dark Mode Settings
    globalDark = SettingId.Default.Dark;
    globalAutoDark = SettingId.Default.AutoDark;
    globalShowNotifications = SettingId.Default.ShowNotifications;
    globalHue = SettingId.Default.Hue;
    globalContrast = SettingId.Default.Contrast;
    globalKeyboardShortcut = "init";

    pack(): any{
        var result = {};

        // Current Url
        result[SettingId.Group.CurrentUrl] = {}
        result[SettingId.Group.CurrentUrl][SettingId.Field.Url] = this.urlFull;
        result[SettingId.Group.CurrentUrl][SettingId.Field.Dark] = this.currentUrlDark;
        result[SettingId.Group.CurrentUrl][SettingId.Field.Hue] = this.currentUrlHue;
        result[SettingId.Group.CurrentUrl][SettingId.Field.Contrast] = this.currentUrlContrast;

        // Stem Url
        result[SettingId.Group.StemUrl] = {}
        result[SettingId.Group.StemUrl][SettingId.Field.UrlStem] = this.urlStem;
        result[SettingId.Group.StemUrl][SettingId.Field.Dark] = this.stemUrlDark;
        result[SettingId.Group.StemUrl][SettingId.Field.Hue] = this.stemUrlHue;
        result[SettingId.Group.StemUrl][SettingId.Field.Contrast] = this.stemUrlContrast;

        // Global
        result[SettingId.Group.Global] = {}
        result[SettingId.Group.Global][SettingId.Field.Dark] = this.globalDark;
        result[SettingId.Group.Global][SettingId.Field.AutoDark] = this.globalAutoDark;
        result[SettingId.Group.Global][SettingId.Field.ShowNotifications] = this.globalShowNotifications;
        result[SettingId.Group.Global][SettingId.Field.Hue] = this.globalHue;
        result[SettingId.Group.Global][SettingId.Field.Contrast] = this.globalContrast;
        result[SettingId.Group.Global][SettingId.Field.Shortcut] = this.globalKeyboardShortcut;

        return result;
    }
}
