class SettingId {
    // Standardize naming of Fields that are accessed from multiple places
    //
    // Access Field Id:
    // SettingId.CurrentUrl.Dark -> "CurrentUrlDark"
    //
    // Access Field Type:
    // SettingId.Type.Hue -> "boolean"
    //
    // Access Id:
    // SettingId.Id.Dark -> "Dark"
    //
    // Access Title
    // SettingId.Title.CurrentUrl -> "CurrentUrl"

    private static Fields = {
        Id: {
            Name: "Id",
            Type: "string"
        },
        Dark: {
            Name: "Dark",
            Type: "boolean"
        },
        Hue: {
            Name: "Hue",
            Type: "boolean"
        },
        Contrast: {
            Name: "Contrast",
            Type: "number"
        },
        Clear: {
            Name: "Clear",
            Type: "boolean"
        },
        AutoDark: {
            Name: "AutoDark",
            Type: "string"
        },
        Shortcut: {
            Name: "Shortcut",
            Type: "string"
        }

    };

    // Group Titles
    private static CurrentUrlTitle = "CurrentUrl";
    private static StemUrlTitle = "StemUrl";
    private static GlobalTitle = "Global";

    static CurrentUrl = {
        Id: SettingId.CurrentUrlTitle,
        Dark: SettingId.CurrentUrlTitle + SettingId.Fields.Dark.Name,
        Hue: SettingId.CurrentUrlTitle + SettingId.Fields.Hue.Name,
        Contrast: SettingId.CurrentUrlTitle + SettingId.Fields.Contrast.Name,
        Clear: SettingId.CurrentUrlTitle + SettingId.Fields.Clear.Name,
    };

    static StemUrl = {
        Id: SettingId.StemUrlTitle,
        Dark: SettingId.StemUrlTitle + SettingId.Fields.Dark.Name,
        Hue: SettingId.StemUrlTitle + SettingId.Fields.Hue.Name,
        Contrast: SettingId.StemUrlTitle + SettingId.Fields.Contrast.Name,
        Clear: SettingId.StemUrlTitle + SettingId.Fields.Clear.Name,
    };

    static Global = {
        Id: SettingId.GlobalTitle,
        Dark: SettingId.GlobalTitle + SettingId.Fields.Dark.Name,
        Hue: SettingId.GlobalTitle + SettingId.Fields.Hue.Name,
        Contrast: SettingId.GlobalTitle + SettingId.Fields.Contrast.Name,
        Clear: SettingId.GlobalTitle + SettingId.Fields.Clear.Name,
        AutoDark: SettingId.GlobalTitle + SettingId.Fields.AutoDark.Name,
        Shortcut: SettingId.GlobalTitle + SettingId.Fields.Shortcut.Name,
    };

    static Id = {
        CurrentUrl: SettingId.CurrentUrlTitle,
        StemUrl: SettingId.StemUrlTitle,
        Global: SettingId.GlobalTitle,
    };

    static Type = {
        Id: SettingId.Fields.Id.Type,
        Dark: SettingId.Fields.Dark.Type,
        Hue: SettingId.Fields.Hue.Type,
        Contrast: SettingId.Fields.Contrast.Type,
        Clear: SettingId.Fields.Clear.Type,
        AutoDark: SettingId.Fields.AutoDark.Type,
        Shortcut: SettingId.Fields.Shortcut.Type,
    };

}
